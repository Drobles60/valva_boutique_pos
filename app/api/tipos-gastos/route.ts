import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { RowDataPacket, ResultSetHeader } from "mysql2"

// GET - Listar tipos de gastos (activos por defecto)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("all") === "true"

    const where = includeInactive ? "" : "WHERE estado = 'activo'"
    const rows = await query<RowDataPacket[]>(
      `SELECT id, nombre, label, estado FROM tipos_gastos ${where} ORDER BY label ASC`
    )

    return NextResponse.json({ success: true, data: rows })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST - Crear nuevo tipo de gasto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, label } = body

    if (!nombre || !label) {
      return NextResponse.json({ success: false, error: "Nombre y label son obligatorios" }, { status: 400 })
    }

    const slug = nombre.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")

    // Verificar duplicados
    const existing = await query<RowDataPacket[]>(
      "SELECT id FROM tipos_gastos WHERE nombre = ? AND estado = 'activo'", [slug]
    )
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: "Ya existe un tipo de gasto con ese nombre" }, { status: 400 })
    }

    const result = await query<ResultSetHeader>(
      "INSERT INTO tipos_gastos (nombre, label) VALUES (?, ?)",
      [slug, label.trim()]
    )

    return NextResponse.json({ success: true, data: { id: result.insertId, nombre: slug, label: label.trim() } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT - Actualizar tipo de gasto
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, label, estado } = body

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es obligatorio" }, { status: 400 })
    }

    const updates: string[] = []
    const params: any[] = []

    if (nombre) {
      const slug = nombre.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
      updates.push("nombre = ?")
      params.push(slug)
    }
    if (label) {
      updates.push("label = ?")
      params.push(label.trim())
    }
    if (estado) {
      updates.push("estado = ?")
      params.push(estado)
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: "No hay datos para actualizar" }, { status: 400 })
    }

    params.push(id)
    await query(
      `UPDATE tipos_gastos SET ${updates.join(", ")} WHERE id = ?`,
      params
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: "ID es obligatorio" }, { status: 400 })
    }

    // Verificar que no esté en uso en gastos
    const asociados = await query<RowDataPacket[]>(
      "SELECT COUNT(*) as total FROM gastos WHERE categoria = (SELECT nombre FROM tipos_gastos WHERE id = ?)",
      [id]
    )
    if (asociados[0]?.total > 0) {
      return NextResponse.json(
        { success: false, error: `No se puede eliminar: tiene ${asociados[0].total} gasto(s) registrado(s) con este tipo` },
        { status: 400 }
      )
    }

    await query("UPDATE tipos_gastos SET estado = 'inactivo' WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
