import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result: any = await query(
      "SELECT id, nombre, descripcion FROM categorias_padre WHERE estado = 'activo' ORDER BY nombre",
      []
    )

    return NextResponse.json({
      success: true,
      data: Array.isArray(result) ? result : []
    })
  } catch (error) {
    console.error('Error al obtener categorías padre:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, descripcion } = body

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      )
    }

    const result: any = await query(
      "INSERT INTO categorias_padre (nombre, descripcion, estado) VALUES (?, ?, 'activo')",
      [nombre.trim().toUpperCase(), descripcion || null]
    )

    const nueva: any = await query(
      'SELECT id, nombre, descripcion FROM categorias_padre WHERE id = ?',
      [result.insertId]
    )

    return NextResponse.json({ success: true, data: (nueva as any[])[0] }, { status: 201 })
  } catch (error) {
    console.error('Error al crear categoría padre:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear categoría' },
      { status: 500 }
    )
  }
}
