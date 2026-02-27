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
"[project]/app/api/reportes/administrativos/proveedores/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
        // Resumen por proveedor (todas las compras confirmadas en el período)
        const porProveedor = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
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
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Deudas pendientes por proveedor (crédito no pagado — sin filtro de fecha)
        const deudasPendientes = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
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
    `);
        // Detalle de compras en el período
        const detalle = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
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
    `, [
            fechaInicio,
            fechaFin
        ]);
        // Totales generales del período
        const totalCompras = detalle.length;
        const montoTotal = detalle.reduce((s, c)=>s + Number(c.total), 0);
        const montoContado = detalle.filter((c)=>c.tipo_pago === "contado").reduce((s, c)=>s + Number(c.total), 0);
        const montoCredito = detalle.filter((c)=>c.tipo_pago === "credito").reduce((s, c)=>s + Number(c.total), 0);
        const montoMixto = detalle.filter((c)=>c.tipo_pago === "mixto").reduce((s, c)=>s + Number(c.total), 0);
        const totalDescuentos = detalle.reduce((s, c)=>s + Number(c.descuento_total), 0);
        const deudaTotalAcumulada = deudasPendientes.reduce((s, d)=>s + Number(d.saldoPendiente), 0);
        const proveedoresActivos = porProveedor.length;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
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
                proveedoresActivos
            },
            porProveedor: porProveedor.map((p)=>({
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
                    ultimaCompra: p.ultimaCompra
                })),
            deudasPendientes: deudasPendientes.map((d)=>({
                    proveedorId: d.proveedor_id,
                    proveedor: d.proveedor,
                    comprasPendientes: Number(d.comprasPendientes),
                    saldoPendiente: Number(d.saldoPendiente),
                    proximoVencimiento: d.proximoVencimiento
                })),
            detalle: detalle.map((c)=>({
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
                    totalItems: Number(c.totalItems)
                }))
        });
    } catch (error) {
        console.error("Error en reporte proveedores:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Error: " + (error instanceof Error ? error.message : String(error))
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__93a17ccf._.js.map