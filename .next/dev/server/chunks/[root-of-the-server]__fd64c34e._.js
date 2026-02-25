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
"[project]/lib/barcode-generator.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Generador de SKU y Códigos de Barras para Sistema de Ropa
 * 
 * SKU Format: CAT-TIPO-TALLA-SECUENCIA
 * Ejemplo: PAN-JEA-28-0001
 * 
 * Código de Barras: EAN-13 interno (prefijo 200-299 para uso interno)
 */ /**
 * Genera un SKU basado en la información del producto
 */ __turbopack_context__.s([
    "formatSKU",
    ()=>formatSKU,
    "generateBarcode",
    ()=>generateBarcode,
    "generateLabelDescription",
    ()=>generateLabelDescription,
    "generateSKU",
    ()=>generateSKU,
    "generateSKUPrefix",
    ()=>generateSKUPrefix,
    "getNextSequence",
    ()=>getNextSequence,
    "validateEAN13",
    ()=>validateEAN13
]);
function generateSKU(categoriaNombre, tipoPrendaNombre, tallaNombre, secuencia) {
    const skuPrefix = generateSKUPrefix(categoriaNombre, tipoPrendaNombre, tallaNombre);
    // Secuencia con 4 dígitos
    const secCode = secuencia.toString().padStart(4, '0');
    return `${skuPrefix}-${secCode}`;
}
function generateSKUPrefix(categoriaNombre, tipoPrendaNombre, tallaNombre) {
    // Extraer 3 primeras letras de categoría
    const catCode = categoriaNombre.substring(0, 3).toUpperCase();
    // Extraer código del tipo de prenda (primeras 3 letras o abreviatura inteligente)
    let tipoCode = '';
    const tipoWords = tipoPrendaNombre.split(' ');
    if (tipoWords.length > 1) {
        // Si tiene múltiples palabras, tomar primera letra de cada una
        tipoCode = tipoWords.slice(0, 3).map((w)=>w[0]).join('').toUpperCase();
    } else {
        tipoCode = tipoPrendaNombre.substring(0, 3).toUpperCase();
    }
    // Talla (ya viene limpia)
    const tallaCode = tallaNombre.toUpperCase().replace(/\s/g, '');
    return `${catCode}-${tipoCode}-${tallaCode}`;
}
/**
 * Calcula el dígito verificador para EAN-13
 */ function calculateEAN13CheckDigit(code) {
    const digits = code.split('').map(Number);
    let sum = 0;
    for(let i = 0; i < 12; i++){
        sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
}
function generateBarcode(_categoriaId, secuencia) {
    // Base de 100000 para asegurar siempre 6 dígitos
    const base = 100000;
    const codigo = base + secuencia;
    return codigo.toString();
}
async function getNextSequence(categoriaId, tipoPrendaId, tallaId) {
    // Esta función debe implementarse en el API route
    // Aquí solo definimos la estructura
    return 1;
}
function validateEAN13(barcode) {
    if (barcode.length !== 13) return false;
    if (!/^\d+$/.test(barcode)) return false;
    const providedCheckDigit = Number.parseInt(barcode[12]);
    const calculatedCheckDigit = calculateEAN13CheckDigit(barcode.substring(0, 12));
    return providedCheckDigit === calculatedCheckDigit;
}
function formatSKU(sku) {
    return sku.toUpperCase();
}
function generateLabelDescription(nombreProducto, color, talla) {
    let desc = nombreProducto.substring(0, 20);
    if (color) {
        desc += ` ${color.substring(0, 5)}`;
    }
    desc += ` T:${talla}`;
    return desc.substring(0, 30);
}
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
"[project]/app/api/productos/generar-codigos/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$barcode$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/barcode-generator.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { categoria_padre_id, tipo_prenda_id, talla_id } = body;
        // Obtener nombres desde la base de datos
        const categoriaResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT nombre FROM categorias_padre WHERE id = ? AND estado = 'activo'", [
            categoria_padre_id
        ]);
        const tipoPrendaResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT nombre FROM tipos_prenda WHERE id = ? AND estado = 'activo'", [
            tipo_prenda_id
        ]);
        const tallaResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT valor FROM tallas WHERE id = ? AND estado = 'activo'", [
            talla_id
        ]);
        if (!Array.isArray(categoriaResult) || categoriaResult.length === 0 || !Array.isArray(tipoPrendaResult) || tipoPrendaResult.length === 0 || !Array.isArray(tallaResult) || tallaResult.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Datos no encontrados'
            }, {
                status: 404
            });
        }
        const skuPrefix = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$barcode$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateSKUPrefix"])(categoriaResult[0].nombre, tipoPrendaResult[0].nombre, tallaResult[0].valor);
        // Obtener la secuencia para el SKU (Ãºltimo nÃºmero + 1) usando el prefijo exacto
        const secuenciaResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT MAX(CAST(SUBSTRING_INDEX(sku, '-', -1) AS UNSIGNED)) as max_secuencia
       FROM productos
       WHERE sku LIKE CONCAT(?, '-%')
         AND SUBSTRING_INDEX(sku, '-', -1) REGEXP '^[0-9]+$'`, [
            skuPrefix
        ]);
        const secuencia = (Array.isArray(secuenciaResult) && secuenciaResult[0]?.max_secuencia ? secuenciaResult[0].max_secuencia : 0) + 1;
        // Obtener el Ãºltimo cÃ³digo de barras corto usado (6 dÃ­gitos mÃ¡ximo)
        const ultimoCodigoResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT CAST(codigo_barras AS UNSIGNED) as codigo_numero
       FROM productos 
       WHERE codigo_barras REGEXP '^[0-9]{1,6}$'
       ORDER BY CAST(codigo_barras AS UNSIGNED) DESC
       LIMIT 1`);
        let nuevoCodigo;
        if (Array.isArray(ultimoCodigoResult) && ultimoCodigoResult.length > 0 && ultimoCodigoResult[0]?.codigo_numero) {
            nuevoCodigo = Number(ultimoCodigoResult[0].codigo_numero) + 1;
        } else {
            // Si no hay productos con cÃ³digo corto, empezar desde 100001
            nuevoCodigo = 100001;
        }
        // Generar cÃ³digos
        const sku = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$barcode$2d$generator$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateSKU"])(categoriaResult[0].nombre, tipoPrendaResult[0].nombre, tallaResult[0].valor, secuencia);
        const codigo_barras = nuevoCodigo.toString();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            sku,
            codigo_barras,
            secuencia
        });
    } catch (error) {
        console.error('Error generando cÃ³digos:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Error interno del servidor'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fd64c34e._.js.map