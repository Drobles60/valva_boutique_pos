import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Registrar un abono a un pedido específico
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedidoId = parseInt(id);
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

    // Verificar que el pedido existe
    const pedido = await query<any[]>(
      `SELECT id, numero_pedido, costo_total, total_abonado, saldo_pendiente
       FROM pedidos
       WHERE id = ?`,
      [pedidoId]
    );

    if (pedido.length === 0) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    const pedidoData = pedido[0];

    if (monto > pedidoData.saldo_pendiente) {
      return NextResponse.json(
        { error: 'El monto del abono no puede ser mayor al saldo pendiente' },
        { status: 400 }
      );
    }

    // Registrar el abono
    const result = await query<any>(
      `INSERT INTO abonos_pedidos (
        pedido_id, monto, metodo_pago, referencia, notas, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        pedidoId,
        monto,
        metodoPago,
        referencia || null,
        notas || null,
        usuarioId || null
      ]
    );

    await query(
      `UPDATE pedidos
       SET total_abonado = total_abonado + ?,
           saldo_pendiente = GREATEST(saldo_pendiente - ?, 0)
       WHERE id = ?`,
      [monto, monto, pedidoId]
    )

    // Obtener el pedido actualizado
    const pedidoActualizado = await query<any[]>(
      `SELECT id, numero_pedido, costo_total, total_abonado, saldo_pendiente
       FROM pedidos
       WHERE id = ?`,
      [pedidoId]
    );

    return NextResponse.json({
      success: true,
      abono_id: result.insertId,
      pedido: pedidoActualizado[0]
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error al registrar abono:', error);
    return NextResponse.json(
      { error: error.message || 'Error al registrar abono' },
      { status: 500 }
    );
  }
}

// GET - Obtener historial de abonos de un pedido
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedidoId = parseInt(id);

    const abonos = await query<any[]>(
      `SELECT 
        ap.id,
        ap.monto,
        ap.fecha_abono,
        ap.metodo_pago,
        ap.referencia,
        ap.notas,
        u.nombre as usuario_nombre
       FROM abonos_pedidos ap
       LEFT JOIN usuarios u ON ap.usuario_id = u.id
       WHERE ap.pedido_id = ?
       ORDER BY ap.fecha_abono DESC`,
      [pedidoId]
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
