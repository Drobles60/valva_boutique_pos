import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Abonar a un proveedor (distribuye el abono entre sus pedidos pendientes)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proveedorId = parseInt(id);
    const body = await request.json();
    const { 
      monto,
      metodoPago = 'efectivo',
      referencia,
      notas,
      usuarioId
    } = body;

    // Validaciones
    if (!monto || monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      );
    }

    // Obtener todos los pedidos pendientes del proveedor con saldo pendiente
    const pedidosPendientes = await query<any[]>(
      `SELECT id, numero_pedido, costo_total, total_abonado, saldo_pendiente
       FROM pedidos
       WHERE proveedor_id = ? AND saldo_pendiente > 0
       ORDER BY fecha_pedido ASC`,
      [proveedorId]
    );

    if (pedidosPendientes.length === 0) {
      return NextResponse.json(
        { error: 'No hay pedidos con saldo pendiente para este proveedor' },
        { status: 404 }
      );
    }

    let montoRestante = monto;
    const abonosRealizados: any[] = [];

    // Distribuir el abono entre los pedidos (primero los más antiguos)
    for (const pedido of pedidosPendientes) {
      if (montoRestante <= 0) break;

      // Calcular cuánto abonar a este pedido
      const montoAbono = Math.min(montoRestante, pedido.saldo_pendiente);

      // Registrar el abono
      const result = await query<any>(
        `INSERT INTO abonos_pedidos (
          pedido_id, monto, metodo_pago, referencia, notas, usuario_id
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          pedido.id,
          montoAbono,
          metodoPago,
          referencia || null,
          notas || null,
          usuarioId || null
        ]
      );

      abonosRealizados.push({
        pedido_id: pedido.id,
        numero_pedido: pedido.numero_pedido,
        monto_abonado: montoAbono,
        saldo_anterior: pedido.saldo_pendiente,
        nuevo_saldo: pedido.saldo_pendiente - montoAbono
      });

      montoRestante -= montoAbono;
    }

    // Si sobró dinero, significa que se cubrieron todos los pedidos
    const resultado = {
      success: true,
      monto_total: monto,
      monto_aplicado: monto - montoRestante,
      monto_sobrante: montoRestante,
      pedidos_afectados: abonosRealizados.length,
      detalle: abonosRealizados
    };

    return NextResponse.json(resultado, { status: 201 });
  } catch (error: any) {
    console.error('Error al procesar abono a proveedor:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar abono' },
      { status: 500 }
    );
  }
}

// GET - Obtener historial de abonos de un proveedor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const proveedorId = parseInt(id);

    const abonos = await query<any[]>(
      `SELECT 
        ap.id,
        ap.monto,
        ap.fecha_abono,
        ap.metodo_pago,
        ap.referencia,
        ap.notas,
        p.numero_pedido,
        p.id as pedido_id,
        u.nombre as usuario_nombre
       FROM abonos_pedidos ap
       JOIN pedidos p ON ap.pedido_id = p.id
       LEFT JOIN usuarios u ON ap.usuario_id = u.id
       WHERE p.proveedor_id = ?
       ORDER BY ap.fecha_abono DESC`,
      [proveedorId]
    );

    return NextResponse.json(abonos);
  } catch (error: any) {
    console.error('Error al obtener abonos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener abonos' },
      { status: 500 }
    );
  }
}
