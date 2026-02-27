module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/timers [external] (timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("timers", () => require("timers"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkConnection",
    ()=>checkConnection,
    "closePool",
    ()=>closePool,
    "getPool",
    ()=>getPool,
    "query",
    ()=>query,
    "queryMultiple",
    ()=>queryMultiple,
    "queryOne",
    ()=>queryOne,
    "transaction",
    ()=>transaction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mysql2$40$3$2e$16$2e$0$2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/mysql2@3.16.0/node_modules/mysql2/promise.js [app-route] (ecmascript)");
;
// Configuración de la conexión a MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Luciana1510@',
    database: process.env.DB_NAME || 'valva_boutique',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};
// Crear el pool de conexiones
let pool;
function getPool() {
    if (!pool) {
        pool = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$mysql2$40$3$2e$16$2e$0$2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createPool(dbConfig);
    }
    return pool;
}
async function query(sql, params) {
    const connection = await getPool().getConnection();
    try {
        const [results] = await connection.execute(sql, params);
        return results;
    } finally{
        connection.release();
    }
}
async function queryMultiple(sql, params) {
    const connection = await getPool().getConnection();
    try {
        const [results] = await connection.query(sql, params);
        return results;
    } finally{
        connection.release();
    }
}
async function queryOne(sql, params) {
    const results = await query(sql, params);
    return results.length > 0 ? results[0] : null;
}
async function transaction(callback) {
    const connection = await getPool().getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally{
        connection.release();
    }
}
async function closePool() {
    if (pool) {
        await pool.end();
    }
}
async function checkConnection() {
    try {
        const connection = await getPool().getConnection();
        await connection.ping();
        connection.release();
        return true;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        return false;
    }
}
}),
"[project]/app/api/reportes/periodo/semanal/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        // Current week: Monday to Sunday
        // Previous week: the 7 days before that
        // We compare both
        // Ventas de la semana actual (lunes a hoy)
        const semanaActual = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        DATE(fecha_venta) as dia,
        COUNT(*) as transacciones,
        COALESCE(SUM(total), 0) as total_ventas,
        COALESCE(SUM(descuento), 0) as total_descuentos
      FROM ventas
      WHERE estado != 'anulada'
        AND YEARWEEK(fecha_venta, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY DATE(fecha_venta)
      ORDER BY dia ASC
    `);
        // Ventas de la semana anterior
        const semanaAnterior = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        DATE(fecha_venta) as dia,
        COUNT(*) as transacciones,
        COALESCE(SUM(total), 0) as total_ventas,
        COALESCE(SUM(descuento), 0) as total_descuentos
      FROM ventas
      WHERE estado != 'anulada'
        AND YEARWEEK(fecha_venta, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY), 1)
      GROUP BY DATE(fecha_venta)
      ORDER BY dia ASC
    `);
        // Totales semana actual
        const totalActual = semanaActual.reduce((acc, d)=>({
                ventas: acc.ventas + Number(d.total_ventas),
                transacciones: acc.transacciones + Number(d.transacciones),
                descuentos: acc.descuentos + Number(d.total_descuentos)
            }), {
            ventas: 0,
            transacciones: 0,
            descuentos: 0
        });
        // Totales semana anterior  
        const totalAnterior = semanaAnterior.reduce((acc, d)=>({
                ventas: acc.ventas + Number(d.total_ventas),
                transacciones: acc.transacciones + Number(d.transacciones),
                descuentos: acc.descuentos + Number(d.total_descuentos)
            }), {
            ventas: 0,
            transacciones: 0,
            descuentos: 0
        });
        // Top productos semana actual
        const topProductos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        p.nombre,
        SUM(dv.cantidad) as unidades,
        SUM(dv.subtotal) as total_venta
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.producto_id = p.id
      INNER JOIN ventas v ON dv.venta_id = v.id
      WHERE v.estado != 'anulada'
        AND YEARWEEK(v.fecha_venta, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY p.id, p.nombre
      ORDER BY unidades DESC
      LIMIT 10
    `);
        // Ventas por método de pago semana actual
        const metodosPago = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        metodo_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE estado != 'anulada'
        AND YEARWEEK(fecha_venta, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY metodo_pago
      ORDER BY total DESC
    `);
        // Ventas por tipo (contado/credito)
        const tiposVenta = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        tipo_venta,
        COUNT(*) as cantidad,
        COALESCE(SUM(total), 0) as total
      FROM ventas
      WHERE estado != 'anulada'
        AND YEARWEEK(fecha_venta, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY tipo_venta
      ORDER BY total DESC
    `);
        const ticketPromedioActual = totalActual.transacciones > 0 ? totalActual.ventas / totalActual.transacciones : 0;
        const ticketPromedioAnterior = totalAnterior.transacciones > 0 ? totalAnterior.ventas / totalAnterior.transacciones : 0;
        const calcCambio = (actual, anterior)=>{
            if (anterior === 0) return actual > 0 ? 100 : 0;
            return (actual - anterior) / anterior * 100;
        };
        // Format daily data
        const diasNombres = [
            'Domingo',
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado'
        ];
        const ventasPorDia = semanaActual.map((d)=>{
            const fecha = new Date(d.dia);
            return {
                dia: diasNombres[fecha.getDay()],
                fecha: d.dia,
                ventas: Number(d.total_ventas),
                transacciones: Number(d.transacciones)
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            resumen: {
                semanaActual: {
                    ventas: totalActual.ventas,
                    transacciones: totalActual.transacciones,
                    ticketPromedio: ticketPromedioActual,
                    descuentos: totalActual.descuentos
                },
                semanaAnterior: {
                    ventas: totalAnterior.ventas,
                    transacciones: totalAnterior.transacciones,
                    ticketPromedio: ticketPromedioAnterior,
                    descuentos: totalAnterior.descuentos
                },
                cambios: {
                    ventas: calcCambio(totalActual.ventas, totalAnterior.ventas),
                    transacciones: calcCambio(totalActual.transacciones, totalAnterior.transacciones),
                    ticketPromedio: calcCambio(ticketPromedioActual, ticketPromedioAnterior)
                }
            },
            ventasPorDia,
            topProductos: topProductos.map((p)=>({
                    nombre: p.nombre,
                    unidades: Number(p.unidades),
                    totalVenta: Number(p.total_venta)
                })),
            metodosPago: metodosPago.map((m)=>({
                    metodo: m.metodo_pago,
                    cantidad: Number(m.cantidad),
                    total: Number(m.total)
                })),
            tiposVenta: tiposVenta.map((t)=>({
                    tipo: t.tipo_venta,
                    cantidad: Number(t.cantidad),
                    total: Number(t.total)
                }))
        });
    } catch (error) {
        console.error('Error generando resumen semanal:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Error al generar el resumen: ' + (error instanceof Error ? error.message : String(error))
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2dd1e6b4._.js.map