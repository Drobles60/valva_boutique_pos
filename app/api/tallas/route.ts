import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo_prenda_id = searchParams.get('tipo_prenda_id')

    if (!tipo_prenda_id) {
      const result: any = await query(
        "SELECT id, valor, sistema_talla_id FROM tallas WHERE estado = 'activo' ORDER BY sistema_talla_id, orden",
        []
      )
      return NextResponse.json({ success: true, data: Array.isArray(result) ? result : [] })
    }

    const result: any = await query(
      `SELECT t.id, t.valor, t.sistema_talla_id 
       FROM tallas t
       INNER JOIN tipo_prenda_sistema_talla tpst ON t.sistema_talla_id = tpst.sistema_talla_id
       WHERE tpst.tipo_prenda_id = ? AND t.estado = 'activo'
       ORDER BY t.sistema_talla_id, t.orden`,
      [parseInt(tipo_prenda_id)]
    )
    // Deduplicate by valor (e.g. "U" can appear from multiple sistemas)
    const seen = new Set()
    const deduplicated = (Array.isArray(result) ? result : []).filter((t: any) => {
      if (seen.has(t.valor)) return false
      seen.add(t.valor)
      return true
    })
    return NextResponse.json({ success: true, data: deduplicated })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error al obtener tallas' }, { status: 500 })
  }
}

// POST: Crear talla rápida (inline desde modal de producto)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { valor, sistema_talla_id = 1 } = body
    if (!valor?.trim()) {
      return NextResponse.json({ success: false, error: 'El valor de la talla es obligatorio' }, { status: 400 })
    }
    const result: any = await query(
      "INSERT INTO tallas (valor, sistema_talla_id, estado, orden) VALUES (?, ?, 'activo', 99)",
      [valor.trim().toUpperCase(), sistema_talla_id]
    )
    const [nueva]: any = await query('SELECT id, valor, sistema_talla_id FROM tallas WHERE id = ?', [result.insertId])
    return NextResponse.json({ success: true, data: nueva }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, valor, sistema_talla_id } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'El ID es obligatorio' }, { status: 400 })
    }
    if (!valor?.trim()) {
      return NextResponse.json({ success: false, error: 'El valor de la talla es obligatorio' }, { status: 400 })
    }

    await query(
      'UPDATE tallas SET valor = ?, sistema_talla_id = ? WHERE id = ?',
      [valor.trim().toUpperCase(), sistema_talla_id || 1, id]
    )

    const [updated]: any = await query('SELECT id, valor, sistema_talla_id FROM tallas WHERE id = ?', [id])
    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'El ID es obligatorio' }, { status: 400 })
    }

    // Verificar que no esté en uso en productos activos
    const asociados: any = await query(
      "SELECT COUNT(*) as total FROM productos WHERE talla_id = ? AND estado = 'activo'",
      [id]
    )
    if (asociados[0]?.total > 0) {
      return NextResponse.json(
        { success: false, error: `No se puede eliminar: tiene ${asociados[0].total} producto(s) con esta talla` },
        { status: 400 }
      )
    }

    await query("UPDATE tallas SET estado = 'inactivo' WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
