import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea un número con separador de miles (.) y sin decimales
 * Ejemplo: 1234567 -> "1.234.567"
 */
export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
