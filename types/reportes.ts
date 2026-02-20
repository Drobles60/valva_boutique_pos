// Tipos para el sistema de reportes contables

export interface FiltrosReporte {
  fechaInicio: string
  fechaFin: string
  usuario_id?: number
  cliente_id?: number
  proveedor_id?: number
  categoria_id?: number
  producto_id?: number
}

// Reportes Financieros
export interface EstadoResultados {
  periodo: string
  ingresos: {
    ventasContado: number
    abonosCredito: number
    total: number
  }
  egresos: {
    costoVentas: number
    gastos: number
    total: number
  }
  utilidadBruta: number
  utilidadNeta: number
  margenUtilidad: number
}

export interface FlujoCaja {
  fecha: string
  concepto: string
  tipo: 'ingreso' | 'egreso'
  categoria: string
  monto: number
  saldo: number
  usuario: string
}

export interface ReporteGanancias {
  periodo: string
  totalVentas: number
  totalCostos: number
  utilidadBruta: number
  gastos: number
  utilidadNeta: number
  margenBruto: number
  margenNeto: number
  ventasPorProducto: Array<{
    producto_id: number
    nombre: string
    cantidad: number
    ventas: number
    costo: number
    utilidad: number
    margen: number
  }>
}

export interface ReporteGastos {
  periodo: string
  totalGastos: number
  gastosPorCategoria: Array<{
    categoria: string
    monto: number
    porcentaje: number
    cantidad: number
  }>
  gastosPorDia: Array<{
    fecha: string
    monto: number
    cantidad: number
  }>
  detalleGastos: Array<{
    id: number
    fecha: string
    categoria: string
    descripcion: string
    monto: number
    usuario: string
  }>
}

// Reportes de Ventas
export interface ReporteVentas {
  periodo: string
  totalVentas: number
  totalTransacciones: number
  ticketPromedio: number
  ventasContado: number
  ventasCredito: number
  ventasPorDia: Array<{
    fecha: string
    ventas: number
    transacciones: number
  }>
  ventasPorFormaPago: Array<{
    formaPago: string
    monto: number
    transacciones: number
    porcentaje: number
  }>
  topProductos: Array<{
    producto_id: number
    nombre: string
    cantidad: number
    ventas: number
  }>
}

export interface ReporteDiario {
  fecha: string
  aperturaBase: number
  ingresos: {
    ventasEfectivo: number
    ventasTarjeta: number
    ventasTransferencia: number
    abonosEfectivo: number
    abonosTarjeta: number
    abonosTransferencia: number
    total: number
  }
  egresos: {
    gastos: number
    retiros: number
    total: number
  }
  efectivoEsperado: number
  efectivoContado: number
  diferencia: number
  transacciones: number
  usuario: string
}

// Reportes de Clientes y Créditos
export interface ReporteCreditos {
  totalCartera: number
  clientesConDeuda: number
  creditosVigentes: number
  creditosVencidos: number
  promedioDeuda: number
  detalleClientes: Array<{
    cliente_id: number
    nombre: string
    telefono: string
    saldoPendiente: number
    facturas: number
    diasPromVencimiento: number
    ultimoPago: string
    estado: 'vigente' | 'vencido' | 'por_vencer'
  }>
}

export interface EstadoCuentaCliente {
  cliente: {
    id: number
    nombre: string
    telefono: string
    email?: string
  }
  periodo: string
  saldoInicial: number
  cargos: number
  abonos: number
  saldoFinal: number
  movimientos: Array<{
    fecha: string
    tipo: 'venta' | 'abono'
    referencia: string
    descripcion: string
    cargo: number
    abono: number
    saldo: number
  }>
}

// Reportes de Inventario
export interface ReporteInventario {
  fecha: string
  totalProductos: number
  valorInventario: number
  productosBajoStock: number
  productosSinMovimiento: number
  detalleProductos: Array<{
    id: number
    codigo: string
    nombre: string
    categoria: string
    stock: number
    stockMinimo: number
    precioCosto: number
    precioVenta: number
    valorInventario: number
    ultimoMovimiento: string
    estado: 'normal' | 'bajo_stock' | 'sin_movimiento'
  }>
}

export interface ReporteMovimientos {
  periodo: string
  totalMovimientos: number
  movimientosPorTipo: Array<{
    tipo: string
    cantidad: number
    porcentaje: number
  }>
  detalleMovimientos: Array<{
    id: number
    fecha: string
    producto: string
    tipo: string
    cantidad: number
    referencia: string
    usuario: string
  }>
}

