import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET: Verificar si un código de barras existe
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const codigo = searchParams.get('codigo')

    if (!codigo) {
      return NextResponse.json(
        { success: false, error: 'Código de barras requerido' },
        { status: 400 }
      )
    }

    const result = await query<any[]>(`
      SELECT id FROM productos WHERE codigo_barras = ?
    `, [codigo])

    return NextResponse.json({ 
      success: true, 
      existe: result.length > 0,
      id: result.length > 0 ? result[0].id : null
    })
  } catch (error: any) {
    console.error('Error verificando código:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar código' },
      { status: 500 }
    )
  }
}
