// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requirePermission } from '@/lib/auth/check-permission';

// GET - Obtener cuentas por cobrar de un cliente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('clientes.ver');

    const { id: clienteId } = await params;

    // Obtener todas las cuentas por cobrar del cliente (incluidas las pagadas para historial)
    const cuentas = await query<any[]>(
      `SELECT 
        cpc.id,
        cpc.venta_id,
        cpc.monto_total,
        cpc.saldo_pendiente,
        cpc.fecha_vencimiento,
        cpc.estado,
        cpc.created_at,
        v.numero_venta,
        v.fecha_venta,
        (SELECT COALESCE(SUM(a.monto), 0) 
         FROM abonos a 
         WHERE a.cuenta_por_cobrar_id = cpc.id) as total_abonado,
        (SELECT COUNT(*) 
         FROM abonos a 
         WHERE a.cuenta_por_cobrar_id = cpc.id) as cantidad_abonos
      FROM cuentas_por_cobrar cpc
      INNER JOIN ventas v ON cpc.venta_id = v.id
      WHERE cpc.cliente_id = ?
      ORDER BY cpc.estado ASC, cpc.fecha_vencimiento ASC, cpc.created_at DESC`,
      [clienteId]
    );

    // Formatear las cuentas
    const cuentasFormateadas = cuentas.map(c => ({
      id: c.id,
      venta_id: c.venta_id,
      numero_venta: c.numero_venta,
      fecha_venta: c.fecha_venta,
      monto_total: Number(c.monto_total),
      saldo_pendiente: Number(c.saldo_pendiente),
      total_abonado: Number(c.total_abonado),
      cantidad_abonos: c.cantidad_abonos,
      fecha_vencimiento: c.fecha_vencimiento,
      estado: c.estado,
      created_at: c.created_at
    }));

    return NextResponse.json({
      success: true,
      data: cuentasFormateadas
    });

  } catch (error: any) {
    console.error('Error al obtener cuentas por cobrar:', error);
    
    if (error.message?.includes('iniciar sesión')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al obtener cuentas por cobrar' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}