export interface RotacionInventario {
  periodo: string
  rotacionPromedio: number
  diasPromedioVenta: number
  productos: Array<{
    id: number
    nombre: string
    categoria: string
    stockPromedio: number
    cantidadVendida: number
    rotacion: number
    diasVenta: number
    clasificacion: 'rapida' | 'media' | 'lenta' | 'sin_movimiento'
  }>
}

// Reportes de Proveedores
export interface ReporteCuentasPorPagar {
  totalPorPagar: number
  proveedoresConDeuda: number
  pedidosPendientes: number
  pedidosVencidos: number
  detalleProveedores: Array<{
    proveedor_id: number
    nombre: string
    telefono: string
    saldoPendiente: number
    pedidos: number
    diasPromVencimiento: number
    ultimoPago: string
    estado: 'vigente' | 'vencido' | 'por_vencer'
  }>
}

export interface ReporteCompras {
  periodo: string
  totalCompras: number
  totalPedidos: number
  promedioCompra: number
  comprasPorProveedor: Array<{
    proveedor_id: number
    nombre: string
    pedidos: number
    monto: number
    porcentaje: number
  }>
  productosMasComprados: Array<{
    producto_id: number
    nombre: string
    cantidad: number
    monto: number
    proveedor: string
  }>
}

// Reportes Administrativos
export interface ReporteDiarioPorUsuario {
  usuario: {
    id: number
    nombre: string
  }
  periodo: string
  ventasRealizadas: number
  montoVendido: number
  transacciones: number
  clientesAtendidos: number
  horasTrabajadas?: number
  ventaPorHora?: number
  detalleVentas: Array<{
    fecha: string
    hora: string
    venta_id: number
    cliente: string
    total: number
    formaPago: string
  }>
}

export interface ReporteDiferencias {
  periodo: string
  diferencias: Array<{
    fecha: string
    sesion_id: number
    usuario: string
    efectivoEsperado: number
    efectivoContado: number
    diferencia: number
    tipo: 'faltante' | 'sobrante' | 'exacto'
    notas?: string
  }>
  totalDiferencias: number
  sesionesConDiferencia: number
  sesionesTotales: number
  porcentajeExactitud: number
}

// Reportes Analíticos
export interface AnalisisRentabilidad {
  periodo: string
  productosMasRentables: Array<{
    producto_id: number
    nombre: string
    categoria: string
    cantidadVendida: number
    ventas: number
    costos: number
    utilidad: number
    margen: number
    roi: number
  }>
  categoriasMasRentables: Array<{
    categoria: string
    productos: number
    ventas: number
    costos: number
    utilidad: number
    margen: number
  }>
  clientesMasRentables: Array<{
    cliente_id: number
    nombre: string
    compras: number
    montoTotal: number
    utilidadGenerada: number
  }>
}

export interface ComparativoPeriodos {
  periodoActual: {
    inicio: string
    fin: string
    ventas: number
    utilidad: number
    transacciones: number
  }
  periodoAnterior: {
    inicio: string
    fin: string
    ventas: number
    utilidad: number
    transacciones: number
  }
  variacion: {
    ventas: number
    ventasPorcentaje: number
    utilidad: number
    utilidadPorcentaje: number
    transacciones: number
    transaccionesPorcentaje: number
  }
  tendencia: 'crecimiento' | 'decrecimiento' | 'estable'
}

// Reportes de Promociones y Descuentos
export interface ReportePromociones {
  periodo: string
  totalDescuentos: number
  descuentosAplicados: number
  promocionesActivas: Array<{
    id: number
    nombre: string
    tipo: string
    descuento: number
    vecesAplicado: number
    montoDescuento: number
    impactoVentas: number
  }>
  productosMasDescontados: Array<{
    producto_id: number
    nombre: string
    vecesDescontado: number
    montoDescuento: number
  }>
}

// Reporte Completo Ejecutivo
export interface ReporteEjecutivo {
  periodo: string
  resumenFinanciero: {
    totalIngresos: number
    totalEgresos: number
    utilidadNeta: number
    margenNeto: number
  }
  resumenVentas: {
    totalVentas: number
    transacciones: number
    ticketPromedio: number
    crecimientoVsAnterior: number
  }
  resumenInventario: {
    valorInventario: number
    productosBajoStock: number
    rotacionPromedio: number
  }
  resumenCartera: {
    cuentasPorCobrar: number
    clientesConDeuda: number
    diasPromedioCobranza: number
  }
  alertas: Array<{
    tipo: 'info' | 'warning' | 'error'
    mensaje: string
    prioridad: number
  }>
}
