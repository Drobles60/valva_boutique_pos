"use client"

import type { Product, Cliente, Venta, Usuario, Abono } from "./types"
import { enviarWebhook } from "./webhooks"

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: "valva_products",
  CLIENTES: "valva_clientes",
  VENTAS: "valva_ventas",
  USUARIOS: "valva_usuarios",
  CURRENT_USER: "valva_current_user",
  ABONOS: "valva_abonos",
}

// Products
export const getProducts = (): Product[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
  return data ? JSON.parse(data) : []
}

export const saveProduct = (product: Product) => {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === product.id)

  const isNew = index < 0

  if (index >= 0) {
    products[index] = product
  } else {
    products.push(product)
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))

  if (product.stockMinimo && product.cantidad <= product.stockMinimo) {
    enviarWebhook("bajo_inventario", {
      producto: product.nombre,
      cantidad: product.cantidad,
      stockMinimo: product.stockMinimo,
      codigo: product.codigo,
    })
  }
}

export const deleteProduct = (id: string) => {
  const products = getProducts().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
}

// Clientes
export const getClientes = (): Cliente[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTES)
  return data ? JSON.parse(data) : []
}

export const saveCliente = (cliente: Cliente) => {
  const clientes = getClientes()
  const index = clientes.findIndex((c) => c.id === cliente.id)

  const isNew = index < 0

  if (index >= 0) {
    clientes[index] = cliente
  } else {
    clientes.push(cliente)
  }
  localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes))

  if (isNew) {
    enviarWebhook("nuevo_cliente", {
      nombre: cliente.nombre,
      identificacion: cliente.identificacion,
      tipoCliente: cliente.tipoCliente,
      limiteCredito: cliente.limiteCredito,
    })
  }
}

export const deleteCliente = (id: string) => {
  const clientes = getClientes().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes))
}

// Ventas
export const getVentas = (): Venta[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.VENTAS)
  return data ? JSON.parse(data) : []
}

export const saveVenta = (venta: Venta) => {
  const ventas = getVentas()
  ventas.push(venta)
  localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(ventas))

  enviarWebhook("nueva_venta", {
    id: venta.id,
    cliente: venta.cliente.nombre,
    total: venta.total,
    estado: venta.estado,
    productos: venta.productos.length,
    fecha: venta.fecha,
  })

  const productos = getProducts()
  venta.productos.forEach((item) => {
    const producto = productos.find((p) => p.id === item.producto.id)
    if (producto) {
      producto.cantidad -= item.cantidad
      saveProduct(producto)
    }
  })
}

// Usuarios
export const getUsuarios = (): Usuario[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.USUARIOS)
  if (data) return JSON.parse(data)

  // Create default admin user
  const defaultAdmin: Usuario = {
    id: "1",
    nombre: "Administrador",
    email: "admin@valva.com",
    rol: "administrador",
    permisos: {
      verCostos: true,
      editarPrecios: true,
      gestionarCreditos: true,
      verReportes: true,
      gestionarUsuarios: true,
      abrirCaja: true,
      hacerDescuentos: true,
    },
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify([defaultAdmin]))
  return [defaultAdmin]
}

export const saveUsuario = (usuario: Usuario) => {
  const usuarios = getUsuarios()
  const index = usuarios.findIndex((u) => u.id === usuario.id)
  if (index >= 0) {
    usuarios[index] = usuario
  } else {
    usuarios.push(usuario)
  }
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios))
}

export const getCurrentUser = (): Usuario | null => {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  if (data) return JSON.parse(data)

  // Set default admin as current user
  const usuarios = getUsuarios()
  if (usuarios.length > 0) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(usuarios[0]))
    return usuarios[0]
  }
  return null
}

export const setCurrentUser = (usuario: Usuario) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(usuario))
}

// Abonos
export const getAbonos = (): Abono[] => {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.ABONOS)
  return data ? JSON.parse(data) : []
}

export const saveAbono = (abono: Abono, clienteId: string) => {
  const abonos = getAbonos()
  abonos.push(abono)
  localStorage.setItem(STORAGE_KEYS.ABONOS, JSON.stringify(abonos))

  // Update client balance
  const clientes = getClientes()
  const cliente = clientes.find((c) => c.id === clienteId)
  if (cliente) {
    cliente.saldoActual = Math.max(0, cliente.saldoActual - abono.monto)
    saveCliente(cliente)
  }

  enviarWebhook("pago_recibido", {
    cliente: cliente?.nombre,
    monto: abono.monto,
    metodoPago: abono.metodoPago,
    saldoRestante: cliente?.saldoActual,
    fecha: abono.fecha,
  })
}

export const getAbonosByCliente = (clienteId: string): Abono[] => {
  return getAbonos().filter((a) => a.clienteId === clienteId)
}
