// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { requirePermission } from '@/lib/auth/check-permission';

// GET - Obtener todas las ventas
export async function GET() {
  try {
    await requirePermission('ventas.ver');

    const ventas = await query<any[]>(
      `SELECT v.*, 
              c.nombre as cliente_nombre,
              u.nombre as vendedor_nombre,
              u.apellido as vendedor_apellido
       FROM ventas v
       LEFT JOIN clientes c ON v.cliente_id = c.id
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       ORDER BY v.fecha_venta DESC
       LIMIT 100`
    );

    return NextResponse.json({ success: true, data: ventas });
  } catch (error: any) {
    console.error('Error al obtener ventas:', error);
    
    if (error.message?.includes('iniciar sesión')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al obtener ventas' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}

// POST - Crear nueva venta
export async function POST(request: NextRequest) {
  try {
    await requirePermission('ventas.crear');
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      cliente_id,
      tipo_venta,
      metodo_pago,
      productos,
      subtotal,
      iva,
      descuento,
      total,
      descuento_id,
      efectivo_recibido,
      cambio,
      pago_mixto,
      abono,
      referencia_transferencia
    } = body;

    // Validaciones
    if (!productos || productos.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un producto' },
        { status: 400 }
      );
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: 'El total debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Obtener usuario_id del session
    const usuario_id = (session.user as any).id;

    // Generar número de venta
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    
    // Obtener el último número de venta del día
    const ultimaVenta = await queryOne<any>(
      `SELECT numero_venta FROM ventas 
       WHERE DATE(fecha_venta) = CURDATE() 
       ORDER BY id DESC LIMIT 1`
    );
    
    let numeroSecuencial = 1;
    if (ultimaVenta && ultimaVenta.numero_venta) {
      const match = ultimaVenta.numero_venta.match(/-(\d+)$/);
      if (match) {
        numeroSecuencial = parseInt(match[1]) + 1;
      }
    }
    
    const numero_venta = `VEN-${año}${mes}${dia}-${String(numeroSecuencial).padStart(4, '0')}`;

    // Obtener caja_id (por ahora usar la primera caja activa)
    const caja = await queryOne<any>(
      `SELECT id FROM cajas WHERE estado = 'activa' LIMIT 1`
    );
    
    const caja_id = caja?.id || null;

    // Verificar stock disponible
    for (const item of productos) {
      const producto = await queryOne<any>(
        'SELECT id, nombre, stock_actual FROM productos WHERE id = ?',
        [item.producto_id]
      );

      if (!producto) {
        return NextResponse.json(
          { error: `Producto con ID ${item.producto_id} no encontrado` },
          { status: 400 }
        );
      }

      if (producto.stock_actual < item.cantidad) {
        return NextResponse.json(
          { 
            error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock_actual}, Requerido: ${item.cantidad}` 
          },
          { status: 400 }
        );
      }
    }

    // Insertar venta
    const resultVenta = await query<any>(
      `INSERT INTO ventas (
        numero_venta, cliente_id, fecha_venta, subtotal, iva, descuento, total,
        estado, descuento_id, usuario_id, caja_id, tipo_venta, metodo_pago,
        efectivo_recibido, cambio, referencia_transferencia
      ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        numero_venta,
        cliente_id || null,
        subtotal || 0,
        iva || 0,
        descuento || 0,
        total,
        tipo_venta === 'credito' ? 'credito' : 'completada',
        descuento_id || null,
        usuario_id,
        caja_id,
        tipo_venta || 'contado',
        metodo_pago || 'efectivo',
        efectivo_recibido || null,
        cambio || null,
        referencia_transferencia || null
      ]
    );

    const venta_id = (resultVenta as any).insertId;

    // Si es pago mixto, registrar desglose
    if (metodo_pago === 'mixto' && pago_mixto) {
      await query(
        `INSERT INTO pagos_mixtos_ventas (
          venta_id, monto_efectivo, monto_transferencia, referencia_transferencia
        ) VALUES (?, ?, ?, ?)`,
        [
          venta_id,
          pago_mixto.efectivo || 0,
          pago_mixto.transferencia || 0,
          referencia_transferencia || null
        ]
      );
    }

    // Insertar detalles de venta y actualizar stock
    for (const item of productos) {
      // Obtener stock actual antes de actualizar
      const productoActual = await queryOne<any>(
        'SELECT stock_actual FROM productos WHERE id = ?',
        [item.producto_id]
      );
      const stock_anterior = productoActual?.stock_actual || 0;
      const stock_nuevo = stock_anterior - item.cantidad;

      // Insertar detalle
      await query(
        `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          venta_id,
          item.producto_id,
          item.cantidad,
          item.precio_unitario,
          item.cantidad * item.precio_unitario
        ]
      );

      // Actualizar stock
      await query(
        `UPDATE productos 
         SET stock_actual = stock_actual - ? 
         WHERE id = ?`,
        [item.cantidad, item.producto_id]
      );

      // Registrar movimiento de inventario
      await query(
        `INSERT INTO movimientos_inventario (
          producto_id, tipo_movimiento, cantidad, stock_anterior, 
          stock_nuevo, motivo, venta_id, usuario_id, fecha_movimiento
        ) VALUES (?, 'salida_venta', ?, ?, ?, 'Venta', ?, ?, NOW())`,
        [item.producto_id, -item.cantidad, stock_anterior, stock_nuevo, venta_id, usuario_id]
      );
    }

    // Si es venta a crédito, crear registro de cuenta por cobrar
    if (tipo_venta === 'credito' && cliente_id) {
      // IMPORTANTE: saldo_pendiente inicial debe ser el total completo
      // El trigger actualizar_saldo_cliente_abono se encargará de restar el abono cuando se inserte
      const resultCuenta = await query(
        `INSERT INTO cuentas_por_cobrar (
          cliente_id, venta_id, monto_total, saldo_pendiente, 
          fecha_vencimiento, estado
        ) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), 'pendiente')`,
        [
          cliente_id, 
          venta_id, 
          total, 
          total  // Siempre usar el total completo, el trigger restará el abono después
        ]
      );

      const cuenta_por_cobrar_id = (resultCuenta as any).insertId;

      // Si hay abono inicial, registrarlo
      if (abono && abono.monto > 0) {
        const resultAbono = await query(
          `INSERT INTO abonos (
            cuenta_por_cobrar_id, monto, metodo_pago, usuario_id, notas, referencia_transferencia
          ) VALUES (?, ?, ?, ?, 'Abono inicial', ?)`,
          [
            cuenta_por_cobrar_id,
            abono.monto,
            abono.metodo,
            usuario_id,
            abono.referenciaTransferencia || null
          ]
        );

        const abono_id = (resultAbono as any).insertId;

        // Si el abono es mixto, registrar desglose
        if (abono.metodo === 'mixto') {
          await query(
            `INSERT INTO pagos_mixtos_abonos (
              abono_id, monto_efectivo, monto_transferencia, referencia_transferencia
            ) VALUES (?, ?, ?, ?)`,
            [
              abono_id,
              abono.montoEfectivo || 0,
              abono.montoTransferencia || 0,
              abono.referenciaTransferencia || null
            ]
          );
        }
      }

      // Actualizar saldo del cliente
      // IMPORTANTE: Se suma el total completo
      // El trigger actualizar_saldo_cliente_abono se encargará de restar el abono del saldo
      await query(
        `UPDATE clientes 
         SET saldo_pendiente = saldo_pendiente + ?,
             saldo_actual = saldo_actual + ?
         WHERE id = ?`,
        [total, total, cliente_id]
      );
    }

    // Si hay sesión de caja abierta, registrar movimiento
    if (caja_id && tipo_venta === 'contado') {
      const sesionCaja = await queryOne<any>(
        `SELECT id FROM sesiones_caja 
         WHERE caja_id = ? AND estado = 'abierta' AND usuario_id = ?
         ORDER BY fecha_apertura DESC LIMIT 1`,
        [caja_id, usuario_id]
      );

      if (sesionCaja) {
        await query(
          `INSERT INTO movimientos_caja (
            sesion_caja_id, tipo_movimiento, monto, venta_id, 
            usuario_id, fecha_movimiento
          ) VALUES (?, 'venta', ?, ?, ?, NOW())`,
          [sesionCaja.id, total, venta_id, usuario_id]
        );
      }
    }

    // Obtener la venta completa con detalles
    const ventaCompleta = await queryOne<any>(
      `SELECT v.*, 
              c.nombre as cliente_nombre,
              c.identificacion as cliente_identificacion,
              c.telefono as cliente_telefono,
              c.direccion as cliente_direccion,
              u.nombre as vendedor_nombre,
              u.apellido as vendedor_apellido,
              cpc.monto_total as credito_monto_total,
              cpc.saldo_pendiente as credito_saldo_pendiente,
              (SELECT COALESCE(SUM(a.monto), 0) 
               FROM abonos a 
               WHERE a.cuenta_por_cobrar_id = cpc.id) as credito_abono_total
       FROM ventas v
       LEFT JOIN clientes c ON v.cliente_id = c.id
       LEFT JOIN usuarios u ON v.usuario_id = u.id
       LEFT JOIN cuentas_por_cobrar cpc ON v.id = cpc.venta_id
       WHERE v.id = ?`,
      [venta_id]
    );

    // Obtener detalles de la venta
    const detalles = await query<any[]>(
      `SELECT dv.*, 
              p.nombre as producto_nombre,
              p.sku,
              p.codigo_barras
       FROM detalle_ventas dv
       INNER JOIN productos p ON dv.producto_id = p.id
       WHERE dv.venta_id = ?`,
      [venta_id]
    );

    ventaCompleta.detalles = detalles;

    return NextResponse.json({
      success: true,
      data: ventaCompleta,
      message: 'Venta registrada exitosamente'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error al crear venta:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear venta' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}
