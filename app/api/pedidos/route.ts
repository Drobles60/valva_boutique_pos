import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Obtener todos los pedidos
export async function GET() {
  try {
    const pedidos = await query<any[]>(
      `SELECT p.id, p.numero_pedido, p.proveedor_id, p.fecha_pedido, p.costo_total,
              p.total_abonado, p.saldo_pendiente,
              p.estado, p.fecha_recibido, p.usuario_id, p.notas, p.created_at, p.updated_at,
              pr.razon_social as proveedor_nombre, pr.codigo as proveedor_codigo
       FROM pedidos p
       LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
       ORDER BY p.created_at DESC`
    );

    // Obtener detalles de cada pedido
    for (const pedido of pedidos) {
      const detalles = await query<any[]>(
        `SELECT id, descripcion, cantidad, precio_total
         FROM detalle_pedidos
         WHERE pedido_id = ?`,
        [pedido.id]
      );
      pedido.detalles = detalles;
    }

    return NextResponse.json(pedidos);
  } catch (error: any) {
    console.error('Error al obtener pedidos:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      proveedorId, 
      fechaPedido,
      costoTotal,
      detalles,
      notas,
      usuarioId
    } = body;

    // Validaciones básicas
    if (!proveedorId || !fechaPedido || !costoTotal || !detalles || detalles.length === 0) {
      return NextResponse.json(
        { error: 'Proveedor, fecha, costo y detalles son obligatorios' },
        { status: 400 }
      );
    }

    // Generar número de pedido
    const ultimoPedido = await query<any[]>(
      'SELECT numero_pedido FROM pedidos ORDER BY id DESC LIMIT 1'
    );

    let numeroPedido;
    if (ultimoPedido.length === 0) {
      numeroPedido = 'PED-001';
    } else {
      const ultimoNumero = parseInt(ultimoPedido[0].numero_pedido.split('-')[1]);
      numeroPedido = `PED-${(ultimoNumero + 1).toString().padStart(3, '0')}`;
    }

    // Insertar el pedido con saldo_pendiente igual al costo_total
    const result = await query<any>(
      `INSERT INTO pedidos (
        numero_pedido, proveedor_id, fecha_pedido, costo_total, total_abonado, saldo_pendiente, estado, usuario_id, notas
      ) VALUES (?, ?, ?, ?, 0, ?, 'pendiente', ?, ?)`,
      [numeroPedido, proveedorId, fechaPedido, costoTotal, costoTotal, usuarioId || null, notas || null]
    );

    const pedidoId = result.insertId;

    // Insertar los detalles
    for (const detalle of detalles) {
      await query(
        `INSERT INTO detalle_pedidos (
          pedido_id, descripcion, cantidad, precio_total
        ) VALUES (?, ?, ?, ?)`,
        [pedidoId, detalle.descripcion, detalle.cantidad, detalle.precioTotal]
      );
    }

    // Obtener el pedido recién creado con sus detalles
    const nuevoPedido = await query<any[]>(
      `SELECT p.id, p.numero_pedido, p.proveedor_id, p.fecha_pedido, p.costo_total,
              p.estado, p.fecha_recibido, p.usuario_id, p.notas, p.created_at, p.updated_at,
              pr.razon_social as proveedor_nombre, pr.codigo as proveedor_codigo
       FROM pedidos p
       LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
       WHERE p.id = ?`,
      [pedidoId]
    );

    const detallesPedido = await query<any[]>(
      `SELECT id, descripcion, cantidad, precio_total
       FROM detalle_pedidos
       WHERE pedido_id = ?`,
      [pedidoId]
    );

    nuevoPedido[0].detalles = detallesPedido;

    return NextResponse.json(nuevoPedido[0], { status: 201 });
  } catch (error: any) {
    console.error('Error al crear pedido:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear pedido' },
      { status: 500 }
    );
  }
}

// PATCH - Cambiar estado de pedido a "recibido"
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID del pedido es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar que el pedido existe y está pendiente
    const pedido = await query<any[]>(
      'SELECT id, estado FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedido.length === 0) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    if (pedido[0].estado === 'recibido') {
      return NextResponse.json(
        { error: 'Este pedido ya fue marcado como recibido y no puede modificarse' },
        { status: 400 }
      );
    }

    // Actualizar estado a recibido con la fecha actual
    await query(
      `UPDATE pedidos SET estado = 'recibido', fecha_recibido = NOW() WHERE id = ?`,
      [id]
    );

    // Obtener el pedido actualizado
    const pedidoActualizado = await query<any[]>(
      `SELECT p.id, p.numero_pedido, p.proveedor_id, p.fecha_pedido, p.costo_total,
              p.estado, p.fecha_recibido, p.usuario_id, p.notas, p.created_at, p.updated_at,
              pr.razon_social as proveedor_nombre, pr.codigo as proveedor_codigo
       FROM pedidos p
       LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
       WHERE p.id = ?`,
      [id]
    );

    const detalles = await query<any[]>(
      `SELECT id, descripcion, cantidad, precio_total
       FROM detalle_pedidos
       WHERE pedido_id = ?`,
      [id]
    );

    pedidoActualizado[0].detalles = detalles;

    return NextResponse.json(pedidoActualizado[0]);
  } catch (error: any) {
    console.error('Error al actualizar estado de pedido:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar estado de pedido' },
      { status: 500 }
    );
  }
}
