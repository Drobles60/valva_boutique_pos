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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, categoria_padre_id, descripcion, sistemas_talla_ids } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'El ID es obligatorio' },
        { status: 400 }
      )
    }

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre del tipo de prenda es obligatorio' },
        { status: 400 }
      )
    }

    await query(
      'UPDATE tipos_prenda SET nombre = ?, categoria_padre_id = ?, descripcion = ? WHERE id = ?',
      [nombre.trim().toUpperCase(), categoria_padre_id ? parseInt(categoria_padre_id) : null, descripcion || null, id]
    )

    // Actualizar sistemas de tallas asociados si se envían
    if (Array.isArray(sistemas_talla_ids)) {
      await query('DELETE FROM tipo_prenda_sistema_talla WHERE tipo_prenda_id = ?', [id])
      for (const stId of sistemas_talla_ids) {
        await query(
          'INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES (?, ?)',
          [id, stId]
        )
      }
    }

    const updated: any = await query(
      'SELECT id, nombre, categoria_padre_id, descripcion FROM tipos_prenda WHERE id = ?',
      [id]
    )

    return NextResponse.json({ success: true, data: (updated as any[])[0] })
  } catch (error) {
    console.error('Error al actualizar tipo de prenda:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar tipo de prenda' },
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

    // Verificar que no tenga productos asociados activos
    const asociados: any = await query(
      "SELECT COUNT(*) as total FROM productos WHERE tipo_prenda_id = ? AND estado = 'activo'",
      [id]
    )
    if (asociados[0]?.total > 0) {
      return NextResponse.json(
        { success: false, error: `No se puede eliminar: tiene ${asociados[0].total} producto(s) asociado(s)` },
        { status: 400 }
      )
    }

    // Eliminar asignaciones de tallas
    await query('DELETE FROM tipo_prenda_sistema_talla WHERE tipo_prenda_id = ?', [id])
    await query("UPDATE tipos_prenda SET estado = 'inactivo' WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar tipo de prenda:', error)
    return NextResponse.json({ success: false, error: 'Error al eliminar tipo de prenda' }, { status: 500 })
  }
}
