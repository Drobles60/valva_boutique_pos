import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import type { ReporteCreditos } from '@/types/reportes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const incluirPagadas = searchParams.get('incluirPagadas') === 'true'

    // Total de cartera
    const carteraResult = await query<any[]>(`
      SELECT 
        COUNT(DISTINCT cliente_id) as clientesConDeuda,
        COUNT(*) as creditosVigentes,
        COALESCE(SUM(saldo_pendiente), 0) as totalCartera
      FROM cuentas_por_cobrar
      WHERE ${incluirPagadas ? '1=1' : 'saldo_pendiente > 0'}
    `)

    // Créditos vencidos
    const vencidosResult = await query<any[]>(`
      SELECT COUNT(*) as creditosVencidos
      FROM cuentas_por_cobrar
      WHERE saldo_pendiente > 0
        AND fecha_vencimiento < CURDATE()
    `)

    const totalCartera = Number(carteraResult[0]?.totalCartera || 0)
    const clientesConDeuda = Number(carteraResult[0]?.clientesConDeuda || 0)
    const creditosVigentes = Number(carteraResult[0]?.creditosVigentes || 0)
    const creditosVencidos = Number(vencidosResult[0]?.creditosVencidos || 0)
    const promedioDeuda = clientesConDeuda > 0 ? totalCartera / clientesConDeuda : 0

    // Detalle por cliente
    const detalleClientes = await query<any[]>(`
      SELECT 
        c.id as cliente_id,
        c.nombre,
        c.telefono,
        COALESCE(SUM(cpc.saldo_pendiente), 0) as saldoPendiente,
        COUNT(cpc.id) as facturas,
        COALESCE(AVG(DATEDIFF(CURDATE(), cpc.fecha_vencimiento)), 0) as diasPromVencimiento,
        MAX(a.fecha_abono) as ultimoPago,
        CASE 
          WHEN MAX(cpc.fecha_vencimiento) < CURDATE() AND SUM(cpc.saldo_pendiente) > 0 THEN 'vencido'
          WHEN MIN(cpc.fecha_vencimiento) <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'por_vencer'
          ELSE 'vigente'
        END as estado
      FROM clientes c
      INNER JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
      LEFT JOIN abonos a ON cpc.id = a.cuenta_id
      WHERE ${incluirPagadas ? '1=1' : 'cpc.saldo_pendiente > 0'}
      GROUP BY c.id, c.nombre, c.telefono
      ORDER BY saldoPendiente DESC
    `)

    const reporte: ReporteCreditos = {
      totalCartera,
      clientesConDeuda,
      creditosVigentes,
      creditosVencidos,
      promedioDeuda,
      detalleClientes: detalleClientes.map(d => ({
        cliente_id: d.cliente_id,
        nombre: d.nombre,
        telefono: d.telefono,
        saldoPendiente: Number(d.saldoPendiente),
        facturas: Number(d.facturas),
        diasPromVencimiento: Number(d.diasPromVencimiento),
        ultimoPago: d.ultimoPago,
        estado: d.estado
      }))
    }

    return NextResponse.json(reporte)
  } catch (error) {
    console.error('Error generando reporte de créditos:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}
