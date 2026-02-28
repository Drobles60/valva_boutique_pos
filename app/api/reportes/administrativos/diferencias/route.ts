import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { ReporteDiferencias } from '@/types/reportes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { error: 'Fechas de inicio y fin son requeridas' },
        { status: 400 }
      )
    }

    // Obtener sesiones de caja cerradas con sus diferencias
    const sesiones = await query<any[]>(`
      SELECT 
        sc.id as sesion_id,
        DATE(sc.fecha_cierre) as fecha,
        u.nombre as usuario,
        sc.monto_base,
        sc.efectivo_contado,
        sc.notas_cierre,
        (
          sc.monto_base + 
          COALESCE((
            SELECT SUM(v.total)
            FROM ventas v
            WHERE v.fecha_venta BETWEEN sc.fecha_apertura AND sc.fecha_cierre
              AND v.metodo_pago = 'efectivo'
              AND v.estado = 'completada'
          ), 0) +
          COALESCE((
            SELECT SUM(a.monto)
            FROM abonos a
            WHERE a.fecha_abono BETWEEN sc.fecha_apertura AND sc.fecha_cierre
              AND a.metodo_pago = 'efectivo'
          ), 0) -
          COALESCE((
            SELECT SUM(g.monto)
            FROM gastos g
            WHERE g.fecha_gasto BETWEEN sc.fecha_apertura AND sc.fecha_cierre
          ), 0)
        ) as efectivoEsperado
      FROM sesiones_caja sc
      INNER JOIN usuarios u ON sc.usuario_id = u.id
      WHERE sc.fecha_cierre IS NOT NULL
        AND DATE(sc.fecha_cierre) BETWEEN ? AND ?
      ORDER BY sc.fecha_cierre DESC
    `, [fechaInicio, fechaFin])

    const diferencias = sesiones.map(s => {
      const efectivoEsperado = Number(s.efectivoEsperado)
      const efectivoContado = Number(s.efectivo_contado || 0)
      const diferencia = efectivoContado - efectivoEsperado

      let tipo: 'faltante' | 'sobrante' | 'exacto' = 'exacto'
      if (Math.abs(diferencia) > 0.01) {
        tipo = diferencia < 0 ? 'faltante' : 'sobrante'
      }

      return {
        fecha: s.fecha,
        sesion_id: s.sesion_id,
        usuario: s.usuario,
        efectivoEsperado,
        efectivoContado,
        diferencia,
        tipo,
        notas: s.notas_cierre
      }
    })

    const totalDiferencias = diferencias.reduce((sum, d) => sum + Math.abs(d.diferencia), 0)
    const sesionesConDiferencia = diferencias.filter(d => d.tipo !== 'exacto').length
    const sesionesTotales = diferencias.length
    const porcentajeExactitud = sesionesTotales > 0 
      ? ((sesionesTotales - sesionesConDiferencia) / sesionesTotales) * 100 
      : 100

    const reporte: ReporteDiferencias = {
      periodo: `${fechaInicio} a ${fechaFin}`,
      diferencias,
      totalDiferencias,
      sesionesConDiferencia,
      sesionesTotales,
      porcentajeExactitud
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error generando reporte de diferencias:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
