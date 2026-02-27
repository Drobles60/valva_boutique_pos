import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    if (!fechaInicio || !fechaFin)
      return NextResponse.json({ error: "Fechas requeridas" }, { status: 400 })

    // Clientes más frecuentes (top 15)
    const topFrecuentes = await query<any[]>(`
      SELECT 
        c.id, c.nombre, c.identificacion, c.tipo_cliente, c.telefono,
        COUNT(v.id) as totalCompras,
        COALESCE(SUM(v.total), 0) as montoTotal,
        COALESCE(AVG(v.total), 0) as ticketPromedio,
        MIN(v.fecha_venta) as primeraCompra,
        MAX(v.fecha_venta) as ultimaCompra
      FROM clientes c
      INNER JOIN ventas v ON v.cliente_id = c.id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY c.id, c.nombre, c.identificacion, c.tipo_cliente, c.telefono
      ORDER BY totalCompras DESC
      LIMIT 15
    `, [fechaInicio, fechaFin])

    // Clientes por mayor ticket promedio (top 15)
    const topTicket = await query<any[]>(`
      SELECT 
        c.id, c.nombre, c.tipo_cliente,
        COUNT(v.id) as totalCompras,
        COALESCE(SUM(v.total), 0) as montoTotal,
        COALESCE(AVG(v.total), 0) as ticketPromedio
      FROM clientes c
      INNER JOIN ventas v ON v.cliente_id = c.id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY c.id, c.nombre, c.tipo_cliente
      HAVING totalCompras >= 1
      ORDER BY ticketPromedio DESC
      LIMIT 15
    `, [fechaInicio, fechaFin])

    // Clientes por mayor gasto total (top 15)
    const topGasto = await query<any[]>(`
      SELECT 
        c.id, c.nombre, c.tipo_cliente,
        COUNT(v.id) as totalCompras,
        COALESCE(SUM(v.total), 0) as montoTotal,
        COALESCE(AVG(v.total), 0) as ticketPromedio
      FROM clientes c
      INNER JOIN ventas v ON v.cliente_id = c.id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY c.id, c.nombre, c.tipo_cliente
      ORDER BY montoTotal DESC
      LIMIT 15
    `, [fechaInicio, fechaFin])

    // Segmentación por tipo de cliente
    const porTipo = await query<any[]>(`
      SELECT 
        COALESCE(c.tipo_cliente, 'publico') as tipo,
        COUNT(DISTINCT c.id) as clientes,
        COUNT(v.id) as transacciones,
        COALESCE(SUM(v.total), 0) as monto
      FROM ventas v
      LEFT JOIN clientes c ON c.id = v.cliente_id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY tipo
    `, [fechaInicio, fechaFin])

    // Ventas con cliente vs sin cliente (consumidor final)
    const distribucion = await query<any[]>(`
      SELECT 
        CASE WHEN v.cliente_id IS NOT NULL THEN 'Con cliente' ELSE 'Consumidor final' END as tipo,
        COUNT(*) as transacciones,
        COALESCE(SUM(v.total), 0) as monto
      FROM ventas v
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY tipo
    `, [fechaInicio, fechaFin])

    // Evolución de clientes nuevos por mes
    const clientesNuevos = await query<any[]>(`
      SELECT 
        DATE_FORMAT(c.created_at, '%Y-%m') as mes,
        COUNT(*) as nuevos
      FROM clientes c
      WHERE c.created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY mes ORDER BY mes
    `, [fechaInicio, fechaFin])

    // Resumen general
    const [resumenGeneral] = await query<any[]>(`
      SELECT 
        COUNT(DISTINCT v.cliente_id) as clientesActivos,
        COUNT(v.id) as totalTransacciones,
        COALESCE(SUM(v.total), 0) as totalVentas,
        COALESCE(AVG(v.total), 0) as ticketPromedioGeneral
      FROM ventas v
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
    `, [fechaInicio, fechaFin])

    const [totalClientes] = await query<any[]>(`SELECT COUNT(*) as total FROM clientes WHERE estado = 'activo'`)

    return NextResponse.json({
      success: true,
      periodo: `${fechaInicio} al ${fechaFin}`,
      resumen: {
        clientesActivos: Number(resumenGeneral.clientesActivos),
        totalClientes: Number(totalClientes.total),
        totalTransacciones: Number(resumenGeneral.totalTransacciones),
        totalVentas: Number(resumenGeneral.totalVentas),
        ticketPromedioGeneral: Number(resumenGeneral.ticketPromedioGeneral),
      },
      topFrecuentes: topFrecuentes.map(c => ({
        id: c.id, nombre: c.nombre, identificacion: c.identificacion,
        tipoCliente: c.tipo_cliente, telefono: c.telefono,
        totalCompras: Number(c.totalCompras), montoTotal: Number(c.montoTotal),
        ticketPromedio: Number(c.ticketPromedio),
        primeraCompra: c.primeraCompra, ultimaCompra: c.ultimaCompra,
      })),
      topTicket: topTicket.map(c => ({
        id: c.id, nombre: c.nombre, tipoCliente: c.tipo_cliente,
        totalCompras: Number(c.totalCompras), montoTotal: Number(c.montoTotal),
        ticketPromedio: Number(c.ticketPromedio),
      })),
      topGasto: topGasto.map(c => ({
        id: c.id, nombre: c.nombre, tipoCliente: c.tipo_cliente,
        totalCompras: Number(c.totalCompras), montoTotal: Number(c.montoTotal),
        ticketPromedio: Number(c.ticketPromedio),
      })),
      porTipo: porTipo.map(t => ({
        tipo: t.tipo, clientes: Number(t.clientes),
        transacciones: Number(t.transacciones), monto: Number(t.monto),
      })),
      distribucion: distribucion.map(d => ({
        tipo: d.tipo, transacciones: Number(d.transacciones), monto: Number(d.monto),
      })),
      clientesNuevos: clientesNuevos.map(c => ({ mes: c.mes, nuevos: Number(c.nuevos) })),
    })
  } catch (error) {
    console.error("Error en análisis clientes:", error)
    return NextResponse.json({ error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
