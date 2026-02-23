export const CLIENTE_NOMBRE_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/
export const CLIENTE_TELEFONO_REGEX = /^\d+$/
export const CLIENTE_IDENTIFICACION_REGEX = /^\d+$/

export function sanitizeNombreCliente(value: string = '') {
  return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]/g, '')
}

export function sanitizeTelefonoCliente(value: string = '') {
  return value.replace(/\D/g, '')
}

export function sanitizeIdentificacionCliente(value: string = '') {
  return value.replace(/\D/g, '')
}

export function isNombreClienteValido(value: string = '') {
  const nombre = value.trim()
  return !!nombre && CLIENTE_NOMBRE_REGEX.test(nombre)
}

export function isTelefonoClienteValido(value: string = '') {
  const telefono = value.trim()
  return !!telefono && CLIENTE_TELEFONO_REGEX.test(telefono)
}

export function isIdentificacionClienteValida(value: string = '') {
  const identificacion = value.trim()
  return !!identificacion && CLIENTE_IDENTIFICACION_REGEX.test(identificacion)
}
