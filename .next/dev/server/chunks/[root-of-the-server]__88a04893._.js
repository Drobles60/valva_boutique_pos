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
"[project]/Desktop/valva_boutique_pos/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$mysql2$40$3$2e$16$2e$0$2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/node_modules/.pnpm/mysql2@3.16.0/node_modules/mysql2/promise.js [app-route] (ecmascript)");
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
        pool = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$mysql2$40$3$2e$16$2e$0$2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createPool(dbConfig);
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
"[project]/Desktop/valva_boutique_pos/app/api/productos/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET(request, context) {
    try {
        const { id } = await context.params;
        const producto = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT p.*, cp.nombre as categoria_nombre, tp.nombre as tipo_prenda_nombre, 
              t.valor as talla_valor, prov.razon_social as proveedor_nombre
       FROM productos p
       LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
       LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
       LEFT JOIN tallas t ON p.talla_id = t.id
       LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
       WHERE p.id = ?`, [
            id
        ]);
        if (!producto) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Producto no encontrado'
            }, {
                status: 404
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: producto
        });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Error al obtener producto',
            details: error.message
        }, {
            status: 500
        });
    }
}
async function DELETE(request, context) {
    try {
        const { id } = await context.params;
        // Validar id
        if (!id || id === 'undefined' || id === 'null' || isNaN(Number(id))) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'ID de producto inválido'
            }, {
                status: 400
            });
        }
        // 1. Verificar si el producto tiene movimientos de inventario, ventas, compras o descuentos asociados
        const dependencias = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT 
        (SELECT COUNT(*) FROM detalle_ventas WHERE producto_id = ?) as ventas,
        (SELECT COUNT(*) FROM movimientos_inventario WHERE producto_id = ?) as movimientos,
        (SELECT COUNT(*) FROM compra_detalle WHERE producto_id = ?) as compras,
        (SELECT COUNT(*) FROM descuento_productos WHERE producto_id = ?) as descuentos`, [
            id,
            id,
            id,
            id
        ]);
        if (dependencias.ventas > 0 || dependencias.movimientos > 0 || dependencias.compras > 0 || dependencias.descuentos > 0) {
            // Si tiene dependencias, no eliminar físicamente para mantener integridad, 
            // sugerir inactivar o devolver error.
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'No se puede eliminar el producto porque tiene historial (ventas, compras o movimientos).',
                details: 'Se recomienda cambiar el estado del producto a "Inactivo" en lugar de eliminarlo.',
                canInactivate: true
            }, {
                status: 400
            });
        }
        // 2. Si no tiene dependencias, proceder con la eliminación física
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('DELETE FROM productos WHERE id = ?', [
            id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Error al eliminar producto',
            details: error.message,
            stack: error.stack
        }, {
            status: 500
        });
    }
}
async function PUT(request, context) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { codigo_barras, sku, nombre, descripcion, categoria_padre_id, tipo_prenda_id, talla_id, proveedor_id, color, precio_compra, precio_venta, precio_minimo, stock_actual, estado } = body;
        // Validaciones básicas
        if (!nombre || !sku || !categoria_padre_id || !tipo_prenda_id || !proveedor_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Faltan campos requeridos'
            }, {
                status: 400
            });
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
            UPDATE productos SET
                codigo_barras = ?,
                sku = ?,
                nombre = ?,
                descripcion = ?,
                categoria_padre_id = ?,
                tipo_prenda_id = ?,
                talla_id = ?,
                proveedor_id = ?,
                color = ?,
                precio_compra = ?,
                precio_venta = ?,
                precio_minimo = ?,
                stock_actual = ?,
                estado = ?
            WHERE id = ?
        `, [
            codigo_barras,
            sku,
            nombre.toUpperCase(),
            descripcion || null,
            categoria_padre_id,
            tipo_prenda_id,
            talla_id || null,
            proveedor_id,
            color || null,
            precio_compra || 0,
            precio_venta || 0,
            precio_minimo || precio_venta || 0,
            stock_actual || 0,
            estado || 'activo',
            id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: body
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Error al actualizar producto',
            details: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__88a04893._.js.map