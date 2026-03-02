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
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[project]/lib/auth/permissions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PERMISSION_INFO",
    ()=>PERMISSION_INFO,
    "ROLE_INFO",
    ()=>ROLE_INFO,
    "ROLE_PERMISSIONS",
    ()=>ROLE_PERMISSIONS,
    "getRolePermissions",
    ()=>getRolePermissions,
    "hasPermission",
    ()=>hasPermission
]);
const ROLE_PERMISSIONS = {
    administrador: [
        // TODOS los permisos
        'productos.ver',
        'productos.crear',
        'productos.editar',
        'productos.eliminar',
        'productos.precios',
        'inventario.ver',
        'inventario.ajustar',
        'inventario.movimientos',
        'ventas.crear',
        'ventas.ver',
        'ventas.anular',
        'ventas.devolucion',
        'clientes.ver',
        'clientes.crear',
        'clientes.editar',
        'clientes.eliminar',
        'clientes.abonar',
        'proveedores.ver',
        'proveedores.crear',
        'proveedores.editar',
        'proveedores.eliminar',
        'compras.ver',
        'compras.crear',
        'compras.editar',
        'compras.anular',
        'caja.abrir',
        'caja.cerrar',
        'caja.movimientos',
        'caja.ver',
        'reportes.ventas',
        'reportes.inventario',
        'reportes.financieros',
        'reportes.clientes',
        'config.ver',
        'config.editar',
        'config.webhooks',
        'usuarios.ver',
        'usuarios.crear',
        'usuarios.editar',
        'usuarios.eliminar',
        'descuentos.ver',
        'descuentos.crear',
        'descuentos.editar',
        'descuentos.eliminar',
        'gastos.ver',
        'gastos.crear',
        'gastos.editar',
        'gastos.eliminar'
    ],
    vendedor: [
        // Solo puede abrir caja y registrar ventas
        'caja.abrir',
        'caja.cerrar',
        'ventas.crear',
        'ventas.ver',
        'clientes.ver',
        'clientes.abonar'
    ]
};
function hasPermission(role, permission) {
    return ROLE_PERMISSIONS[role].includes(permission);
}
function getRolePermissions(role) {
    return ROLE_PERMISSIONS[role];
}
const ROLE_INFO = {
    administrador: {
        nombre: 'Administrador',
        descripcion: 'Acceso total al sistema con todos los permisos',
        color: 'bg-red-500'
    },
    vendedor: {
        nombre: 'Vendedor',
        descripcion: 'Puede abrir caja y registrar ventas únicamente',
        color: 'bg-blue-500'
    }
};
const PERMISSION_INFO = {
    'productos.ver': {
        nombre: 'Ver Productos',
        modulo: 'Productos'
    },
    'productos.crear': {
        nombre: 'Crear Productos',
        modulo: 'Productos'
    },
    'productos.editar': {
        nombre: 'Editar Productos',
        modulo: 'Productos'
    },
    'productos.eliminar': {
        nombre: 'Eliminar Productos',
        modulo: 'Productos'
    },
    'productos.precios': {
        nombre: 'Gestionar Precios',
        modulo: 'Productos'
    },
    'inventario.ver': {
        nombre: 'Ver Inventario',
        modulo: 'Inventario'
    },
    'inventario.ajustar': {
        nombre: 'Ajustar Inventario',
        modulo: 'Inventario'
    },
    'inventario.movimientos': {
        nombre: 'Ver Movimientos',
        modulo: 'Inventario'
    },
    'ventas.crear': {
        nombre: 'Realizar Ventas',
        modulo: 'Ventas'
    },
    'ventas.ver': {
        nombre: 'Ver Ventas',
        modulo: 'Ventas'
    },
    'ventas.anular': {
        nombre: 'Anular Ventas',
        modulo: 'Ventas'
    },
    'ventas.devolucion': {
        nombre: 'Procesar Devoluciones',
        modulo: 'Ventas'
    },
    'clientes.ver': {
        nombre: 'Ver Clientes',
        modulo: 'Clientes'
    },
    'clientes.crear': {
        nombre: 'Crear Clientes',
        modulo: 'Clientes'
    },
    'clientes.editar': {
        nombre: 'Editar Clientes',
        modulo: 'Clientes'
    },
    'clientes.eliminar': {
        nombre: 'Eliminar Clientes',
        modulo: 'Clientes'
    },
    'proveedores.ver': {
        nombre: 'Ver Proveedores',
        modulo: 'Proveedores'
    },
    'proveedores.crear': {
        nombre: 'Crear Proveedores',
        modulo: 'Proveedores'
    },
    'proveedores.editar': {
        nombre: 'Editar Proveedores',
        modulo: 'Proveedores'
    },
    'proveedores.eliminar': {
        nombre: 'Eliminar Proveedores',
        modulo: 'Proveedores'
    },
    'compras.ver': {
        nombre: 'Ver Compras',
        modulo: 'Compras'
    },
    'compras.crear': {
        nombre: 'Crear Compras',
        modulo: 'Compras'
    },
    'compras.editar': {
        nombre: 'Editar Compras',
        modulo: 'Compras'
    },
    'compras.anular': {
        nombre: 'Anular Compras',
        modulo: 'Compras'
    },
    'caja.abrir': {
        nombre: 'Abrir Caja',
        modulo: 'Caja'
    },
    'caja.cerrar': {
        nombre: 'Cerrar Caja',
        modulo: 'Caja'
    },
    'caja.movimientos': {
        nombre: 'Gestionar Movimientos',
        modulo: 'Caja'
    },
    'caja.ver': {
        nombre: 'Ver Caja',
        modulo: 'Caja'
    },
    'reportes.ventas': {
        nombre: 'Reportes de Ventas',
        modulo: 'Reportes'
    },
    'reportes.inventario': {
        nombre: 'Reportes de Inventario',
        modulo: 'Reportes'
    },
    'reportes.financieros': {
        nombre: 'Reportes Financieros',
        modulo: 'Reportes'
    },
    'reportes.clientes': {
        nombre: 'Reportes de Clientes',
        modulo: 'Reportes'
    },
    'config.ver': {
        nombre: 'Ver Configuración',
        modulo: 'Configuración'
    },
    'config.editar': {
        nombre: 'Editar Configuración',
        modulo: 'Configuración'
    },
    'config.webhooks': {
        nombre: 'Gestionar Webhooks',
        modulo: 'Configuración'
    },
    'usuarios.ver': {
        nombre: 'Ver Usuarios',
        modulo: 'Usuarios'
    },
    'usuarios.crear': {
        nombre: 'Crear Usuarios',
        modulo: 'Usuarios'
    },
    'usuarios.editar': {
        nombre: 'Editar Usuarios',
        modulo: 'Usuarios'
    },
    'usuarios.eliminar': {
        nombre: 'Eliminar Usuarios',
        modulo: 'Usuarios'
    },
    'descuentos.ver': {
        nombre: 'Ver Descuentos',
        modulo: 'Descuentos'
    },
    'descuentos.crear': {
        nombre: 'Crear Descuentos',
        modulo: 'Descuentos'
    },
    'descuentos.editar': {
        nombre: 'Editar Descuentos',
        modulo: 'Descuentos'
    },
    'descuentos.eliminar': {
        nombre: 'Eliminar Descuentos',
        modulo: 'Descuentos'
    },
    'gastos.ver': {
        nombre: 'Ver Gastos',
        modulo: 'Gastos'
    },
    'gastos.crear': {
        nombre: 'Crear Gastos',
        modulo: 'Gastos'
    },
    'gastos.editar': {
        nombre: 'Editar Gastos',
        modulo: 'Gastos'
    },
    'gastos.eliminar': {
        nombre: 'Eliminar Gastos',
        modulo: 'Gastos'
    },
    'clientes.abonar': {
        nombre: 'Registrar Abonos',
        modulo: 'Clientes'
    }
};
}),
"[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
__turbopack_context__.s([
    "GET",
    ()=>handler,
    "POST",
    ()=>handler,
    "authOptions",
    ()=>authOptions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-auth@4.24.13_next@16.0_c363cfde124e15e27afb1c860ed17f62/node_modules/next-auth/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-auth@4.24.13_next@16.0_c363cfde124e15e27afb1c860ed17f62/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/bcryptjs@3.0.3/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [app-route] (ecmascript)");
;
;
;
;
const authOptions = {
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            name: 'Credentials',
            credentials: {
                username: {
                    label: "Username",
                    type: "text"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }
                try {
                    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM usuarios WHERE username = ? AND estado = ?', [
                        credentials.username,
                        'activo'
                    ]);
                    if (!user) {
                        return null;
                    }
                    const isValid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$3$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].compare(credentials.password, user.password_hash);
                    if (!isValid) {
                        return null;
                    }
                    // Actualizar último acceso
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?', [
                        user.id
                    ]);
                    return {
                        id: user.id.toString(),
                        name: `${user.nombre} ${user.apellido}`,
                        email: user.email,
                        username: user.username,
                        rol: user.rol
                    };
                } catch (error) {
                    console.error('Error en autenticación:', error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt ({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.rol = user.rol;
            }
            return token;
        },
        async session ({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.username = token.username;
                session.user.rol = token.rol;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login'
    },
    secret: process.env.NEXTAUTH_SECRET
};
const handler = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])(authOptions);
;
}),
"[project]/lib/auth/check-permission.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
__turbopack_context__.s([
    "checkAllPermissions",
    ()=>checkAllPermissions,
    "checkAnyPermission",
    ()=>checkAnyPermission,
    "checkPermission",
    ()=>checkPermission,
    "getCurrentUserRole",
    ()=>getCurrentUserRole,
    "isAdmin",
    ()=>isAdmin,
    "isVendedor",
    ()=>isVendedor,
    "requirePermission",
    ()=>requirePermission
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-auth@4.24.13_next@16.0_c363cfde124e15e27afb1c860ed17f62/node_modules/next-auth/next/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/permissions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/api/auth/[...nextauth]/route.ts [app-route] (ecmascript)");
;
;
;
async function checkPermission(permission) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.rol) {
            return false;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasPermission"])(session.user.rol, permission);
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}
async function requirePermission(permission) {
    try {
        const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
        if (!session?.user?.rol) {
            throw new Error('Debes iniciar sesión para acceder a este recurso');
        }
        const allowed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasPermission"])(session.user.rol, permission);
        if (!allowed) {
            throw new Error('No tienes permiso para realizar esta acción');
        }
    } catch (error) {
        throw error;
    }
}
async function checkAnyPermission(permissions) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    if (!session?.user?.rol) {
        return false;
    }
    return permissions.some((permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasPermission"])(session.user.rol, permission));
}
async function checkAllPermissions(permissions) {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    if (!session?.user?.rol) {
        return false;
    }
    return permissions.every((permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$permissions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasPermission"])(session.user.rol, permission));
}
async function getCurrentUserRole() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$auth$40$4$2e$24$2e$13_next$40$16$2e$0_c363cfde124e15e27afb1c860ed17f62$2f$node_modules$2f$next$2d$auth$2f$next$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getServerSession"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$api$2f$auth$2f5b2e2e2e$nextauth$5d2f$route$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authOptions"]);
    return session?.user?.rol || null;
}
async function isAdmin() {
    const role = await getCurrentUserRole();
    return role === 'administrador';
}
async function isVendedor() {
    const role = await getCurrentUserRole();
    return role === 'vendedor';
}
}),
"[project]/app/api/cuentas-por-cobrar/[id]/abonos/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$check$2d$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth/check-permission.ts [app-route] (ecmascript)");
;
;
;
async function GET(request, { params }) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$check$2d$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])('clientes.ver');
        const { id: cuentaId } = await params;
        // Verificar que la cuenta existe
        const cuenta = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])('SELECT * FROM cuentas_por_cobrar WHERE id = ?', [
            cuentaId
        ]);
        if (!cuenta) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Cuenta no encontrada'
            }, {
                status: 404
            });
        }
        // Obtener abonos de esta cuenta específica
        const abonos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT 
        a.id,
        a.monto,
        a.fecha_abono as fecha,
        a.metodo_pago,
        a.referencia_transferencia as referencia,
        a.notas,
        a.created_at,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        v.numero_venta
      FROM abonos a
      INNER JOIN cuentas_por_cobrar cpc ON a.cuenta_por_cobrar_id = cpc.id
      INNER JOIN ventas v ON cpc.venta_id = v.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.cuenta_por_cobrar_id = ?
      ORDER BY a.fecha_abono DESC`, [
            cuentaId
        ]);
        // Formatear respuesta
        const abonosFormateados = abonos.map((abono)=>({
                ...abono,
                metodoPago: abono.metodo_pago === 'efectivo' ? 'Efectivo' : abono.metodo_pago === 'transferencia' ? 'Transferencia' : 'Otro',
                usuario: `${abono.usuario_nombre || ''} ${abono.usuario_apellido || ''}`.trim() || 'Sistema'
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: {
                cuenta,
                abonos: abonosFormateados
            }
        });
    } catch (error) {
        console.error('Error al obtener abonos:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Error al obtener abonos'
        }, {
            status: error.status || 500
        });
    }
}
async function POST(request, { params }) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2f$check$2d$permission$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermission"])('clientes.abonar');
        const { id: cuentaId } = await params;
        const body = await request.json();
        const { monto, metodo_pago, referencia_transferencia, notas, usuario_id } = body;
        // Validaciones
        if (!monto || monto <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'El monto debe ser mayor a 0'
            }, {
                status: 400
            });
        }
        if (!metodo_pago) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Debe especificar el método de pago'
            }, {
                status: 400
            });
        }
        // Verificar que la cuenta existe
        const cuenta = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT cpc.*, c.nombre as cliente_nombre, v.numero_venta,
              (cpc.monto_total - COALESCE(a.total_abonado, 0)) as saldo_pendiente_real,
              LEAST(COALESCE(a.total_abonado, 0), cpc.monto_total) as total_abonado_real
       FROM cuentas_por_cobrar cpc
       INNER JOIN clientes c ON cpc.cliente_id = c.id
       INNER JOIN ventas v ON cpc.venta_id = v.id
       LEFT JOIN (
         SELECT cuenta_por_cobrar_id, COALESCE(SUM(monto), 0) as total_abonado
         FROM abonos
         GROUP BY cuenta_por_cobrar_id
       ) a ON a.cuenta_por_cobrar_id = cpc.id
       WHERE cpc.id = ?`, [
            cuentaId
        ]);
        if (!cuenta) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Cuenta no encontrada'
            }, {
                status: 404
            });
        }
        // Validar que el monto no exceda el saldo pendiente (usar valor absoluto por si hay saldos negativos por error)
        const saldoPendienteReal = Number(cuenta.saldo_pendiente_real || 0);
        if (saldoPendienteReal <= 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'La cuenta ya no tiene saldo pendiente'
            }, {
                status: 400
            });
        }
        if (monto > saldoPendienteReal) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: `El monto no puede exceder el saldo pendiente de $${saldoPendienteReal.toFixed(2)}`
            }, {
                status: 400
            });
        }
        // Insertar abono
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO abonos (
        cuenta_por_cobrar_id,
        monto,
        metodo_pago,
        referencia_transferencia,
        notas,
        usuario_id,
        fecha_abono
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`, [
            cuentaId,
            monto,
            metodo_pago,
            referencia_transferencia || null,
            notas || null,
            usuario_id || null
        ]);
        // El trigger actualizar_saldo_cliente_abono se encarga de actualizar
        // cuenta.saldo_pendiente y cliente.saldo_pendiente automáticamente
        // Obtener el saldo actualizado
        const cuentaActualizada = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["queryOne"])(`SELECT cpc.*, v.numero_venta, c.nombre as cliente_nombre,
              (cpc.monto_total - COALESCE(a.total_abonado, 0)) as saldo_pendiente_real,
              LEAST(COALESCE(a.total_abonado, 0), cpc.monto_total) as total_abonado_real
       FROM cuentas_por_cobrar cpc
       INNER JOIN ventas v ON cpc.venta_id = v.id
       INNER JOIN clientes c ON cpc.cliente_id = c.id
       LEFT JOIN (
         SELECT cuenta_por_cobrar_id, COALESCE(SUM(monto), 0) as total_abonado
         FROM abonos
         GROUP BY cuenta_por_cobrar_id
       ) a ON a.cuenta_por_cobrar_id = cpc.id
       WHERE cpc.id = ?`, [
            cuentaId
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Abono registrado exitosamente',
            data: {
                abono_id: result.insertId,
                cuenta: cuentaActualizada,
                nuevo_saldo_pendiente: Math.max(0, Number(cuentaActualizada?.saldo_pendiente_real ?? cuentaActualizada?.saldo_pendiente ?? 0)),
                numero_venta: cuentaActualizada.numero_venta
            }
        });
    } catch (error) {
        console.error('Error al registrar abono:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$10_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Error al registrar abono'
        }, {
            status: error.status || 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f7c2dce2._.js.map