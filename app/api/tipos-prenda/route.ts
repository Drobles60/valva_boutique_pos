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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, categoria_padre_id, descripcion } = body

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre del tipo de prenda es obligatorio' },
        { status: 400 }
      )
    }

    if (!categoria_padre_id) {
      return NextResponse.json(
        { success: false, error: 'La categoría padre es obligatoria' },
        { status: 400 }
      )
    }

    const result: any = await query(
      "INSERT INTO tipos_prenda (nombre, categoria_padre_id, descripcion, estado) VALUES (?, ?, ?, 'activo')",
      [nombre.trim().toUpperCase(), parseInt(categoria_padre_id), descripcion || null]
    )

    const nuevo: any = await query(
      'SELECT id, nombre, categoria_padre_id, descripcion FROM tipos_prenda WHERE id = ?',
      [result.insertId]
    )

    return NextResponse.json({ success: true, data: (nuevo as any[])[0] }, { status: 201 })
  } catch (error) {
    console.error('Error al crear tipo de prenda:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear tipo de prenda' },
      { status: 500 }
    )
  }
}
