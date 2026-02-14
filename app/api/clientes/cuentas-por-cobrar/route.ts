// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requirePermission } from '@/lib/auth/check-permission';

// GET - Obtener clientes con cuentas por cobrar agrupadas
export async function GET(request: NextRequest) {
  try {
    await requirePermission('clientes.ver');

    // Obtener clientes con sus deudas agrupadas
    const clientes = await query<any[]>(
      `SELECT 
        c.id,
        c.nombre,
        c.identificacion,
        c.telefono,
        c.saldo_pendiente,
        COUNT(cpc.id) as total_cuentas,
        COUNT(CASE WHEN cpc.estado = 'pendiente' THEN 1 END) as cuentas_pendientes,
        COUNT(CASE WHEN cpc.estado = 'vencida' THEN 1 END) as cuentas_vencidas,
        MIN(cpc.fecha_vencimiento) as fecha_vencimiento_proxima,
        SUM(cpc.monto_total) as monto_total_creditos,
        SUM(CASE WHEN cpc.estado = 'pendiente' THEN (
          SELECT COALESCE(SUM(a.monto), 0) 
          FROM abonos a 
          WHERE a.cuenta_por_cobrar_id = cpc.id
        ) ELSE 0 END) as total_abonado
      FROM clientes c
      INNER JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      WHERE c.estado = 'activo' AND cpc.saldo_pendiente > 0
      GROUP BY c.id, c.nombre, c.identificacion, c.telefono, c.saldo_pendiente
      ORDER BY c.saldo_pendiente DESC, c.nombre ASC`,
      []
    );

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
