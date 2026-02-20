// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET - Obtener un gasto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const result: any = await query(
      `SELECT 
        g.id,
        g.categoria,
        g.descripcion,
        g.monto,
        g.fecha_gasto,
        g.metodo_pago,
        g.referencia,
        g.notas,
        g.usuario_id,
        u.nombre as usuario_nombre,
        g.created_at,
        g.updated_at
      FROM gastos g
      LEFT JOIN usuarios u ON g.usuario_id = u.id
      WHERE g.id = ?`,
      [id]
    )

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    })
  } catch (error: any) {
    console.error('Error al obtener gasto:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Error al obtener gasto' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un gasto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { 
      categoria, 
      descripcion, 
      monto, 
      fecha_gasto, 
      metodo_pago, 
      referencia, 
      notas 
    } = body

    // Validaciones
    if (!categoria || !descripcion || !monto || !fecha_gasto || !metodo_pago) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    if (isNaN(monto) || monto <= 0) {
      return NextResponse.json(
        { success: false, message: 'El monto debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar que el gasto existe
    const existente: any = await query(
      'SELECT id FROM gastos WHERE id = ?',
      [id]
    )

    if (!existente || existente.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    // Si el método de pago es efectivo y no hay referencia, poner "no aplica"
    let referenciaFinal = referencia
    if (metodo_pago === 'efectivo' && (!referencia || referencia.trim() === '')) {
      referenciaFinal = 'no aplica'
    }

    // Actualizar el gasto
    await query(
      `UPDATE gastos SET
        categoria = ?,
        descripcion = ?,
        monto = ?,
        fecha_gasto = ?,
        metodo_pago = ?,
        referencia = ?,
        notas = ?
      WHERE id = ?`,
      [
        categoria,
        descripcion,
        monto,
        fecha_gasto,
        metodo_pago,
        referenciaFinal || null,
        notas || null,
        id
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Gasto actualizado correctamente'
    })
  } catch (error: any) {
    console.error('Error al actualizar gasto:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Error al actualizar gasto' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un gasto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Verificar que el gasto existe
    const existente: any = await query(
      'SELECT id FROM gastos WHERE id = ?',
      [id]
    )

    if (!existente || existente.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Gasto no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el gasto
    await query('DELETE FROM gastos WHERE id = ?', [id])

    return NextResponse.json({
      success: true,
      message: 'Gasto eliminado correctamente'
    })
  } catch (error: any) {
    console.error('Error al eliminar gasto:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Error al eliminar gasto' },
      { status: 500 }
    )
  }
}
