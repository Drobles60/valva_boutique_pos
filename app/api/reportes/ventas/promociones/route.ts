import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { ReportePromociones } from '@/types/reportes'

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

    // Descuentos aplicados en ventas
    const descuentosAplicados = await query<any[]>(`
      SELECT 
        COUNT(DISTINCT v.id) as vecesAplicado,
        COALESCE(SUM(v.descuento), 0) as totalDescuentos
      FROM ventas v
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.descuento > 0
    `, [fechaInicio, fechaFin])

    // Promociones activas y su uso
    const promocionesActivas = await query<any[]>(`
      SELECT 
        d.id,
        d.nombre,
        d.tipo_descuento as tipo,
        d.valor_descuento as descuento,
        COUNT(DISTINCT v.id) as vecesAplicado,
        COALESCE(SUM(v.descuento), 0) as montoDescuento,
        COALESCE(SUM(v.total), 0) as impactoVentas
      FROM descuentos d
      LEFT JOIN ventas v ON v.descuento > 0 
        AND DATE(v.fecha_venta) BETWEEN ? AND ?
      WHERE d.activo = 1
        AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
      GROUP BY d.id, d.nombre, d.tipo_descuento, d.valor_descuento
      ORDER BY vecesAplicado DESC
    `, [fechaInicio, fechaFin])

    // Productos más descontados
    const productosMasDescontados = await query<any[]>(`
      SELECT 
        p.id as producto_id,
        CONCAT(p.codigo, ' - ', p.nombre) as nombre,
        COUNT(*) as vecesDescontado,
        SUM(
          dv.cantidad * (dv.precio_unitario - (dv.precio_unitario * (v.descuento / 100)))
        ) as montoDescuento
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.venta_id = v.id
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE DATE(v.fecha_venta) BETWEEN ? AND ?
        AND v.descuento > 0
      GROUP BY p.id, p.codigo, p.nombre
      ORDER BY vecesDescontado DESC
      LIMIT 10
    `, [fechaInicio, fechaFin])

    const totalDescuentos = Number(descuentosAplicados[0]?.totalDescuentos || 0)
    const vecesAplicado = Number(descuentosAplicados[0]?.vecesAplicado || 0)

    const reporte: ReportePromociones = {
      periodo: `${fechaInicio} a ${fechaFin}`,
      totalDescuentos,
      descuentosAplicados: vecesAplicado,
      promocionesActivas: promocionesActivas.map(p => ({
        id: p.id,
        nombre: p.nombre,
        tipo: p.tipo,
        descuento: Number(p.descuento),
        vecesAplicado: Number(p.vecesAplicado),
        montoDescuento: Number(p.montoDescuento),
        impactoVentas: Number(p.impactoVentas)
      })),
      productosMasDescontados: productosMasDescontados.map(p => ({
        producto_id: p.producto_id,
        nombre: p.nombre,
        vecesDescontado: Number(p.vecesDescontado),
        montoDescuento: Number(p.montoDescuento)
      }))
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error generando reporte de promociones:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
