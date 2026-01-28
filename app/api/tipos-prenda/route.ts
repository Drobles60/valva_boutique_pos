import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria_padre_id = searchParams.get('categoria_padre_id')

    let sqlQuery = "SELECT id, nombre, categoria_padre_id, descripcion FROM tipos_prenda WHERE estado = 'activo'"
    const params: any[] = []

    if (categoria_padre_id) {
      sqlQuery += ' AND categoria_padre_id = ?'
      params.push(parseInt(categoria_padre_id))
    }

    sqlQuery += ' ORDER BY nombre'

    const result: any = await query(sqlQuery, params)

    return NextResponse.json({
      success: true,
      data: Array.isArray(result) ? result : []
    })
  } catch (error) {
    console.error('Error al obtener tipos de prenda:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener tipos de prenda' },
      { status: 500 }
    )
  }
}
