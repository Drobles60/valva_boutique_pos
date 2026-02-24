import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número con separador de miles (.) y sin decimales
 * Ejemplo: 1234567 -> "1.234.567"
 */
/**
 * Formatea un número con separador de miles (.) y sin decimales (COP)
 * Ejemplo: 1234567 -> "1.234.567"
 */
export function formatCurrency(value: number | string): string {
  if (value === undefined || value === null || value === '') return '0'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  return Math.round(num).toLocaleString('es-CO').replace(/,/g, '.')
}

/**
 * Normaliza un texto eliminando tildes y acentos para búsquedas
 * Ejemplo: "Pantalón" -> "pantalon", "Cámara" -> "camara"
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
