export type Role = 'administrador' | 'vendedor';

export type Permission =
  // Productos
  | 'productos.ver'
  | 'productos.crear'
  | 'productos.editar'
  | 'productos.eliminar'
  | 'productos.precios'
  // Inventario
  | 'inventario.ver'
  | 'inventario.ajustar'
  | 'inventario.movimientos'
  // Ventas
  | 'ventas.crear'
  | 'ventas.ver'
  | 'ventas.anular'
  | 'ventas.devolucion'
  // Clientes
  | 'clientes.ver'
  | 'clientes.crear'
  | 'clientes.editar'
  | 'clientes.eliminar'
  | 'clientes.abonar'
  // Proveedores
  | 'proveedores.ver'
  | 'proveedores.crear'
  | 'proveedores.editar'
  | 'proveedores.eliminar'
  // Compras
  | 'compras.ver'
  | 'compras.crear'
  | 'compras.editar'
  | 'compras.anular'
  // Caja
  | 'caja.abrir'
  | 'caja.cerrar'
  | 'caja.movimientos'
  | 'caja.ver'
  // Reportes
  | 'reportes.ventas'
  | 'reportes.inventario'
  | 'reportes.financieros'
  | 'reportes.clientes'
  // Configuración
  | 'config.ver'
  | 'config.editar'
  | 'config.webhooks'
  // Usuarios
  | 'usuarios.ver'
  | 'usuarios.crear'
  | 'usuarios.editar'
  | 'usuarios.eliminar'
  // Descuentos
  | 'descuentos.ver'
  | 'descuentos.crear'
  | 'descuentos.editar'
  | 'descuentos.eliminar'
  // Gastos
  | 'gastos.ver'
  | 'gastos.crear'
  | 'gastos.editar'
  | 'gastos.eliminar';

// Definir permisos por rol (FUENTE ÚNICA DE VERDAD)
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
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
    'gastos.eliminar',
  ],
  
  vendedor: [
    // Solo puede abrir caja y registrar ventas
    'caja.abrir',
    'caja.cerrar',
    'ventas.crear',
    'ventas.ver',
    'clientes.ver', // Necesita ver clientes para asignar en ventas
    'clientes.abonar', // Puede registrar abonos
  ],
};

// Función para verificar si un rol tiene un permiso
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Función para obtener todos los permisos de un rol
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

// Información descriptiva de roles
export const ROLE_INFO: Record<Role, { nombre: string; descripcion: string; color: string }> = {
  administrador: {
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema con todos los permisos',
    color: 'bg-red-500',
  },
  vendedor: {
    nombre: 'Vendedor',
    descripcion: 'Puede abrir caja y registrar ventas únicamente',
    color: 'bg-blue-500',
  },
};

// Obtener información de un permiso
export const PERMISSION_INFO: Record<Permission, { nombre: string; modulo: string }> = {
  'productos.ver': { nombre: 'Ver Productos', modulo: 'Productos' },
  'productos.crear': { nombre: 'Crear Productos', modulo: 'Productos' },
  'productos.editar': { nombre: 'Editar Productos', modulo: 'Productos' },
  'productos.eliminar': { nombre: 'Eliminar Productos', modulo: 'Productos' },
  'productos.precios': { nombre: 'Gestionar Precios', modulo: 'Productos' },
  'inventario.ver': { nombre: 'Ver Inventario', modulo: 'Inventario' },
  'inventario.ajustar': { nombre: 'Ajustar Inventario', modulo: 'Inventario' },
  'inventario.movimientos': { nombre: 'Ver Movimientos', modulo: 'Inventario' },
  'ventas.crear': { nombre: 'Realizar Ventas', modulo: 'Ventas' },
  'ventas.ver': { nombre: 'Ver Ventas', modulo: 'Ventas' },
  'ventas.anular': { nombre: 'Anular Ventas', modulo: 'Ventas' },
  'ventas.devolucion': { nombre: 'Procesar Devoluciones', modulo: 'Ventas' },
  'clientes.ver': { nombre: 'Ver Clientes', modulo: 'Clientes' },
  'clientes.crear': { nombre: 'Crear Clientes', modulo: 'Clientes' },
  'clientes.editar': { nombre: 'Editar Clientes', modulo: 'Clientes' },
  'clientes.eliminar': { nombre: 'Eliminar Clientes', modulo: 'Clientes' },
  'proveedores.ver': { nombre: 'Ver Proveedores', modulo: 'Proveedores' },
  'proveedores.crear': { nombre: 'Crear Proveedores', modulo: 'Proveedores' },
  'proveedores.editar': { nombre: 'Editar Proveedores', modulo: 'Proveedores' },
  'proveedores.eliminar': { nombre: 'Eliminar Proveedores', modulo: 'Proveedores' },
  'compras.ver': { nombre: 'Ver Compras', modulo: 'Compras' },
  'compras.crear': { nombre: 'Crear Compras', modulo: 'Compras' },
  'compras.editar': { nombre: 'Editar Compras', modulo: 'Compras' },
  'compras.anular': { nombre: 'Anular Compras', modulo: 'Compras' },
  'caja.abrir': { nombre: 'Abrir Caja', modulo: 'Caja' },
  'caja.cerrar': { nombre: 'Cerrar Caja', modulo: 'Caja' },
  'caja.movimientos': { nombre: 'Gestionar Movimientos', modulo: 'Caja' },
  'caja.ver': { nombre: 'Ver Caja', modulo: 'Caja' },
  'reportes.ventas': { nombre: 'Reportes de Ventas', modulo: 'Reportes' },
  'reportes.inventario': { nombre: 'Reportes de Inventario', modulo: 'Reportes' },
  'reportes.financieros': { nombre: 'Reportes Financieros', modulo: 'Reportes' },
  'reportes.clientes': { nombre: 'Reportes de Clientes', modulo: 'Reportes' },
  'config.ver': { nombre: 'Ver Configuración', modulo: 'Configuración' },
  'config.editar': { nombre: 'Editar Configuración', modulo: 'Configuración' },
  'config.webhooks': { nombre: 'Gestionar Webhooks', modulo: 'Configuración' },
  'usuarios.ver': { nombre: 'Ver Usuarios', modulo: 'Usuarios' },
  'usuarios.crear': { nombre: 'Crear Usuarios', modulo: 'Usuarios' },
  'usuarios.editar': { nombre: 'Editar Usuarios', modulo: 'Usuarios' },
  'usuarios.eliminar': { nombre: 'Eliminar Usuarios', modulo: 'Usuarios' },
  'descuentos.ver': { nombre: 'Ver Descuentos', modulo: 'Descuentos' },
  'descuentos.crear': { nombre: 'Crear Descuentos', modulo: 'Descuentos' },
  'descuentos.editar': { nombre: 'Editar Descuentos', modulo: 'Descuentos' },
  'descuentos.eliminar': { nombre: 'Eliminar Descuentos', modulo: 'Descuentos' },
  'gastos.ver': { nombre: 'Ver Gastos', modulo: 'Gastos' },
  'gastos.crear': { nombre: 'Crear Gastos', modulo: 'Gastos' },
  'gastos.editar': { nombre: 'Editar Gastos', modulo: 'Gastos' },
  'gastos.eliminar': { nombre: 'Eliminar Gastos', modulo: 'Gastos' },
  'clientes.abonar': { nombre: 'Registrar Abonos', modulo: 'Clientes' },
};
