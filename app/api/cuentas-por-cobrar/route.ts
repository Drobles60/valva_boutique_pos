// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { requirePermission } from '@/lib/auth/check-permission'

// GET - Listar todas las cuentas por cobrar con información del cliente
export async function GET(request: NextRequest) {
  try {
    await requirePermission('clientes.ver')

    // Obtener parámetros de fecha de la URL
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    // Construir la consulta con filtros de fecha opcionales
    let sqlQuery = `SELECT 
        cpc.id,
        cpc.venta_id,
        cpc.cliente_id,
        cpc.monto_total,
        GREATEST(cpc.monto_total - COALESCE(a.total_abonado, 0), 0) as saldo_pendiente,
        cpc.fecha_vencimiento,
        cpc.estado,
        cpc.created_at,
        v.numero_venta,
        v.fecha_venta,
        c.nombre as cliente_nombre,
        c.identificacion as cliente_identificacion,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        LEAST(COALESCE(a.total_abonado, 0), cpc.monto_total) as total_abonado,
        COALESCE(a.cantidad_abonos, 0) as cantidad_abonos
      FROM cuentas_por_cobrar cpc
      INNER JOIN ventas v ON cpc.venta_id = v.id
      INNER JOIN clientes c ON cpc.cliente_id = c.id
      LEFT JOIN (
        SELECT cuenta_por_cobrar_id,
               COALESCE(SUM(monto), 0) as total_abonado,
               COUNT(*) as cantidad_abonos
        FROM abonos
        GROUP BY cuenta_por_cobrar_id
      ) a ON a.cuenta_por_cobrar_id = cpc.id`
    
    const queryParams: any[] = []
    const whereConditions: string[] = []
    
    if (fechaInicio) {
      whereConditions.push(`DATE(v.fecha_venta) >= ?`)
      queryParams.push(fechaInicio)
    }
    
    if (fechaFin) {
      whereConditions.push(`DATE(v.fecha_venta) <= ?`)
      queryParams.push(fechaFin)
    }
    
    if (whereConditions.length > 0) {
      sqlQuery += ` WHERE ${whereConditions.join(' AND ')}`
    }
    
    sqlQuery += ` ORDER BY cpc.created_at DESC, cpc.estado ASC`

    const cuentas = await query(sqlQuery, queryParams)

    return NextResponse.json({
      success: true,
      data: cuentas
    })
  } catch (error: any) {
    console.error('Error al obtener cuentas por cobrar:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al obtener cuentas por cobrar'
      },
      { status: error.status || 500 }
    )
  }
}
