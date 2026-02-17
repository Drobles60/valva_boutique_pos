// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { requirePermission } from '@/lib/auth/check-permission';

// GET - Obtener historial de abonos de un cliente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('clientes.ver');

    const { id: clienteId } = await params;

    // Verificar que el cliente existe y obtener saldo
    const cliente = await queryOne<any>(
      `SELECT id, nombre, identificacion, telefono, email, saldo_pendiente 
       FROM clientes 
       WHERE id = ? AND estado = 'activo'`,
      [clienteId]
    );

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Obtener todos los abonos del cliente a través de sus cuentas por cobrar
    const abonos = await query<any[]>(
      `SELECT 
        a.id,
        a.monto,
        a.fecha_abono,
        a.metodo_pago,
        a.referencia_transferencia,
        a.notas,
        a.created_at,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        cpc.id as cuenta_id,
        cpc.monto_total as cuenta_monto_total,
        cpc.saldo_pendiente as saldo_actual_factura,
        v.numero_venta
      FROM abonos a
      INNER JOIN cuentas_por_cobrar cpc ON a.cuenta_por_cobrar_id = cpc.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN ventas v ON cpc.venta_id = v.id
      WHERE cpc.cliente_id = ?
      ORDER BY a.fecha_abono DESC, a.created_at DESC`,
      [clienteId]
    );

    // Formatear los abonos
    const abonosFormateados = abonos.map(a => ({
      id: a.id,
      monto: Number(a.monto),
      fecha: a.fecha_abono || a.created_at,
      metodoPago: a.metodo_pago,
      referencia: a.referencia_transferencia,
      notas: a.notas,
      usuario: `${a.usuario_nombre || 'Sistema'} ${a.usuario_apellido || ''}`.trim(),
      cuenta_id: a.cuenta_id,
      numero_venta: a.numero_venta,
      monto_factura: Number(a.cuenta_monto_total),
      saldo_actual_factura: Number(a.saldo_actual_factura)
    }));

    // Calcular resumen
    const totalAbonado = abonosFormateados.reduce((sum, abono) => sum + abono.monto, 0);
    const cantidadAbonos = abonosFormateados.length;

    return NextResponse.json({
      success: true,
      data: {
        cliente: {
          id: cliente.id,
          nombre: cliente.nombre,
          identificacion: cliente.identificacion,
          telefono: cliente.telefono,
          email: cliente.email,
          saldo_pendiente: Number(cliente.saldo_pendiente)
        },
        abonos: abonosFormateados,
        resumen: {
          total_abonado: totalAbonado,
          cantidad_abonos: cantidadAbonos,
          saldo_pendiente: Number(cliente.saldo_pendiente)
        }
      }
    });

  } catch (error: any) {
    console.error('Error al obtener abonos:', error);
    
    if (error.message?.includes('iniciar sesión')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al obtener abonos' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}

// POST - Registrar un nuevo abono para un cliente (distribuye entre sus cuentas pendientes)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('clientes.abonar');

    const { id: clienteId } = await params;
    const body = await request.json();
    const {
      monto,
      metodo_pago,
      referencia_transferencia,
      notas,
      usuario_id
    } = body;

    // Validaciones
    if (!monto || monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    if (!metodo_pago) {
      return NextResponse.json(
        { error: 'El método de pago es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el cliente existe
    const cliente = await queryOne<any>(
      `SELECT id, nombre, saldo_pendiente 
       FROM clientes 
       WHERE id = ? AND estado = 'activo'`,
      [clienteId]
    );

    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Validar que el monto no exceda el saldo pendiente total del cliente (usar valor absoluto por si hay saldos negativos)
    const saldoClienteAbsoluto = Math.abs(cliente.saldo_pendiente)
    if (monto > saldoClienteAbsoluto) {
      return NextResponse.json(
        { error: `El monto ($${monto.toFixed(2)}) no puede exceder el saldo pendiente total ($${saldoClienteAbsoluto.toFixed(2)})` },
        { status: 400 }
      );
    }

    // Obtener todas las cuentas pendientes del cliente ordenadas por fecha (más antiguas primero)
    const cuentasPendientes = await query<any[]>(
      `SELECT cpc.id, cpc.venta_id, cpc.monto_total, cpc.saldo_pendiente, 
              v.numero_venta, cpc.fecha_vencimiento, cpc.created_at
       FROM cuentas_por_cobrar cpc
       INNER JOIN ventas v ON cpc.venta_id = v.id
       WHERE cpc.cliente_id = ? AND ABS(cpc.saldo_pendiente) > 0
       ORDER BY cpc.created_at ASC`,
      [clienteId]
    );

    if (cuentasPendientes.length === 0) {
      return NextResponse.json(
        { error: 'No hay cuentas con saldo pendiente para este cliente' },
        { status: 404 }
      );
    }

    let montoRestante = monto;
    const abonosRealizados: any[] = [];

    // Distribuir el abono entre las cuentas (primero las más antiguas)
    for (const cuenta of cuentasPendientes) {
      if (montoRestante <= 0) break;

      // Calcular cuánto abonar a esta cuenta (usar valor absoluto por si hay saldos negativos)
      const saldoCuentaAbsoluto = Math.abs(cuenta.saldo_pendiente)
      const montoAbono = Math.min(montoRestante, saldoCuentaAbsoluto);
      const saldoAnterior = cuenta.saldo_pendiente;

      // Registrar el abono
      await query(
        `INSERT INTO abonos (
          cuenta_por_cobrar_id,
          monto,
          metodo_pago,
          referencia_transferencia,
          notas,
          usuario_id,
          fecha_abono
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          cuenta.id,
          montoAbono,
          metodo_pago,
          referencia_transferencia || null,
          notas || null,
          usuario_id || null
        ]
      );

      // El trigger actualizar_saldo_cliente_abono actualizará automáticamente:
      // - cuenta.saldo_pendiente
      // - cuenta.estado (a 'pagada' si saldo_pendiente = 0)
      // - cliente.saldo_pendiente

      abonosRealizados.push({
        cuenta_id: cuenta.id,
        numero_venta: cuenta.numero_venta,
        monto_abonado: montoAbono,
        saldo_anterior: saldoAnterior,
        nuevo_saldo: saldoAnterior - montoAbono
      });

      montoRestante -= montoAbono;
    }

    // Obtener el nuevo saldo del cliente después de los abonos
    const clienteActualizado = await queryOne<any>(
      'SELECT saldo_pendiente FROM clientes WHERE id = ?',
      [clienteId]
    );

    const resultado = {
      success: true,
      message: 'Abono registrado y distribuido exitosamente',
      data: {
        cliente_nombre: cliente.nombre,
        monto_total: monto,
        monto_aplicado: monto - montoRestante,
        monto_sobrante: montoRestante,
        cuentas_afectadas: abonosRealizados.length,
        cliente_saldo_pendiente: clienteActualizado.saldo_pendiente,
        detalle: abonosRealizados
      }
    };

    return NextResponse.json(resultado, { status: 201 });

  } catch (error: any) {
    console.error('Error al registrar abono:', error);
    
    if (error.message?.includes('iniciar sesión')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al registrar abono' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}
