import { NextResponse } from 'next/server'
import { getProductosConDescuentos } from '@/lib/descuentos'

// GET: Obtener todos los productos con sus descuentos aplicados
export async function GET() {
  try {
    const productos = await getProductosConDescuentos()
    return NextResponse.json({ success: true, data: productos })
  } catch (error) {
    console.error('Error obteniendo productos con descuentos:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener productos con descuentos' },
      { status: 500 }
    )
  }
}
