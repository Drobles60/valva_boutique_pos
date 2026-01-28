export interface Product {
  id: string
  codigo: string
  nombre: string
  referencia: string // SKU
  categoria: string
  tipoPrenda?: string // Tipo específico de prenda
  talla?: string // Talla del producto
  cantidad: number
  precioCosto: number
  precioVentaPublico: number // Precio retail normal
  precioMayorista: number // Precio wholesale
  precioEspecial: number // Precio especial/mínimo
  stockMinimo?: number
  proveedor?: string
  descuento?: number
  precioConDescuento?: number
  color?: string // Color del producto
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
  id: number
  username: string
  email: string
  nombre: string
  apellido: string
  telefono?: string
  rol: "administrador" | "vendedor"
  estado: "activo" | "inactivo" | "suspendido"
  ultimo_acceso?: string
  created_at: string
  updated_at?: string
}

export interface UsuarioFormData {
  username: string
  email: string
  password?: string
  nombre: string
  apellido: string
  telefono?: string
  rol: "administrador" | "vendedor"
  estado?: "activo" | "inactivo" | "suspendido"
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
