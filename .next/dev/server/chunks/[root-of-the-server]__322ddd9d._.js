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
"[project]/app/api/reportes/estadisticas/clientes/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const fechaInicio = searchParams.get("fechaInicio");
        const fechaFin = searchParams.get("fechaFin");
        if (!fechaInicio || !fechaFin) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Fechas requeridas"
        }, {
            status: 400
        });
        // Clientes más frecuentes (top 15)
        const topFrecuentes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
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
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Clientes por mayor ticket promedio (top 15)
        const topTicket = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
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
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Clientes por mayor gasto total (top 15)
        const topGasto = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
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
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Segmentación por tipo de cliente
        const porTipo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
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
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Ventas con cliente vs sin cliente (consumidor final)
        const distribucion = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        CASE WHEN v.cliente_id IS NOT NULL THEN 'Con cliente' ELSE 'Consumidor final' END as tipo,
        COUNT(*) as transacciones,
        COALESCE(SUM(v.total), 0) as monto
      FROM ventas v
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY tipo
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Evolución de clientes nuevos por mes
        const clientesNuevos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        DATE_FORMAT(c.created_at, '%Y-%m') as mes,
        COUNT(*) as nuevos
      FROM clientes c
      WHERE c.created_at BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY mes ORDER BY mes
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Resumen general
        const [resumenGeneral] = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        COUNT(DISTINCT v.cliente_id) as clientesActivos,
        COUNT(v.id) as totalTransacciones,
        COALESCE(SUM(v.total), 0) as totalVentas,
        COALESCE(AVG(v.total), 0) as ticketPromedioGeneral
      FROM ventas v
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
    `, [
            fechaInicio,
            fechaFin
        ]);
        const [totalClientes] = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT COUNT(*) as total FROM clientes WHERE estado = 'activo'`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            periodo: `${fechaInicio} al ${fechaFin}`,
            resumen: {
                clientesActivos: Number(resumenGeneral.clientesActivos),
                totalClientes: Number(totalClientes.total),
                totalTransacciones: Number(resumenGeneral.totalTransacciones),
                totalVentas: Number(resumenGeneral.totalVentas),
                ticketPromedioGeneral: Number(resumenGeneral.ticketPromedioGeneral)
            },
            topFrecuentes: topFrecuentes.map((c)=>({
                    id: c.id,
                    nombre: c.nombre,
                    identificacion: c.identificacion,
                    tipoCliente: c.tipo_cliente,
                    telefono: c.telefono,
                    totalCompras: Number(c.totalCompras),
                    montoTotal: Number(c.montoTotal),
                    ticketPromedio: Number(c.ticketPromedio),
                    primeraCompra: c.primeraCompra,
                    ultimaCompra: c.ultimaCompra
                })),
            topTicket: topTicket.map((c)=>({
                    id: c.id,
                    nombre: c.nombre,
                    tipoCliente: c.tipo_cliente,
                    totalCompras: Number(c.totalCompras),
                    montoTotal: Number(c.montoTotal),
                    ticketPromedio: Number(c.ticketPromedio)
                })),
            topGasto: topGasto.map((c)=>({
                    id: c.id,
                    nombre: c.nombre,
                    tipoCliente: c.tipo_cliente,
                    totalCompras: Number(c.totalCompras),
                    montoTotal: Number(c.montoTotal),
                    ticketPromedio: Number(c.ticketPromedio)
                })),
            porTipo: porTipo.map((t)=>({
                    tipo: t.tipo,
                    clientes: Number(t.clientes),
                    transacciones: Number(t.transacciones),
                    monto: Number(t.monto)
                })),
            distribucion: distribucion.map((d)=>({
                    tipo: d.tipo,
                    transacciones: Number(d.transacciones),
                    monto: Number(d.monto)
                })),
            clientesNuevos: clientesNuevos.map((c)=>({
                    mes: c.mes,
                    nuevos: Number(c.nuevos)
                }))
        });
    } catch (error) {
        console.error("Error en análisis clientes:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error: " + (error instanceof Error ? error.message : String(error))
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__322ddd9d._.js.map