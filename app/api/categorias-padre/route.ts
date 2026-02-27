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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, descripcion } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'El ID es obligatorio' },
        { status: 400 }
      )
    }

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      )
    }

    await query(
      'UPDATE categorias_padre SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre.trim().toUpperCase(), descripcion || null, id]
    )

    const updated: any = await query(
      'SELECT id, nombre, descripcion FROM categorias_padre WHERE id = ?',
      [id]
    )

    return NextResponse.json({ success: true, data: (updated as any[])[0] })
  } catch (error) {
    console.error('Error al actualizar categoría padre:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar categoría' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'El ID es obligatorio' }, { status: 400 })
    }

    // Verificar que no tenga tipos de prenda asociados activos
    const asociados: any = await query(
      "SELECT COUNT(*) as total FROM tipos_prenda WHERE categoria_padre_id = ? AND estado = 'activo'",
      [id]
    )
    if (asociados[0]?.total > 0) {
      return NextResponse.json(
        { success: false, error: `No se puede eliminar: tiene ${asociados[0].total} tipo(s) de prenda asociado(s)` },
        { status: 400 }
      )
    }

    await query("UPDATE categorias_padre SET estado = 'inactivo' WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar categoría padre:', error)
    return NextResponse.json({ success: false, error: 'Error al eliminar categoría' }, { status: 500 })
  }
}
