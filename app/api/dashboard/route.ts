// @ts-nocheck
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // 1. Obtener la fecha de HOY en la zona horaria del servidor
        const hoy = new Date().toISOString().split('T')[0];

        // 2. Ejecutar métricas en paralelo por rendimiento
        const [
            ventasQuery,
            productosQuery,
            cxcQuery,
            cajaQuery,
            recientesQuery
        ] = await Promise.all([
            // 2.1: Ventas, transacciones y clientes de hoy
            query<any[]>(`
        SELECT 
          COUNT(DISTINCT v.id) as transacciones,
          COUNT(DISTINCT v.cliente_id) as clientesUnicos,
          COALESCE(SUM(v.total), 0) as totalVentas
        FROM ventas v
        WHERE DATE(v.fecha_venta) = ?
          AND v.estado != 'cancelada'
      `, [hoy]),

            // 2.2: Productos vendidos hoy
            query<any[]>(`
        SELECT 
          COALESCE(SUM(dv.cantidad), 0) as totalUnidades
        FROM detalle_ventas dv
        INNER JOIN ventas v ON dv.venta_id = v.id
        WHERE DATE(v.fecha_venta) = ?
          AND v.estado != 'cancelada'
      `, [hoy]),

            // 2.3: Cuentas por Cobrar (Deuda Total Histórica Viva)
            query<any[]>(`
        SELECT 
          COALESCE(SUM(GREATEST(cpc.monto_total - COALESCE(a.total_abonado, 0), 0)), 0) as deudaTotal,
          COUNT(DISTINCT cpc.cliente_id) as clientesMorosos
        FROM cuentas_por_cobrar cpc
        LEFT JOIN (
          SELECT cuenta_por_cobrar_id, COALESCE(SUM(monto), 0) as total_abonado
          FROM abonos GROUP BY cuenta_por_cobrar_id
        ) a ON a.cuenta_por_cobrar_id = cpc.id
        WHERE cpc.estado != 'pagada'
      `),

            // 2.4: Estado de Caja del Turno Actual
            query<any[]>(`
        SELECT 
          sc.id,
          sc.fecha_apertura,
          sc.monto_base,
          sc.estado
        FROM sesiones_caja sc
        WHERE sc.estado = 'abierta'
        ORDER BY sc.fecha_apertura DESC LIMIT 1
      `),

            // 2.5: 5 Ventas más Recientes (Cualquier fecha)
            query<any[]>(`
        SELECT 
          v.id,
          v.numero_venta,
          v.total,
          v.metodo_pago as tipo,
          COALESCE(c.nombre, 'Cliente Mostrador') as cliente
        FROM ventas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        ORDER BY v.fecha_venta DESC
        LIMIT 5
      `)
        ]);

        // Parseando y formateando los resultados
        const statVentas = {
            ventasHoy: Number(ventasQuery[0]?.totalVentas || 0),
            transacciones: Number(ventasQuery[0]?.transacciones || 0),
            clientesAtendidos: Number(ventasQuery[0]?.clientesUnicos || 0)
        };

        const statProductos = Number(productosQuery[0]?.totalUnidades || 0);

        const statCxC = {
            deudaTotal: Number(cxcQuery[0]?.deudaTotal || 0),
            clientesMorosos: Number(cxcQuery[0]?.clientesMorosos || 0)
        };

        // Obteniendo movimientos de caja si está abierta
        const cajaActiva = cajaQuery[0] || null;
        let statCaja = {
            estado: 'Cerrada',
            base: 0,
            ventasTurno: 0,
            totalEnCaja: 0
        };

        if (cajaActiva) {
            // Sumar recaudo del turno abierto
            const recaudoTurno = await query<any[]>(`
        SELECT 
          COALESCE(SUM(v.total), 0) as ventasEfectivo
        FROM ventas v
        WHERE v.fecha_venta >= ?
          AND v.estado = 'completada'
          AND v.metodo_pago = 'efectivo'
      `, [cajaActiva.fecha_apertura]);

            const ventasEfectivo = Number(recaudoTurno[0]?.ventasEfectivo || 0);
            const montoBase = Number(cajaActiva.monto_base || 0);

            statCaja = {
                estado: 'Abierta',
                base: montoBase,
                ventasTurno: ventasEfectivo, // Reflejamos solo efectivo para cuadre de caja manual
                totalEnCaja: montoBase + ventasEfectivo
            };
        }

        // JSON consolidado
        return NextResponse.json({
            success: true,
            data: {
                ventas: statVentas,
                productosVendidos: statProductos,
                cxc: statCxC,
                caja: statCaja,
                ventasRecientes: recientesQuery.map(row => ({
                    id: row.id.toString(),
                    numero_venta: row.numero_venta,
                    cliente: row.cliente,
                    total: Number(row.total),
                    tipo: row.tipo || 'Desconocido'
                }))
            }
        });

    } catch (error: any) {
        console.error('API /api/dashboard Error:', error);
        return NextResponse.json(
            { success: false, error: 'Error interno obteniendo métricas' },
            { status: 500 }
        );
    }
}
