export const PRODUCTO_NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/
export const PRODUCTO_COLOR_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/

export function sanitizeNombreProducto(value: string = '') {
  return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '')
}

export function isNombreProductoValido(value: string = '') {
  const nombre = value.trim()
  return !!nombre && PRODUCTO_NOMBRE_REGEX.test(nombre)
}

export function sanitizeColorProducto(value: string = '') {
  return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '')
}

export function isColorProductoValido(value: string = '') {
  const color = value.trim()
  if (!color) return true
  return PRODUCTO_COLOR_REGEX.test(color)
}
