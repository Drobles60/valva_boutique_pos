// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requirePermission } from '@/lib/auth/check-permission';

// GET - Obtener clientes con cuentas por cobrar agrupadas
export async function GET(request: NextRequest) {
  try {
    await requirePermission('clientes.ver');

    // Parámetro de depuración
    const { searchParams } = new URL(request.url);
    const debug = searchParams.get('debug') === 'true';

    // Obtener clientes con sus deudas agrupadas
    const clientes = await query<any[]>(
      `SELECT 
        c.id,
        c.nombre,
        c.identificacion,
        c.telefono,
        COALESCE(SUM(GREATEST(cpc.monto_total - COALESCE(a.total_abonado, 0), 0)), 0) as saldo_pendiente,
        COUNT(DISTINCT cpc.id) as total_cuentas,
        COUNT(DISTINCT CASE WHEN (cpc.monto_total - COALESCE(a.total_abonado, 0)) > 0 THEN cpc.id END) as cuentas_pendientes,
        COUNT(DISTINCT CASE WHEN cpc.estado = 'vencida' AND (cpc.monto_total - COALESCE(a.total_abonado, 0)) > 0 THEN cpc.id END) as cuentas_vencidas,
        MIN(CASE WHEN (cpc.monto_total - COALESCE(a.total_abonado, 0)) > 0 THEN cpc.fecha_vencimiento END) as fecha_vencimiento_proxima,
        SUM(cpc.monto_total) as monto_total_creditos,
        SUM(LEAST(COALESCE(a.total_abonado, 0), cpc.monto_total)) as total_abonado
      FROM clientes c
      INNER JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      LEFT JOIN (
        SELECT cuenta_por_cobrar_id, COALESCE(SUM(monto), 0) as total_abonado
        FROM abonos
        GROUP BY cuenta_por_cobrar_id
      ) a ON a.cuenta_por_cobrar_id = cpc.id
      WHERE c.estado = 'activo'
      GROUP BY c.id, c.nombre, c.identificacion, c.telefono
      HAVING COALESCE(SUM(GREATEST(cpc.monto_total - COALESCE(a.total_abonado, 0), 0)), 0) > 0
      ORDER BY saldo_pendiente DESC, c.nombre ASC`,
      []
    );

    // Si está en modo debug, incluir el detalle de facturas
    if (debug) {
      const clientesConDetalle = await Promise.all(
        clientes.map(async (cliente) => {
          const facturas = await query<any[]>(
            `SELECT 
              cpc.id,
              v.numero_venta,
              cpc.monto_total,
              cpc.saldo_pendiente,
              cpc.estado,
              cpc.fecha_vencimiento
            FROM cuentas_por_cobrar cpc
            LEFT JOIN ventas v ON cpc.venta_id = v.id
            WHERE cpc.cliente_id = ?
              AND cpc.saldo_pendiente > 0
            ORDER BY cpc.fecha_vencimiento ASC`,
            [cliente.id]
          );
          
          return {
            ...cliente,
            facturas_detalle: facturas
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        debug: true,
        data: clientesConDetalle
      });
    }

    // Calcular días de vencimiento para cada cliente
    const clientesConDias = clientes.map(cliente => {
      const fechaVencimiento = new Date(cliente.fecha_vencimiento_proxima);
      const hoy = new Date();
      const diferencia = Math.floor((hoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...cliente,
        dias_vencimiento: diferencia > 0 ? diferencia : 0,
        tiene_vencidas: cliente.cuentas_vencidas > 0
      };
    });

    return NextResponse.json({
      success: true,
      data: clientesConDias
    });

  } catch (error: any) {
    console.error('Error al obtener clientes con cuentas por cobrar:', error);
    
    if (error.message?.includes('iniciar sesión')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al obtener clientes' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}
