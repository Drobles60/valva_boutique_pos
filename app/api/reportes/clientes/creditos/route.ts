import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const incluirPagadas = searchParams.get('incluirPagadas') === 'true'
    const filtroSaldo = incluirPagadas ? '1=1' : 'cpc.saldo_pendiente > 0'

    // Per-client credit details with abonos
    const detalleClientes = await query<any[]>(`
      SELECT 
        c.id AS cliente_id,
        c.nombre,
        c.telefono,
        COALESCE(SUM(cpc.monto_total), 0) AS totalCredito,
        COALESCE(SUM(cpc.monto_total - cpc.saldo_pendiente), 0) AS totalAbonado,
        COALESCE(SUM(cpc.saldo_pendiente), 0) AS saldoPendiente,
        COUNT(cpc.id) AS facturas,
        COALESCE(MAX(DATEDIFF(CURDATE(), cpc.fecha_vencimiento)), 0) AS diasVencido,
        MAX(ab.fecha_abono) AS ultimoPago,
        CASE 
          WHEN SUM(cpc.saldo_pendiente) > 0 AND MAX(cpc.fecha_vencimiento) < CURDATE() THEN 'vencido'
          WHEN SUM(cpc.saldo_pendiente) > 0 AND MIN(cpc.fecha_vencimiento) <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'por_vencer'
          ELSE 'al_dia'
        END AS estado
      FROM clientes c
      INNER JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      LEFT JOIN abonos ab ON cpc.id = ab.cuenta_por_cobrar_id
      WHERE ${filtroSaldo}
      GROUP BY c.id, c.nombre, c.telefono
      ORDER BY saldoPendiente DESC
    `)

    // Build response matching component expectations
    const creditos = detalleClientes.map((d: any) => ({
      cliente: {
        nombre: d.nombre,
        telefono: d.telefono || null,
      },
      totalCredito: Number(d.totalCredito),
      totalAbonado: Number(d.totalAbonado),
      saldoPendiente: Number(d.saldoPendiente),
      diasVencido: Math.max(0, Number(d.diasVencido)),
      estado: d.estado,
      facturas: Number(d.facturas),
      ultimoPago: d.ultimoPago,
    }))

    const totalPorCobrar = creditos.reduce((s: number, c: any) => s + c.totalCredito, 0)
    const totalAbonado = creditos.reduce((s: number, c: any) => s + c.totalAbonado, 0)
    const saldoPendiente = creditos.reduce((s: number, c: any) => s + c.saldoPendiente, 0)
    const creditosVencidos = creditos.filter((c: any) => c.estado === 'vencido').length

    return NextResponse.json({
      success: true,
      creditos,
      totalPorCobrar,
      totalAbonado,
      saldoPendiente,
      creditosVencidos,
    })
  } catch (error) {
    console.error('Error generando reporte de créditos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al generar el reporte: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
