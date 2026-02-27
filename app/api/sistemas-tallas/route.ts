import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result: any = await query(
      'SELECT id, nombre, descripcion, tipo FROM sistemas_tallas ORDER BY id',
      []
    )
    return NextResponse.json({ success: true, data: Array.isArray(result) ? result : [] })
  } catch (error) {
    console.error('Error al obtener sistemas de tallas:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener sistemas de tallas' },
      { status: 500 }
    )
  }
}
