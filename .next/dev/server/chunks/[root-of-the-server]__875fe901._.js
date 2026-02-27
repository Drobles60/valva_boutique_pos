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
"[project]/app/api/reportes/estadisticas/tendencias/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        const agrupacion = searchParams.get("agrupacion") || "diario" // diario | semanal | mensual
        ;
        if (!fechaInicio || !fechaFin) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Fechas requeridas"
        }, {
            status: 400
        });
        let dateFormat;
        let dateLabel;
        if (agrupacion === "mensual") {
            dateFormat = "%Y-%m";
            dateLabel = "DATE_FORMAT(v.fecha_venta, '%Y-%m')";
        } else if (agrupacion === "semanal") {
            dateFormat = "%x-W%v";
            dateLabel = "DATE_FORMAT(v.fecha_venta, '%x-W%v')";
        } else {
            dateFormat = "%Y-%m-%d";
            dateLabel = "DATE(v.fecha_venta)";
        }
        // Ventas agrupadas por período
        const ventasPorPeriodo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        ${dateLabel} as periodo,
        COUNT(*) as transacciones,
        COALESCE(SUM(v.total), 0) as totalVentas,
        COALESCE(AVG(v.total), 0) as ticketPromedio,
        COALESCE(SUM(dv.cantidad * p.precio_compra), 0) as totalCosto
      FROM ventas v
      LEFT JOIN detalle_ventas dv ON dv.venta_id = v.id
      LEFT JOIN productos p ON p.id = dv.producto_id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY periodo
      ORDER BY periodo ASC
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Top 10 productos más vendidos en el período
        const topProductos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        p.nombre, p.sku,
        COALESCE(SUM(dv.cantidad), 0) as cantidadVendida,
        COALESCE(SUM(dv.subtotal), 0) as montoVentas
      FROM detalle_ventas dv
      INNER JOIN productos p ON p.id = dv.producto_id
      INNER JOIN ventas v ON v.id = dv.venta_id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY p.id, p.nombre, p.sku
      ORDER BY cantidadVendida DESC
      LIMIT 10
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Ventas por categoría
        const ventasPorCategoria = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        COALESCE(cp.nombre, 'Sin categoría') as categoria,
        COALESCE(SUM(dv.cantidad), 0) as cantidadVendida,
        COALESCE(SUM(dv.subtotal), 0) as montoVentas
      FROM detalle_ventas dv
      INNER JOIN productos p ON p.id = dv.producto_id
      LEFT JOIN categorias_padre cp ON cp.id = p.categoria_padre_id
      INNER JOIN ventas v ON v.id = dv.venta_id
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY cp.id, cp.nombre
      ORDER BY montoVentas DESC
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Ventas por método de pago
        const ventasPorMetodo = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        v.metodo_pago as metodo,
        COUNT(*) as transacciones,
        COALESCE(SUM(v.total), 0) as monto
      FROM ventas v
      WHERE v.estado != 'anulada'
        AND v.fecha_venta BETWEEN ? AND CONCAT(?, ' 23:59:59')
      GROUP BY v.metodo_pago
      ORDER BY monto DESC
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Calcular promedio móvil (3 períodos)
        const datos = ventasPorPeriodo.map((r, i)=>{
            const total = Number(r.totalVentas);
            const prev1 = i >= 1 ? Number(ventasPorPeriodo[i - 1].totalVentas) : total;
            const prev2 = i >= 2 ? Number(ventasPorPeriodo[i - 2].totalVentas) : prev1;
            const promedioMovil = (total + prev1 + prev2) / Math.min(i + 1, 3);
            return {
                periodo: r.periodo,
                transacciones: Number(r.transacciones),
                totalVentas: total,
                ticketPromedio: Number(r.ticketPromedio),
                totalCosto: Number(r.totalCosto),
                utilidad: total - Number(r.totalCosto),
                promedioMovil: Math.round(promedioMovil * 100) / 100
            };
        });
        const totalGeneral = datos.reduce((s, d)=>s + d.totalVentas, 0);
        const totalTransacciones = datos.reduce((s, d)=>s + d.transacciones, 0);
        const totalUtilidad = datos.reduce((s, d)=>s + d.utilidad, 0);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            periodo: `${fechaInicio} al ${fechaFin}`,
            agrupacion,
            resumen: {
                totalVentas: totalGeneral,
                totalTransacciones,
                ticketPromedio: totalTransacciones > 0 ? totalGeneral / totalTransacciones : 0,
                totalUtilidad,
                margenPromedio: totalGeneral > 0 ? totalUtilidad / totalGeneral * 100 : 0,
                periodosAnalizados: datos.length
            },
            tendencia: datos,
            topProductos: topProductos.map((p)=>({
                    nombre: p.nombre,
                    sku: p.sku,
                    cantidadVendida: Number(p.cantidadVendida),
                    montoVentas: Number(p.montoVentas)
                })),
            ventasPorCategoria: ventasPorCategoria.map((c)=>({
                    categoria: c.categoria,
                    cantidadVendida: Number(c.cantidadVendida),
                    montoVentas: Number(c.montoVentas)
                })),
            ventasPorMetodo: ventasPorMetodo.map((m)=>({
                    metodo: m.metodo,
                    transacciones: Number(m.transacciones),
                    monto: Number(m.monto)
                }))
        });
    } catch (error) {
        console.error("Error en tendencias:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error: " + (error instanceof Error ? error.message : String(error))
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__875fe901._.js.map