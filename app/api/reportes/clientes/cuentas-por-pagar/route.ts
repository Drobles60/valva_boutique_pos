import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // Compras a crédito pendientes
    const comprasPendientes = await query<any[]>(`
      SELECT c.id, c.numero_compra, c.factura_numero, c.fecha, c.fecha_vencimiento,
        c.total, c.abono_inicial, (c.total - c.abono_inicial) as saldoPendiente,
        COALESCE(p.nombre_comercial, p.razon_social) as proveedor, p.telefono, p.email
      FROM compras c
      INNER JOIN proveedores p ON c.proveedor_id = p.id
      WHERE c.tipo_pago = 'credito' AND c.estado = 'confirmada'
        AND (c.total - c.abono_inicial) > 0
      ORDER BY c.fecha_vencimiento ASC
    `)

    // Resumen por proveedor
    const porProveedor = await query<any[]>(`
      SELECT COALESCE(p.nombre_comercial, p.razon_social) as proveedor, COUNT(*) as compras,
        COALESCE(SUM(c.total), 0) as totalCompras,
        COALESCE(SUM(c.abono_inicial), 0) as totalAbonado,
        COALESCE(SUM(c.total - c.abono_inicial), 0) as saldoPendiente
      FROM compras c
      INNER JOIN proveedores p ON c.proveedor_id = p.id
      WHERE c.tipo_pago = 'credito' AND c.estado = 'confirmada'
        AND (c.total - c.abono_inicial) > 0
      GROUP BY p.id, COALESCE(p.nombre_comercial, p.razon_social)
      ORDER BY saldoPendiente DESC
    `)

    const totalDeuda = comprasPendientes.reduce((s, c) => s + Number(c.saldoPendiente), 0)
    const hoy = new Date().toISOString().split("T")[0]
    const vencidas = comprasPendientes.filter(c => c.fecha_vencimiento && c.fecha_vencimiento < hoy)
    const porVencer = comprasPendientes.filter(c => {
      if (!c.fecha_vencimiento) return false
      const dias = Math.ceil((new Date(c.fecha_vencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return dias >= 0 && dias <= 7
    })

    return NextResponse.json({
      success: true,
      totalDeuda,
      totalComprasPendientes: comprasPendientes.length,
      totalVencidas: vencidas.length,
      montoVencido: vencidas.reduce((s, c) => s + Number(c.saldoPendiente), 0),
      porVencerProximaSemana: porVencer.length,
      porProveedor: porProveedor.map(p => ({
        proveedor: p.proveedor, compras: Number(p.compras),
        totalCompras: Number(p.totalCompras), totalAbonado: Number(p.totalAbonado),
        saldoPendiente: Number(p.saldoPendiente),
      })),
      detalle: comprasPendientes.map(c => ({
        id: c.id, numeroCompra: c.numero_compra, factura: c.factura_numero,
        fecha: c.fecha, fechaVencimiento: c.fecha_vencimiento,
        total: Number(c.total), abonoInicial: Number(c.abono_inicial),
        saldoPendiente: Number(c.saldoPendiente),
        proveedor: c.proveedor, telefono: c.telefono, email: c.email,
        vencida: c.fecha_vencimiento ? c.fecha_vencimiento < hoy : false,
      })),
    })
  } catch (error) {
    console.error("Error en cuentas por pagar:", error)
    return NextResponse.json({ success: false, error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
