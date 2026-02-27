import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fechaInicio = searchParams.get("fechaInicio")
    const fechaFin = searchParams.get("fechaFin")

    if (!fechaInicio || !fechaFin)
      return NextResponse.json({ error: "Fechas requeridas" }, { status: 400 })

    // Resumen por proveedor (todas las compras confirmadas en el período)
    const porProveedor = await query<any[]>(`
      SELECT
        p.id as proveedor_id,
        COALESCE(p.nombre_comercial, p.razon_social) as proveedor,
        p.ruc,
        p.telefono,
        p.email,
        COUNT(c.id) as totalCompras,
        COALESCE(SUM(c.total), 0) as montoTotal,
        COALESCE(SUM(CASE WHEN c.tipo_pago = 'contado' THEN c.total ELSE 0 END), 0) as montoContado,
        COALESCE(SUM(CASE WHEN c.tipo_pago = 'credito' THEN c.total ELSE 0 END), 0) as montoCredito,
        COALESCE(SUM(CASE WHEN c.tipo_pago = 'mixto' THEN c.total ELSE 0 END), 0) as montoMixto,
        COALESCE(SUM(c.abono_inicial), 0) as totalAbonado,
        COALESCE(SUM(c.descuento_total), 0) as totalDescuentos,
        MIN(c.fecha) as primeraCompra,
        MAX(c.fecha) as ultimaCompra
      FROM proveedores p
      LEFT JOIN compras c ON c.proveedor_id = p.id
        AND c.estado = 'confirmada'
        AND c.fecha BETWEEN ? AND ?
      GROUP BY p.id, p.nombre_comercial, p.razon_social, p.ruc, p.telefono, p.email
      HAVING totalCompras > 0
      ORDER BY montoTotal DESC
    `, [fechaInicio, fechaFin])

    // Deudas pendientes por proveedor (crédito no pagado — sin filtro de fecha)
    const deudasPendientes = await query<any[]>(`
      SELECT
        p.id as proveedor_id,
        COALESCE(p.nombre_comercial, p.razon_social) as proveedor,
        COUNT(c.id) as comprasPendientes,
        COALESCE(SUM(c.total - c.abono_inicial), 0) as saldoPendiente,
        MIN(c.fecha_vencimiento) as proximoVencimiento
      FROM compras c
      INNER JOIN proveedores p ON c.proveedor_id = p.id
      WHERE c.tipo_pago IN ('credito', 'mixto')
        AND c.estado = 'confirmada'
        AND (c.total - c.abono_inicial) > 0
      GROUP BY p.id, p.nombre_comercial, p.razon_social
      ORDER BY saldoPendiente DESC
    `)

    // Detalle de compras en el período
    const detalle = await query<any[]>(`
      SELECT
        c.id, c.numero_compra, c.factura_numero, c.fecha, c.fecha_vencimiento,
        c.tipo_pago, c.subtotal, c.descuento_total, c.iva_total, c.total,
        c.abono_inicial, c.estado,
        COALESCE(p.nombre_comercial, p.razon_social) as proveedor,
        (SELECT COUNT(*) FROM compra_detalle cd WHERE cd.compra_id = c.id) as totalItems
      FROM compras c
      INNER JOIN proveedores p ON c.proveedor_id = p.id
      WHERE c.estado = 'confirmada'
        AND c.fecha BETWEEN ? AND ?
      ORDER BY c.fecha DESC, c.id DESC
    `, [fechaInicio, fechaFin])

    // Totales generales del período
    const totalCompras = detalle.length
    const montoTotal = detalle.reduce((s, c) => s + Number(c.total), 0)
    const montoContado = detalle.filter(c => c.tipo_pago === "contado").reduce((s, c) => s + Number(c.total), 0)
    const montoCredito = detalle.filter(c => c.tipo_pago === "credito").reduce((s, c) => s + Number(c.total), 0)
    const montoMixto = detalle.filter(c => c.tipo_pago === "mixto").reduce((s, c) => s + Number(c.total), 0)
    const totalDescuentos = detalle.reduce((s, c) => s + Number(c.descuento_total), 0)
    const deudaTotalAcumulada = deudasPendientes.reduce((s, d) => s + Number(d.saldoPendiente), 0)
    const proveedoresActivos = porProveedor.length

    return NextResponse.json({
      success: true,
      periodo: `${fechaInicio} al ${fechaFin}`,
      resumen: {
        totalCompras,
        montoTotal,
        montoContado,
        montoCredito,
        montoMixto,
        totalDescuentos,
        deudaTotalAcumulada,
        proveedoresActivos,
      },
      porProveedor: porProveedor.map(p => ({
        proveedorId: p.proveedor_id,
        proveedor: p.proveedor,
        ruc: p.ruc,
        telefono: p.telefono,
        email: p.email,
        totalCompras: Number(p.totalCompras),
        montoTotal: Number(p.montoTotal),
        montoContado: Number(p.montoContado),
        montoCredito: Number(p.montoCredito),
        montoMixto: Number(p.montoMixto),
        totalAbonado: Number(p.totalAbonado),
        totalDescuentos: Number(p.totalDescuentos),
        primeraCompra: p.primeraCompra,
        ultimaCompra: p.ultimaCompra,
      })),
      deudasPendientes: deudasPendientes.map(d => ({
        proveedorId: d.proveedor_id,
        proveedor: d.proveedor,
        comprasPendientes: Number(d.comprasPendientes),
        saldoPendiente: Number(d.saldoPendiente),
        proximoVencimiento: d.proximoVencimiento,
      })),
      detalle: detalle.map(c => ({
        id: c.id,
        numeroCompra: c.numero_compra,
        factura: c.factura_numero,
        fecha: c.fecha,
        fechaVencimiento: c.fecha_vencimiento,
        tipoPago: c.tipo_pago,
        subtotal: Number(c.subtotal),
        descuento: Number(c.descuento_total),
        iva: Number(c.iva_total),
        total: Number(c.total),
        abonoInicial: Number(c.abono_inicial),
        proveedor: c.proveedor,
        totalItems: Number(c.totalItems),
      })),
    })
  } catch (error) {
    console.error("Error en reporte proveedores:", error)
    return NextResponse.json({ error: "Error: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}
