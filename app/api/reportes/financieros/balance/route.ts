import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get("fecha") || new Date().toISOString().split("T")[0]

    // Activos: Inventario valorizado
    const inventario = await query<any[]>(`
      SELECT COALESCE(SUM(stock_actual * precio_compra), 0) as valorCosto,
             COALESCE(SUM(stock_actual * precio_venta), 0) as valorVenta
      FROM productos WHERE estado != 'inactivo'
    `)

    // Activos: Efectivo en caja (sesiones abiertas)
    const efectivoCaja = await query<any[]>(`
      SELECT COALESCE(SUM(mc.monto), 0) as total
      FROM movimientos_caja mc
      INNER JOIN sesiones_caja sc ON mc.sesion_caja_id = sc.id
      WHERE sc.estado = 'abierta'
    `)

    // Activos: Cuentas por cobrar (créditos pendientes)
    const cuentasPorCobrar = await query<any[]>(`
      SELECT COALESCE(SUM(saldo_pendiente), 0) as total,
             COUNT(*) as cantidad
      FROM cuentas_por_cobrar WHERE estado IN ('pendiente', 'vencida')
    `)

    // Ingresos acumulados hasta la fecha
    const ingresos = await query<any[]>(`
      SELECT COALESCE(SUM(total), 0) as total
      FROM ventas WHERE estado != 'anulada' AND DATE(fecha_venta) <= ?
    `, [fecha])

    // Gastos acumulados hasta la fecha  
    const gastosTotal = await query<any[]>(`
      SELECT COALESCE(SUM(monto), 0) as total
      FROM gastos WHERE fecha_gasto <= ?
    `, [fecha])

    // Pasivos: Deudas a proveedores (compras a crédito pendientes)
    const deudasProveedores = await query<any[]>(`
      SELECT COALESCE(SUM(total - abono_inicial), 0) as total,
             COUNT(*) as cantidad
      FROM compras WHERE tipo_pago = 'credito' AND estado = 'confirmada'
    `)

    const valorInventario = Number(inventario[0]?.valorCosto || 0)
    const valorInventarioVenta = Number(inventario[0]?.valorVenta || 0)
    const cajaEfectivo = Number(efectivoCaja[0]?.total || 0)
    const porCobrar = Number(cuentasPorCobrar[0]?.total || 0)
    const ingresosTotal = Number(ingresos[0]?.total || 0)
    const gastosAcum = Number(gastosTotal[0]?.total || 0)
    const porPagar = Number(deudasProveedores[0]?.total || 0)

    const totalActivos = valorInventario + cajaEfectivo + porCobrar
    const totalPasivos = porPagar
    const patrimonio = totalActivos - totalPasivos
    const utilidadAcumulada = ingresosTotal - gastosAcum

    return NextResponse.json({
      success: true,
      fecha,
      activos: {
        inventario: valorInventario,
        inventarioVenta: valorInventarioVenta,
        efectivoCaja: cajaEfectivo,
        cuentasPorCobrar: porCobrar,
        cuentasPorCobrarCantidad: Number(cuentasPorCobrar[0]?.cantidad || 0),
        total: totalActivos,
      },
      pasivos: {
        deudasProveedores: porPagar,
        deudasProveedoresCantidad: Number(deudasProveedores[0]?.cantidad || 0),
        total: totalPasivos,
      },
      patrimonio,
      utilidadAcumulada,
      ingresosAcumulados: ingresosTotal,
      gastosAcumulados: gastosAcum,
    })
  } catch (error) {
    console.error("Error en balance general:", error)
    return NextResponse.json({ success: false, error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
