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
"[project]/app/api/compras/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
// ── Generar número de compra ──────────────────────────────────────────────────
async function generarNumeroCompra() {
    const [row] = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT COUNT(*) as total FROM compras');
    const n = (Number(row?.total) || 0) + 1;
    return `COMP-${String(n).padStart(6, '0')}`;
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const estado = searchParams.get('estado');
        const proveedor_id = searchParams.get('proveedor_id');
        const fecha_inicio = searchParams.get('fecha_inicio');
        const fecha_fin = searchParams.get('fecha_fin');
        let where = 'WHERE 1=1';
        const params = [];
        if (estado) {
            where += ' AND c.estado = ?';
            params.push(estado);
        }
        if (proveedor_id) {
            where += ' AND c.proveedor_id = ?';
            params.push(proveedor_id);
        }
        if (fecha_inicio) {
            where += ' AND DATE(c.fecha) >= ?';
            params.push(fecha_inicio);
        }
        if (fecha_fin) {
            where += ' AND DATE(c.fecha) <= ?';
            params.push(fecha_fin);
        }
        const compras = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT c.id, c.numero_compra, c.factura_numero, c.fecha, c.fecha_vencimiento,
              c.tipo_pago, c.subtotal, c.descuento_total, c.iva_total, c.total,
              c.estado, c.observaciones, c.created_at,
              p.razon_social AS proveedor_nombre,
              u.nombre       AS usuario_nombre,
              (SELECT COUNT(*) FROM compra_detalle cd WHERE cd.compra_id = c.id) AS total_items
       FROM compras c
       LEFT JOIN proveedores p ON c.proveedor_id = p.id
       LEFT JOIN usuarios    u ON c.usuario_id   = u.id
       ${where}
       ORDER BY c.created_at DESC`, params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: compras
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { proveedor_id, factura_numero, fecha, fecha_vencimiento, tipo_pago, observaciones, usuario_id, items = [], otros_costos = 0, abono_inicial = 0 } = body;
        if (!proveedor_id) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Proveedor requerido'
        }, {
            status: 400
        });
        if (!fecha) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Fecha requerida'
        }, {
            status: 400
        });
        if (!items.length) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Agrega al menos un producto'
        }, {
            status: 400
        });
        // Calcular totales
        let subtotal = 0, descuento_total = 0, iva_total = 0;
        const itemsCalculados = items.map((it)=>{
            const sub = Number(it.cantidad) * Number(it.costo_unitario);
            const desc = sub * (Number(it.descuento_pct) / 100);
            const base = sub - desc;
            const iva = base * (Number(it.iva_pct) / 100);
            const total = base + iva;
            subtotal += sub;
            descuento_total += desc;
            iva_total += iva;
            return {
                ...it,
                subtotal: sub.toFixed(2),
                total: total.toFixed(2)
            };
        });
        const total = subtotal - descuento_total + iva_total + Number(otros_costos);
        const numero_compra = await generarNumeroCompra();
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO compras 
       (numero_compra, proveedor_id, factura_numero, fecha, fecha_vencimiento, tipo_pago,
        subtotal, descuento_total, iva_total, otros_costos, total, abono_inicial, estado, usuario_id, observaciones)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'borrador',?,?)`, [
            numero_compra,
            proveedor_id,
            factura_numero || null,
            fecha,
            fecha_vencimiento || null,
            tipo_pago || 'contado',
            subtotal.toFixed(2),
            descuento_total.toFixed(2),
            iva_total.toFixed(2),
            Number(otros_costos).toFixed(2),
            total.toFixed(2),
            Number(abono_inicial).toFixed(2),
            usuario_id || null,
            observaciones || null
        ]);
        const compra_id = result.insertId;
        // Insertar detalle
        for (const it of itemsCalculados){
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO compra_detalle (compra_id, producto_id, cantidad, costo_unitario, descuento_pct, iva_pct, subtotal, total)
         VALUES (?,?,?,?,?,?,?,?)`, [
                compra_id,
                it.producto_id,
                it.cantidad,
                it.costo_unitario,
                it.descuento_pct || 0,
                it.iva_pct || 0,
                it.subtotal,
                it.total
            ]);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            id: compra_id,
            numero_compra
        }, {
            status: 201
        });
    } catch (error) {
        console.error('Error crear compra:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__01023936._.js.map