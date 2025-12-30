export interface Product {
  id: string
  codigo: string
  nombre: string
  referencia: string // Código de barras
  categoria: string
  cantidad: number
  precioCosto: number
  precioVentaPublico: number // Precio retail normal
  precioMayorista: number // Precio wholesale
  precioEspecial: number // Precio especial
  stockMinimo?: number
  proveedor?: string
  descuento?: number
  precioConDescuento?: number
  createdAt: string
  updatedAt: string
}

export interface Cliente {
  id: string
  nombre: string
  identificacion: string
  telefono: string
  email?: string
  direccion?: string
  tipoCliente: "publico" | "mayorista" | "especial"
  limiteCredito: number
  saldoActual: number
  createdAt: string
}

export interface Venta {
  id: string
  fecha: string
  cliente: Cliente
  productos: {
    producto: Product
    cantidad: number
    precioUnitario: number
    subtotal: number
  }[]
  subtotal: number
  impuestos: number
  descuento: number
  total: number
  metodoPago: string[]
  estado: "completada" | "credito" | "abono"
  vendedor: string
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: "administrador" | "vendedor" | "contador" | "inventario"
  permisos: {
    verCostos: boolean
    editarPrecios: boolean
    gestionarCreditos: boolean
    verReportes: boolean
    gestionarUsuarios: boolean
    abrirCaja: boolean
    hacerDescuentos: boolean
  }
  createdAt: string
}

export interface Abono {
  id: string
  clienteId: string
  monto: number
  fecha: string
  metodoPago: string
  referencia?: string
  notas?: string
  usuario: string
}
