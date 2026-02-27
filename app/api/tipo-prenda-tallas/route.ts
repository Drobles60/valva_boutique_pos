import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: Obtener los sistemas de talla asignados a un tipo de prenda
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo_prenda_id = searchParams.get('tipo_prenda_id')

    if (!tipo_prenda_id) {
      // Devolver todas las asignaciones
      const result: any = await query(
        'SELECT tipo_prenda_id, sistema_talla_id FROM tipo_prenda_sistema_talla ORDER BY tipo_prenda_id',
        []
      )
      return NextResponse.json({ success: true, data: Array.isArray(result) ? result : [] })
    }

    const result: any = await query(
      'SELECT sistema_talla_id FROM tipo_prenda_sistema_talla WHERE tipo_prenda_id = ?',
      [parseInt(tipo_prenda_id)]
    )
    return NextResponse.json({
      success: true,
      data: Array.isArray(result) ? result.map((r: any) => r.sistema_talla_id) : []
    })
  } catch (error) {
    console.error('Error al obtener asignaciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener asignaciones de tallas' },
      { status: 500 }
    )
  }
}

// POST: Asignar sistemas de tallas a un tipo de prenda (reemplaza todos)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo_prenda_id, sistemas_talla_ids } = body

    if (!tipo_prenda_id) {
      return NextResponse.json(
        { success: false, error: 'El tipo de prenda es obligatorio' },
        { status: 400 }
      )
    }

    if (!Array.isArray(sistemas_talla_ids)) {
      return NextResponse.json(
        { success: false, error: 'Los sistemas de talla deben ser un array' },
        { status: 400 }
      )
    }

    // Eliminar asignaciones existentes
    await query('DELETE FROM tipo_prenda_sistema_talla WHERE tipo_prenda_id = ?', [tipo_prenda_id])

    // Insertar nuevas asignaciones
    for (const stId of sistemas_talla_ids) {
      await query(
        'INSERT INTO tipo_prenda_sistema_talla (tipo_prenda_id, sistema_talla_id) VALUES (?, ?)',
        [tipo_prenda_id, stId]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al asignar sistemas de tallas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al asignar sistemas de tallas' },
      { status: 500 }
    )
  }
}
