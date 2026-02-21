/**
 * Generador de SKU y Códigos de Barras para Sistema de Ropa
 * 
 * SKU Format: CAT-TIPO-TALLA-SECUENCIA
 * Ejemplo: PAN-JEA-28-0001
 * 
 * Código de Barras: EAN-13 interno (prefijo 200-299 para uso interno)
 */

/**
 * Genera un SKU basado en la información del producto
 */
export function generateSKU(
  categoriaNombre: string,
  tipoPrendaNombre: string,
  tallaNombre: string,
  secuencia: number
): string {
  // Extraer 3 primeras letras de categoría
  const catCode = categoriaNombre.substring(0, 3).toUpperCase()
  
  // Extraer código del tipo de prenda (primeras 3 letras o abreviatura inteligente)
  let tipoCode = ''
  const tipoWords = tipoPrendaNombre.split(' ')
  if (tipoWords.length > 1) {
    // Si tiene múltiples palabras, tomar primera letra de cada una
    tipoCode = tipoWords.slice(0, 3).map(w => w[0]).join('').toUpperCase()
  } else {
    tipoCode = tipoPrendaNombre.substring(0, 3).toUpperCase()
  }
  
  // Talla (ya viene limpia)
  const tallaCode = tallaNombre.toUpperCase().replace(/\s/g, '')
  
  // Secuencia con 4 dígitos
  const secCode = secuencia.toString().padStart(4, '0')
  
  return `${catCode}-${tipoCode}-${tallaCode}-${secCode}`
}

/**
 * Calcula el dígito verificador para EAN-13
 */
function calculateEAN13CheckDigit(code: string): number {
  const digits = code.split('').map(Number)
  let sum = 0
  
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3)
  }
  
  const remainder = sum % 10
  return remainder === 0 ? 0 : 10 - remainder
}

/**
 * Genera un código de barras corto interno (6 dígitos)
 * Formato: contador secuencial simple a partir de 100001
 * Compatible con CODE128 en impresión de etiquetas
 */
export function generateBarcode(
  _categoriaId: number,
  secuencia: number
): string {
  // Base de 100000 para asegurar siempre 6 dígitos
  const base = 100000
  const codigo = base + secuencia
  return codigo.toString()
}

/**
 * Obtiene la siguiente secuencia disponible para un producto
 * Esta función debe ser llamada desde el servidor con acceso a la BD
 */
export async function getNextSequence(
  categoriaId: number,
  tipoPrendaId: number,
  tallaId: number
): Promise<number> {
  // Esta función debe implementarse en el API route
  // Aquí solo definimos la estructura
  return 1
}

/**
 * Valida un código de barras EAN-13
 */
export function validateEAN13(barcode: string): boolean {
  if (barcode.length !== 13) return false
  if (!/^\d+$/.test(barcode)) return false
  
  const providedCheckDigit = Number.parseInt(barcode[12])
  const calculatedCheckDigit = calculateEAN13CheckDigit(barcode.substring(0, 12))
  
  return providedCheckDigit === calculatedCheckDigit
}

/**
 * Formatea un SKU para mostrar
 */
export function formatSKU(sku: string): string {
  return sku.toUpperCase()
}

/**
 * Genera una descripción corta para la etiqueta (máximo 30 caracteres)
 */
export function generateLabelDescription(
  nombreProducto: string,
  color: string | null,
  talla: string
): string {
  let desc = nombreProducto.substring(0, 20)
  if (color) {
    desc += ` ${color.substring(0, 5)}`
  }
  desc += ` T:${talla}`
  return desc.substring(0, 30)
}
