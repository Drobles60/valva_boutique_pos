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
"[project]/app/api/kardex/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        // ── Opciones de filtros ─────────────────────────────────────────────────
        if (action === 'filtros') {
            const [categorias, tallas, colores, usuarios, proveedores] = await Promise.all([
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id, nombre FROM categorias_padre WHERE estado='activo' ORDER BY nombre"),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT DISTINCT t.id, t.valor FROM tallas t INNER JOIN productos p ON p.talla_id=t.id ORDER BY t.valor"),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT DISTINCT color FROM productos WHERE color IS NOT NULL AND color<>'' ORDER BY color"),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id, nombre FROM usuarios WHERE estado='activo' ORDER BY nombre"),
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])("SELECT id, razon_social FROM proveedores WHERE estado='activo' ORDER BY razon_social")
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                categorias,
                tallas,
                colores,
                usuarios,
                proveedores
            });
        }
        // ── Datos del Kardex con filtros ────────────────────────────────────────
        const producto_id = searchParams.get('producto_id');
        const categoria_id = searchParams.get('categoria_id');
        const talla = searchParams.get('talla');
        const color = searchParams.get('color');
        const fecha_inicio = searchParams.get('fecha_inicio');
        const fecha_fin = searchParams.get('fecha_fin');
        const tercero = searchParams.get('tercero'); // texto libre
        const usuario_id = searchParams.get('usuario_id');
        const tipo_mov = searchParams.get('tipo_movimiento');
        const referencia = searchParams.get('referencia');
        let where = 'WHERE 1=1';
        const params = [];
        if (producto_id) {
            where += ' AND mi.producto_id = ?';
            params.push(producto_id);
        }
        if (categoria_id) {
            where += ' AND p.categoria_padre_id = ?';
            params.push(categoria_id);
        }
        if (talla) {
            where += ' AND t.valor = ?';
            params.push(talla);
        }
        if (color) {
            where += ' AND LOWER(p.color) LIKE ?';
            params.push(`%${color.toLowerCase()}%`);
        }
        if (fecha_inicio) {
            where += ' AND DATE(mi.fecha_movimiento) >= ?';
            params.push(fecha_inicio);
        }
        if (fecha_fin) {
            where += ' AND DATE(mi.fecha_movimiento) <= ?';
            params.push(fecha_fin);
        }
        if (usuario_id) {
            where += ' AND mi.usuario_id = ?';
            params.push(usuario_id);
        }
        if (referencia) {
            where += ' AND (v.numero_venta LIKE ? OR CAST(mi.id AS CHAR) = ?)';
            params.push(`%${referencia}%`, referencia);
        }
        if (tercero) {
            where += ' AND (pv.razon_social LIKE ? OR c.nombre LIKE ?)';
            params.push(`%${tercero}%`, `%${tercero}%`);
        }
        if (tipo_mov) {
            const mapaTipo = {
                'Compra': [
                    'entrada_inicial'
                ],
                'Venta': [
                    'salida_venta'
                ],
                'Devolucion': [
                    'entrada_devolucion'
                ],
                'Ajuste': [
                    'ajuste_manual'
                ],
                'Merma': [
                    'salida_merma'
                ]
            };
            const tipos = mapaTipo[tipo_mov] || [
                tipo_mov
            ];
            where += ` AND mi.tipo_movimiento IN (${tipos.map(()=>'?').join(',')})`;
            params.push(...tipos);
        }
        const movimientos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT
        mi.id,
        mi.fecha_movimiento,
        mi.tipo_movimiento,
        mi.cantidad,
        mi.stock_anterior,
        mi.stock_nuevo,
        mi.motivo,
        mi.venta_id,
        mi.usuario_id,
        p.id          AS producto_id,
        p.nombre      AS producto_nombre,
        p.sku,
        p.color,
        p.precio_compra,
        p.precio_venta,
        p.stock_actual,
        cp.nombre     AS categoria_nombre,
        tp.nombre     AS tipo_prenda_nombre,
        t.valor       AS talla_valor,
        pv.razon_social AS proveedor_nombre,
        v.numero_venta,
        c.nombre      AS cliente_nombre,
        u.nombre      AS usuario_nombre
       FROM movimientos_inventario mi
       INNER JOIN productos p   ON mi.producto_id = p.id
       LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
       LEFT JOIN tipos_prenda    tp ON p.tipo_prenda_id = tp.id
       LEFT JOIN tallas          t  ON p.talla_id = t.id
       LEFT JOIN proveedores     pv ON p.proveedor_id = pv.id
       LEFT JOIN ventas          v  ON mi.venta_id = v.id
       LEFT JOIN clientes        c  ON v.cliente_id = c.id
       LEFT JOIN usuarios        u  ON mi.usuario_id = u.id
       ${where}
       ORDER BY mi.fecha_movimiento ASC, mi.id ASC`, params);
        // ── Calcular saldo acumulado por variante (Promedio Ponderado) ──────────
        // clave: producto_id (ya que cada producto es una variante única en este sistema)
        const saldoPorVariante = {};
        const resultado = movimientos.map((mov)=>{
            const key = mov.producto_id;
            if (!saldoPorVariante[key]) saldoPorVariante[key] = {
                cant: 0,
                valor: 0
            };
            const saldo = saldoPorVariante[key];
            const cantidad = Math.abs(Number(mov.cantidad));
            const costoUnit = Number(mov.precio_compra) || 0;
            const tiposEntrada = [
                'entrada_inicial',
                'entrada_devolucion',
                'entrada_compra',
                'entrada'
            ];
            const tiposSalida = [
                'salida_venta',
                'salida_merma',
                'salida_compra',
                'venta',
                'salida'
            ];
            const esEntrada = tiposEntrada.includes(mov.tipo_movimiento);
            const esSalida = tiposSalida.includes(mov.tipo_movimiento);
            const esAjuste = mov.tipo_movimiento === 'ajuste_manual';
            let entradaCant = 0, entradaValor = 0;
            let salidaCant = 0, salidaValor = 0;
            // Costo promedio ANTES del movimiento
            const costoPromedioPrev = saldo.cant > 0 ? saldo.valor / saldo.cant : costoUnit;
            if (esEntrada) {
                entradaCant = cantidad;
                entradaValor = cantidad * costoUnit;
                saldo.cant += cantidad;
                saldo.valor += entradaValor;
            } else if (esSalida) {
                salidaCant = cantidad;
                const costoSalida = saldo.cant > 0 ? saldo.valor / saldo.cant : costoUnit;
                salidaValor = cantidad * costoSalida;
                saldo.cant -= cantidad;
                saldo.valor -= salidaValor;
                if (saldo.cant < 0) saldo.cant = 0;
                if (saldo.valor < 0) saldo.valor = 0;
            }
            const costoPromedio = saldo.cant > 0 ? saldo.valor / saldo.cant : costoUnit;
            // Referencia / documento
            const referencia = mov.numero_venta || `MOV-${String(mov.id).padStart(6, '0')}`;
            // Tercero
            const terceroStr = mov.cliente_nombre || mov.proveedor_nombre || '—';
            // Tipo legible
            const tipoLegible = getTipoLegible(mov.tipo_movimiento);
            return {
                id: mov.id,
                fecha: mov.fecha_movimiento,
                referencia,
                descripcion: mov.motivo || tipoLegible,
                tercero: terceroStr,
                producto: mov.producto_nombre,
                sku: mov.sku,
                tipo_prenda: mov.tipo_prenda_nombre,
                talla: mov.talla_valor,
                color: mov.color,
                tipo_movimiento: tipoLegible,
                tipo_raw: mov.tipo_movimiento,
                entrada_cant: entradaCant,
                entrada_valor: entradaValor,
                salida_cant: salidaCant,
                salida_valor: salidaValor,
                saldo_cant: saldo.cant,
                saldo_valor: saldo.valor,
                costo_unitario: costoUnit,
                costo_promedio: costoPromedio,
                stock_actual: mov.stock_actual,
                usuario: mov.usuario_nombre
            };
        });
        // ── Resumen del período ─────────────────────────────────────────────────
        const totalEntradas = resultado.reduce((s, r)=>s + r.entrada_cant, 0);
        const totalSalidas = resultado.reduce((s, r)=>s + r.salida_cant, 0);
        const totalEntradaValor = resultado.reduce((s, r)=>s + r.entrada_valor, 0);
        const totalSalidaValor = resultado.reduce((s, r)=>s + r.salida_valor, 0);
        const stockFinal = resultado.at(-1)?.saldo_cant ?? 0;
        const valorFinal = resultado.at(-1)?.saldo_valor ?? 0;
        // Alertas de stock bajo (sin stock_minimo en BD, se omite)
        const stockMinimos = [];
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            movimientos: resultado,
            resumen: {
                total_entradas: totalEntradas,
                total_salidas: totalSalidas,
                total_entrada_valor: totalEntradaValor,
                total_salida_valor: totalSalidaValor,
                stock_final: stockFinal,
                valor_final: valorFinal,
                stock_minimos: stockMinimos
            }
        });
    } catch (error) {
        console.error('Error kardex:', error);
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
        const { producto_id, tipo_movimiento, cantidad, motivo, usuario_id } = body;
        if (!producto_id || !tipo_movimiento || !cantidad) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Faltan campos obligatorios'
        }, {
            status: 400
        });
        const prod = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT id, stock_actual, precio_compra, precio_venta, precio_minimo FROM productos WHERE id = ?', [
            producto_id
        ]);
        if (!prod.length) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Producto no encontrado'
        }, {
            status: 404
        });
        const stockAnterior = Number(prod[0].stock_actual);
        const cantNum = Number(cantidad);
        const precioCompra = Number(prod[0].precio_compra) || 0;
        const precioVenta = Number(prod[0].precio_venta) || 0;
        const precioMinimo = Number(prod[0].precio_minimo) || 0;
        const esEntrada = [
            'ajuste_entrada',
            'devolucion_entrada',
            'traslado_entrada',
            'entrada_inicial',
            'entrada_devolucion',
            'entrada_compra',
            'entrada_ajuste'
        ].includes(tipo_movimiento);
        const stockNuevo = esEntrada ? stockAnterior + cantNum : stockAnterior - cantNum;
        if (stockNuevo < 0) return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: `Stock insuficiente. Actual: ${stockAnterior}`
        }, {
            status: 400
        });
        const cantFinal = esEntrada ? cantNum : -cantNum;
        const costoTotal = Math.abs(cantNum) * precioCompra;
        // Registrar en movimientos_inventario (compatibilidad)
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, usuario_id, fecha_movimiento)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`, [
            producto_id,
            tipo_movimiento,
            cantFinal,
            stockAnterior,
            stockNuevo,
            motivo || 'Ajuste manual',
            usuario_id || null
        ]);
        // Mapear tipo para kardex
        const mapaKardex = {
            'ajuste_manual': 'ajuste_manual',
            'entrada_inicial': 'entrada_compra',
            'entrada_compra': 'entrada_compra',
            'entrada_devolucion': 'entrada_devolucion',
            'entrada_ajuste': 'entrada_ajuste',
            'ajuste_entrada': 'entrada_ajuste',
            'salida_merma': 'salida_merma',
            'salida_venta': 'salida_venta',
            'salida_ajuste': 'salida_ajuste',
            'ajuste_salida': 'salida_ajuste'
        };
        const tipoKardex = mapaKardex[tipo_movimiento] || (esEntrada ? 'entrada_ajuste' : 'salida_ajuste');
        // Registrar en kardex (tabla nueva - registro completo)
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO kardex (
        producto_id, tipo_movimiento,
        cantidad, stock_anterior, stock_nuevo,
        precio_compra, precio_venta, precio_minimo, costo_total,
        saldo_cantidad, saldo_costo,
        usuario_id, motivo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            producto_id,
            tipoKardex,
            cantFinal,
            stockAnterior,
            stockNuevo,
            precioCompra,
            precioVenta,
            precioMinimo,
            costoTotal,
            stockNuevo,
            stockNuevo * precioCompra,
            usuario_id || null,
            motivo || 'Ajuste manual'
        ]);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('UPDATE productos SET stock_actual = ? WHERE id = ?', [
            stockNuevo,
            producto_id
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            stock_nuevo: stockNuevo
        }, {
            status: 201
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
function getTipoLegible(tipo) {
    const m = {
        entrada_inicial: 'Compra',
        entrada_devolucion: 'Dev. Entrada',
        salida_venta: 'Venta',
        salida_merma: 'Merma',
        ajuste_manual: 'Ajuste',
        // legacy / otros
        entrada_compra: 'Compra',
        ajuste_entrada: 'Ajuste +',
        ajuste_salida: 'Ajuste -'
    };
    return m[tipo] || tipo;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d6916db3._.js.map