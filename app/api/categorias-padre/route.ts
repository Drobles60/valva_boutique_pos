import { NextResponse } from 'next/server'
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
