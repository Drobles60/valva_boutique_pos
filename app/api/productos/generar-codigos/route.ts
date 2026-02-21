import { NextRequest, NextResponse } from 'next/server'
import { generateSKU, generateBarcode } from '@/lib/barcode-generator'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoria_padre_id, tipo_prenda_id, talla_id } = body

    // Obtener nombres desde la base de datos
    const categoriaResult: any = await query(
      "SELECT nombre FROM categorias_padre WHERE id = ? AND estado = 'activo'",
      [categoria_padre_id]
    )

    const tipoPrendaResult: any = await query(
      "SELECT nombre FROM tipos_prenda WHERE id = ? AND estado = 'activo'",
      [tipo_prenda_id]
    )

    const tallaResult: any = await query(
      "SELECT valor FROM tallas WHERE id = ? AND estado = 'activo'",
      [talla_id]
    )

    if (!Array.isArray(categoriaResult) || categoriaResult.length === 0 ||
        !Array.isArray(tipoPrendaResult) || tipoPrendaResult.length === 0 ||
        !Array.isArray(tallaResult) || tallaResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Datos no encontrados' },
        { status: 404 }
      )
    }

    // Obtener la secuencia para el SKU (último número + 1)
    const secuenciaResult: any = await query(
      `SELECT MAX(CAST(SUBSTRING_INDEX(sku, '-', -1) AS UNSIGNED)) as max_secuencia 
       FROM productos 
       WHERE categoria_padre_id = ? AND tipo_prenda_id = ? AND talla_id = ?`,
      [categoria_padre_id, tipo_prenda_id, talla_id]
    )

    const secuencia = (Array.isArray(secuenciaResult) && secuenciaResult[0]?.max_secuencia ? secuenciaResult[0].max_secuencia : 0) + 1

    // Obtener el último código de barras corto usado (6 dígitos máximo)
    const ultimoCodigoResult: any = await query(
      `SELECT CAST(codigo_barras AS UNSIGNED) as codigo_numero
       FROM productos 
       WHERE codigo_barras REGEXP '^[0-9]{1,6}$'
       ORDER BY CAST(codigo_barras AS UNSIGNED) DESC
       LIMIT 1`
    )

    let nuevoCodigo: number
    if (Array.isArray(ultimoCodigoResult) && ultimoCodigoResult.length > 0 && ultimoCodigoResult[0]?.codigo_numero) {
      nuevoCodigo = Number(ultimoCodigoResult[0].codigo_numero) + 1
    } else {
      // Si no hay productos con código corto, empezar desde 100001
      nuevoCodigo = 100001
    }

    // Generar códigos
    const sku = generateSKU(
      categoriaResult[0].nombre,
      tipoPrendaResult[0].nombre,
      tallaResult[0].valor,
      secuencia
    )

    const codigo_barras = nuevoCodigo.toString()

    console.log('Códigos generados:', { sku, codigo_barras, secuencia })

    return NextResponse.json({
      success: true,
      sku,
      codigo_barras,
      secuencia
    })

  } catch (error) {
    console.error('Error generando códigos:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
