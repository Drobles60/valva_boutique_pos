// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET - Obtener todos los gastos con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    
    let sqlQuery = `
      SELECT 
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
      WHERE 1=1
    `
    
    const params: any[] = []
    
    if (fechaInicio) {
      sqlQuery += ` AND DATE(g.fecha_gasto) >= ?`
      params.push(fechaInicio)
    }
    
    if (fechaFin) {
      sqlQuery += ` AND DATE(g.fecha_gasto) <= ?`
      params.push(fechaFin)
    }
    
    sqlQuery += ` ORDER BY g.fecha_gasto DESC, g.created_at DESC`
    
    const result: any = await query(sqlQuery, params)

    return NextResponse.json({
      success: true,
      data: Array.isArray(result) ? result : []
    })
  } catch (error: any) {
    console.error('Error al obtener gastos:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Error al obtener gastos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo gasto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

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

    // Obtener el ID del usuario desde la sesión
    const usuarioResult: any = await query(
      'SELECT id FROM usuarios WHERE email = ?',
      [session.user.email]
    )

    const usuario_id = usuarioResult[0]?.id || null

    // Si el método de pago es efectivo y no hay referencia, poner "no aplica"
    let referenciaFinal = referencia
    if (metodo_pago === 'efectivo' && (!referencia || referencia.trim() === '')) {
      referenciaFinal = 'no aplica'
    }

    // Insertar el gasto
    const result = await query<any>(
      `INSERT INTO gastos (
        categoria,
        descripcion,
        monto,
        fecha_gasto,
        metodo_pago,
        referencia,
        notas,
        usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoria,
        descripcion,
        monto,
        fecha_gasto,
        metodo_pago,
        referenciaFinal || null,
        notas || null,
        usuario_id
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Gasto registrado correctamente',
      data: { id: result.insertId }
    })
  } catch (error: any) {
    console.error('Error al crear gasto:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Error al crear gasto' },
      { status: 500 }
    )
  }
}
