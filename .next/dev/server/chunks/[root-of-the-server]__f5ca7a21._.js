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
"[project]/Desktop/valva_boutique_pos/app/api/seed-demo/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
/**
 * ENDPOINT TEMPORAL DE DATOS DE PRUEBA
 * GET /api/seed-demo → carga productos y movimientos de prueba
 * ENUM real: entrada_inicial | entrada_devolucion | salida_venta | salida_merma | ajuste_manual
 */ __turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/node_modules/.pnpm/next@16.0.10_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/valva_boutique_pos/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        // 1. Categorías
        let cat = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id FROM categorias_padre WHERE nombre='BLUSAS' LIMIT 1");
        let catId;
        if (cat.length) {
            catId = cat[0].id;
        } else {
            const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("INSERT INTO categorias_padre (nombre, descripcion, estado) VALUES ('BLUSAS','Demo','activo')");
            catId = r.insertId;
        }
        let cat2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id FROM categorias_padre WHERE nombre='JEANS' LIMIT 1");
        let cat2Id;
        if (cat2.length) {
            cat2Id = cat2[0].id;
        } else {
            const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("INSERT INTO categorias_padre (nombre, descripcion, estado) VALUES ('JEANS','Demo','activo')");
            cat2Id = r.insertId;
        }
        // 2. Tipos de prenda
        let tipo1 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id FROM tipos_prenda WHERE nombre='BLUSA FLORAL' LIMIT 1");
        let tipo1Id;
        if (tipo1.length) {
            tipo1Id = tipo1[0].id;
        } else {
            const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("INSERT INTO tipos_prenda (nombre, categoria_padre_id, estado) VALUES ('BLUSA FLORAL',?,'activo')", [
                catId
            ]);
            tipo1Id = r.insertId;
        }
        let tipo2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id FROM tipos_prenda WHERE nombre='JEAN RECTO' LIMIT 1");
        let tipo2Id;
        if (tipo2.length) {
            tipo2Id = tipo2[0].id;
        } else {
            const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("INSERT INTO tipos_prenda (nombre, categoria_padre_id, estado) VALUES ('JEAN RECTO',?,'activo')", [
                cat2Id
            ]);
            tipo2Id = r.insertId;
        }
        // 3. Tallas
        const tallaMap = {};
        for (const v of [
            'S',
            'M',
            'L',
            '28',
            '30'
        ]){
            const ex = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id FROM tallas WHERE valor=? LIMIT 1", [
                v
            ]);
            if (ex.length) {
                tallaMap[v] = ex[0].id;
            } else {
                const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("INSERT INTO tallas (valor) VALUES (?)", [
                    v
                ]);
                tallaMap[v] = r.insertId;
            }
        }
        // 4. Proveedor
        let prov = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id FROM proveedores WHERE ruc='1790001122001' LIMIT 1");
        let provId;
        if (prov.length) {
            provId = prov[0].id;
        } else {
            const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("INSERT INTO proveedores (razon_social, ruc, telefono, estado) VALUES ('MODA DEMO SAS','1790001122001','0999000111','activo')");
            provId = r.insertId;
        }
        // 5. Productos con movimientos usando ENUM correcto
        const prods = [
            {
                sku: 'DEMO-BLU-S-NEG',
                nombre: 'BLUSA FLORAL',
                cat: catId,
                tipo: tipo1Id,
                talla: tallaMap['S'],
                color: 'NEGRO',
                compra: 15,
                venta: 35,
                stock: 20
            },
            {
                sku: 'DEMO-BLU-M-BLA',
                nombre: 'BLUSA FLORAL',
                cat: catId,
                tipo: tipo1Id,
                talla: tallaMap['M'],
                color: 'BLANCO',
                compra: 15,
                venta: 35,
                stock: 15
            },
            {
                sku: 'DEMO-BLU-L-ROJ',
                nombre: 'BLUSA FLORAL',
                cat: catId,
                tipo: tipo1Id,
                talla: tallaMap['L'],
                color: 'ROJO',
                compra: 15,
                venta: 35,
                stock: 10
            },
            {
                sku: 'DEMO-JEA-28-NAV',
                nombre: 'JEAN RECTO',
                cat: cat2Id,
                tipo: tipo2Id,
                talla: tallaMap['28'],
                color: 'NAVY',
                compra: 22,
                venta: 55,
                stock: 25
            },
            {
                sku: 'DEMO-JEA-30-NAV',
                nombre: 'JEAN RECTO',
                cat: cat2Id,
                tipo: tipo2Id,
                talla: tallaMap['30'],
                color: 'NAVY',
                compra: 22,
                venta: 55,
                stock: 18
            }
        ];
        const creados = [];
        for (const p of prods){
            const ex = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id, stock_actual FROM productos WHERE sku=? LIMIT 1", [
                p.sku
            ]);
            let pid;
            let stockInicial = p.stock;
            if (ex.length) {
                pid = ex[0].id;
                stockInicial = Number(ex[0].stock_actual);
                creados.push({
                    sku: p.sku,
                    id: pid,
                    status: 'ya_existia'
                });
            } else {
                const r = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO productos (sku,nombre,categoria_padre_id,tipo_prenda_id,talla_id,proveedor_id,color,precio_compra,precio_venta,precio_minimo,stock_actual,estado)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,'activo')`, [
                    p.sku,
                    p.nombre,
                    p.cat,
                    p.tipo,
                    p.talla,
                    provId,
                    p.color,
                    p.compra,
                    p.venta,
                    p.venta,
                    p.stock
                ]);
                pid = r.insertId;
                // Movimiento de compra inicial (ENUM: entrada_inicial)
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'entrada_inicial', ?, 0, ?, 'Compra inicial lote demo', DATE_SUB(NOW(), INTERVAL 30 DAY))`, [
                    pid,
                    p.stock,
                    p.stock
                ]);
                creados.push({
                    sku: p.sku,
                    id: pid,
                    status: 'creado'
                });
            }
            // Agregar movimientos de ejemplo para el primer producto
            if (p.sku === 'DEMO-BLU-S-NEG') {
                const s1 = stockInicial;
                // Segunda compra
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'entrada_inicial', 10, ?, ?, 'Segunda compra proveedor MODA DEMO', DATE_SUB(NOW(), INTERVAL 20 DAY))`, [
                    pid,
                    s1,
                    s1 + 10
                ]);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("UPDATE productos SET stock_actual = stock_actual + 10 WHERE id=?", [
                    pid
                ]);
                // Venta 1
                const s2 = s1 + 10;
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'salida_venta', -4, ?, ?, 'Venta mostrador # 00012', DATE_SUB(NOW(), INTERVAL 15 DAY))`, [
                    pid,
                    s2,
                    s2 - 4
                ]);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("UPDATE productos SET stock_actual = stock_actual - 4 WHERE id=?", [
                    pid
                ]);
                // Devolución cliente
                const s3 = s2 - 4;
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'entrada_devolucion', 1, ?, ?, 'Devolución cliente: talla incorrecta', DATE_SUB(NOW(), INTERVAL 10 DAY))`, [
                    pid,
                    s3,
                    s3 + 1
                ]);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("UPDATE productos SET stock_actual = stock_actual + 1 WHERE id=?", [
                    pid
                ]);
                // Venta 2
                const s4 = s3 + 1;
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'salida_venta', -2, ?, ?, 'Venta mostrador # 00025', DATE_SUB(NOW(), INTERVAL 5 DAY))`, [
                    pid,
                    s4,
                    s4 - 2
                ]);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("UPDATE productos SET stock_actual = stock_actual - 2 WHERE id=?", [
                    pid
                ]);
                // Ajuste manual
                const s5 = s4 - 2;
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'ajuste_manual', 3, ?, ?, 'Ajuste físico conteo inventario', NOW())`, [
                    pid,
                    s5,
                    s5 + 3
                ]);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("UPDATE productos SET stock_actual = stock_actual + 3 WHERE id=?", [
                    pid
                ]);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            mensaje: `✅ ${creados.filter((c)=>c.status === 'creado').length} productos nuevos, ${creados.filter((c)=>c.status === 'ya_existia').length} ya existían. Abre el Kardex y presiona "Consultar".`,
            detalle: creados
        });
    } catch (error) {
        console.error('Seed error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$valva_boutique_pos$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f5ca7a21._.js.map