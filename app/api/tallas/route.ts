import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo_prenda_id = searchParams.get('tipo_prenda_id')

    if (!tipo_prenda_id) {
      // Si no se especifica tipo de prenda, devolver todas las tallas
      const result: any = await query(
        "SELECT id, valor, sistema_talla_id FROM tallas WHERE estado = 'activo' ORDER BY sistema_talla_id, orden",
        []
      )
      return NextResponse.json({
        success: true,
        data: Array.isArray(result) ? result : []
      })
    }

    // Si se especifica tipo de prenda, filtrar por las tallas compatibles
    console.log('Buscando tallas para tipo_prenda_id:', tipo_prenda_id)
    const result: any = await query(
      `SELECT t.id, t.valor, t.sistema_talla_id 
       FROM tallas t
       INNER JOIN tipo_prenda_sistema_talla tpst ON t.sistema_talla_id = tpst.sistema_talla_id
       WHERE tpst.tipo_prenda_id = ? AND t.estado = 'activo'
       ORDER BY t.sistema_talla_id, t.orden`,
      [parseInt(tipo_prenda_id)]
    )
    console.log('Tallas encontradas:', result?.length || 0)
    console.log('Resultado:', result)

    return NextResponse.json({
      success: true,
      data: Array.isArray(result) ? result : []
    })
  } catch (error) {
    console.error('Error al obtener tallas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener tallas' },
      { status: 500 }
    )
  }
}
