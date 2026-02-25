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
"[project]/Desktop/valva_boutique_pos/lib/descuentos.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calcularPrecioConDescuento",
    ()=>calcularPrecioConDescuento,
    "getDescuentosForProduct",
    ()=>getDescuentosForProduct,
    "getProductosConDescuentos",
    ()=>getProductosConDescuentos
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/lib/db.ts [app-route] (ecmascript)");
;
async function getDescuentosForProduct(productoId) {
    try {
        // Primero, actualizar el estado de descuentos vencidos
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      UPDATE descuentos 
      SET estado = 'inactivo' 
      WHERE fecha_fin IS NOT NULL 
        AND fecha_fin < CURDATE() 
        AND estado = 'activo'
    `);
        // Obtener el producto con su tipo de prenda
        const producto = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT p.*, p.tipo_prenda_id, tp.id as tipo_prenda_id_join
      FROM productos p
      LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      WHERE p.id = ?
    `, [
            productoId
        ]);
        if (!producto || producto.length === 0) {
            return [];
        }
        const prod = producto[0];
        const descuentos = [];
        // Buscar descuentos directos al producto (solo activos)
        const descuentosProducto = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT d.* 
      FROM descuentos d
      JOIN descuento_productos dp ON d.id = dp.descuento_id
      WHERE dp.producto_id = ? 
        AND d.estado = 'activo'
        AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
        AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
    `, [
            productoId
        ]);
        if (descuentosProducto.length > 0) {}
        descuentos.push(...descuentosProducto);
        // Buscar descuentos por tipo de prenda (solo activos)
        if (prod.tipo_prenda_id) {
            const descuentosTipoPrenda = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
        SELECT d.*
        FROM descuentos d
        JOIN descuento_tipos_prenda dtp ON d.id = dtp.descuento_id
        WHERE dtp.tipo_prenda_id = ?
          AND d.estado = 'activo'
          AND (d.fecha_inicio IS NULL OR d.fecha_inicio <= CURDATE())
          AND (d.fecha_fin IS NULL OR d.fecha_fin >= CURDATE())
      `, [
                prod.tipo_prenda_id
            ]);
            if (descuentosTipoPrenda.length > 0) {}
            descuentos.push(...descuentosTipoPrenda);
        } else {}
        return descuentos;
    } catch (error) {
        console.error('[DESCUENTOS] Error obteniendo descuentos para producto:', error);
        return [];
    }
}
function calcularPrecioConDescuento(precioOriginal, descuentos) {
    if (!descuentos || descuentos.length === 0) {
        return {
            precioFinal: precioOriginal,
            descuentoAplicado: null,
            montoDescuento: 0
        };
    }
    // Calcular el precio final para cada descuento
    const descuentosCalculados = descuentos.map((descuento)=>{
        let precioFinal = precioOriginal;
        let montoDescuento = 0;
        if (descuento.tipo === 'fijo') {
            // Para descuento fijo, el valor ES el precio final
            precioFinal = descuento.valor;
            montoDescuento = precioOriginal - descuento.valor;
        } else if (descuento.tipo === 'porcentaje') {
            // Para porcentaje: aplicar el porcentaje al precio de venta
            // 1. Calcular el monto del descuento: precio_venta * (porcentaje / 100)
            montoDescuento = precioOriginal * descuento.valor / 100;
            // 2. Calcular el precio final: precio_venta - monto_descuento
            precioFinal = precioOriginal - montoDescuento;
        }
        // Asegurar que el precio nunca sea negativo
        precioFinal = Math.max(0, precioFinal);
        return {
            ...descuento,
            montoDescuento,
            precioFinal
        };
    });
    // Obtener el descuento que da el menor precio final (mejor descuento para el cliente)
    const mejorDescuento = descuentosCalculados.reduce((mejor, actual)=>{
        return actual.precioFinal < mejor.precioFinal ? actual : mejor;
    });
    return {
        precioFinal: mejorDescuento.precioFinal,
        descuentoAplicado: mejorDescuento,
        montoDescuento: mejorDescuento.montoDescuento
    };
}
async function getProductosConDescuentos() {
    try {
        const productos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT p.*, 
        cp.nombre as categoria_nombre,
        tp.nombre as tipo_prenda_nombre,
        t.valor as talla_valor
      FROM productos p
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      WHERE p.estado = 'activo'
    `);
        // Para cada producto, obtener sus descuentos y calcular precio final
        const productosConDescuentos = await Promise.all(productos.map(async (producto)=>{
            const descuentos = await getDescuentosForProduct(producto.id);
            const { precioFinal, descuentoAplicado, montoDescuento } = calcularPrecioConDescuento(producto.precio_venta, descuentos);
            return {
                ...producto,
                descuentos_disponibles: descuentos,
                descuento_aplicado: descuentoAplicado,
                monto_descuento: montoDescuento,
                precio_original: producto.precio_venta,
                precio_final: precioFinal
            };
        }));
        return productosConDescuentos;
    } catch (error) {
        console.error('Error obteniendo productos con descuentos:', error);
        throw error;
    }
}
}),
"[project]/Desktop/valva_boutique_pos/lib/producto-validations.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PRODUCTO_COLOR_REGEX",
    ()=>PRODUCTO_COLOR_REGEX,
    "PRODUCTO_NOMBRE_REGEX",
    ()=>PRODUCTO_NOMBRE_REGEX,
    "isColorProductoValido",
    ()=>isColorProductoValido,
    "isNombreProductoValido",
    ()=>isNombreProductoValido,
    "sanitizeColorProducto",
    ()=>sanitizeColorProducto,
    "sanitizeNombreProducto",
    ()=>sanitizeNombreProducto
]);
const PRODUCTO_NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
const PRODUCTO_COLOR_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
function sanitizeNombreProducto(value = '') {
    return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '');
}
function isNombreProductoValido(value = '') {
    const nombre = value.trim();
    return !!nombre && PRODUCTO_NOMBRE_REGEX.test(nombre);
}
function sanitizeColorProducto(value = '') {
    return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '');
}
function isColorProductoValido(value = '') {
    const color = value.trim();
    if (!color) return true;
    return PRODUCTO_COLOR_REGEX.test(color);
}
}),
"[project]/Desktop/valva_boutique_pos/app/api/productos/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$descuentos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/lib/descuentos.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$producto$2d$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/lib/producto-validations.ts [app-route] (ecmascript)");
;
;
;
;
async function GET() {
    try {
        const productos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      SELECT 
        p.id,
        p.codigo_barras,
        p.sku,
        p.nombre,
        p.descripcion,
        p.color,
        p.precio_venta,
        p.precio_compra,
        p.precio_minimo,
        p.stock_actual,
        p.estado,
        p.categoria_padre_id,
        p.tipo_prenda_id,
        p.talla_id,
        p.proveedor_id,
        cp.nombre as categoria_nombre,
        tp.nombre as tipo_prenda_nombre,
        t.valor as talla_valor,
        prov.razon_social as proveedor_nombre
      FROM productos p
      LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
      LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
      LEFT JOIN tallas t ON p.talla_id = t.id
      LEFT JOIN proveedores prov ON p.proveedor_id = prov.id
      ORDER BY p.created_at DESC
    `);
        // Para cada producto, aplicar descuentos activos
        const productosConDescuentos = await Promise.all(productos.map(async (producto)=>{
            const descuentos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$descuentos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDescuentosForProduct"])(producto.id);
            const { precioFinal, descuentoAplicado, montoDescuento } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$descuentos$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calcularPrecioConDescuento"])(producto.precio_venta, descuentos);
            const productoConDescuento = {
                ...producto,
                precio_original: producto.precio_venta,
                precio_final: precioFinal,
                tiene_descuento: descuentoAplicado !== null,
                descuento_aplicado: descuentoAplicado,
                monto_descuento: montoDescuento,
                // Mantener precio_venta como el precio final para compatibilidad
                precio_venta: precioFinal
            };
            if (descuentoAplicado) {}
            return productoConDescuento;
        }));
        const productosConDescuentoCount = productosConDescuentos.filter((p)=>p.tiene_descuento).length;
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: productosConDescuentos
        });
    } catch (error) {
        console.error('[API PRODUCTOS] Error obteniendo productos:', error);
        console.error('[API PRODUCTOS] Stack:', error.stack);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Error al obtener productos',
            details: error.message
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { codigo_barras, sku, nombre, descripcion, categoria_padre_id, tipo_prenda_id, talla_id, proveedor_id, color, precio_compra, precio_venta, precio_minimo, stock_actual, estado } = body;
        // Validaciones de requeridos
        if (!nombre || !nombre.trim()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El nombre del producto es requerido'
            }, {
                status: 400
            });
        }
        if (!sku) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El SKU del producto es requerido'
            }, {
                status: 400
            });
        }
        if (!categoria_padre_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'La categorÃ­a principal es requerida'
            }, {
                status: 400
            });
        }
        if (!tipo_prenda_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El tipo especÃ­fico de prenda es requerido'
            }, {
                status: 400
            });
        }
        if (!proveedor_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El proveedor es requerido'
            }, {
                status: 400
            });
        }
        if (precio_compra === undefined || precio_compra === null || precio_compra === '') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El precio de compra es requerido'
            }, {
                status: 400
            });
        }
        if (precio_venta === undefined || precio_venta === null || precio_venta === '') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El precio de venta es requerido'
            }, {
                status: 400
            });
        }
        if (stock_actual === undefined || stock_actual === null || stock_actual === '') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'La cantidad en stock es requerida'
            }, {
                status: 400
            });
        }
        const nombreLimpio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$producto$2d$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeNombreProducto"])(nombre).trim();
        const colorLimpio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$producto$2d$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeColorProducto"])(color || '').trim();
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$producto$2d$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNombreProductoValido"])(nombreLimpio)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El nombre del producto solo puede contener letras y espacios'
            }, {
                status: 400
            });
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$producto$2d$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isColorProductoValido"])(colorLimpio)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El color del producto solo puede contener letras y espacios'
            }, {
                status: 400
            });
        }
        // Convertir nombre a mayÃºsculas
        const nombreMayusculas = nombreLimpio.toUpperCase();
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`
      INSERT INTO productos (
        codigo_barras,
        sku,
        nombre,
        descripcion,
        categoria_padre_id,
        tipo_prenda_id,
        talla_id,
        proveedor_id,
        color,
        precio_compra,
        precio_venta,
        precio_minimo,
        stock_actual,
        estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            codigo_barras,
            sku,
            nombreMayusculas,
            descripcion || null,
            categoria_padre_id,
            tipo_prenda_id,
            talla_id || null,
            proveedor_id,
            colorLimpio || null,
            precio_compra || 0,
            precio_venta || 0,
            precio_minimo || precio_venta || 0,
            stock_actual || 0,
            estado || 'activo'
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                id: result.insertId,
                ...body
            }
        });
    } catch (error) {
        console.error('Error creando producto:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Error al crear producto',
            details: error.message,
            code: error.code
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        const { id, codigo_barras, sku, nombre, descripcion, categoria_padre_id, tipo_prenda_id, talla_id, proveedor_id, color, precio_compra, precio_venta, precio_minimo, stock_actual, estado } = body;
        if (!id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'ID de producto requerido'
            }, {
                status: 400
            });
        }
        if (!nombre || !nombre.trim()) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El nombre del producto es requerido'
            }, {
                status: 400
            });
        }
        if (!sku) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El SKU del producto es requerido'
            }, {
                status: 400
            });
        }
        if (!categoria_padre_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'La categorÃ­a principal es requerida'
            }, {
                status: 400
            });
        }
        if (!tipo_prenda_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El tipo especÃ­fico de prenda es requerido'
            }, {
                status: 400
            });
        }
        if (!proveedor_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El proveedor es requerido'
            }, {
                status: 400
            });
        }
        if (precio_compra === undefined || precio_compra === null || precio_compra === '') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El precio de compra es requerido'
            }, {
                status: 400
            });
        }
        if (precio_venta === undefined || precio_venta === null || precio_venta === '') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El precio de venta es requerido'
            }, {
                status: 400
            });
        }
        if (stock_actual === undefined || stock_actual === null || stock_actual === '') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'La cantidad en stock es requerida'
            }, {
                status: 400
            });
        }
        const nombreLimpio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$producto$2d$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeNombreProducto"])(nombre).trim();
        const colorLimpio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$producto$2d$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sanitizeColorProducto"])(color || '').trim();
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$producto$2d$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNombreProductoValido"])(nombreLimpio)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El nombre del producto solo puede contener letras y espacios'
            }, {
                status: 400
            });
        }
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$producto$2d$validations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isColorProductoValido"])(colorLimpio)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El color del producto solo puede contener letras y espacios'
            }, {
                status: 400
            });
        }
        // Convertir nombre a mayÃºsculas
        const nombreMayusculas = nombreLimpio.toUpperCase();
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
            nombreMayusculas,
            descripcion || null,
            categoria_padre_id,
            tipo_prenda_id,
            talla_id || null,
            proveedor_id,
            colorLimpio || null,
            precio_compra || 0,
            precio_venta || 0,
            precio_minimo || precio_venta || 0,
            stock_actual || 0,
            estado || 'activo',
            id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: body
        });
    } catch (error) {
        console.error('Error actualizando producto:', error);
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

//# sourceMappingURL=%5Broot-of-the-server%5D__c00136d2._.js.map