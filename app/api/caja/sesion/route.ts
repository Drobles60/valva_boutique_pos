// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Migración automática: agregar columnas si no existen
async function migrarTabla() {
  try {
    const columnas: any[] = await query(`SHOW COLUMNS FROM sesiones_caja`)
    const nombres = columnas.map((c: any) => c.Field)

    if (!nombres.includes('monto_base')) {
      await query(`ALTER TABLE sesiones_caja ADD COLUMN monto_base DECIMAL(10,2) DEFAULT 0`)
    }
    if (!nombres.includes('notas_apertura')) {
      await query(`ALTER TABLE sesiones_caja ADD COLUMN notas_apertura TEXT`)
    }
    if (!nombres.includes('efectivo_contado')) {
      await query(`ALTER TABLE sesiones_caja ADD COLUMN efectivo_contado DECIMAL(10,2) DEFAULT NULL`)
    }
    if (!nombres.includes('notas_cierre')) {
      await query(`ALTER TABLE sesiones_caja ADD COLUMN notas_cierre TEXT`)
    }
    // Asegurar que estado tenga DEFAULT
    await query(`ALTER TABLE sesiones_caja MODIFY COLUMN estado VARCHAR(30) DEFAULT 'abierta'`)
  } catch (e: any) {
    console.error('Error en migración de sesiones_caja:', e.message)
  }
}

// POST - Abrir caja (crear sesión)
export async function POST(request: NextRequest) {
  try {
    await migrarTabla()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { monto_base, notas } = body

    if (monto_base === undefined || monto_base === null || isNaN(Number(monto_base)) || Number(monto_base) < 0) {
      return NextResponse.json(
        { success: false, message: 'La base inicial es requerida y debe ser mayor o igual a 0' },
        { status: 400 }
      )
    }

    // Verificar que no haya una sesión ya abierta
    const sesionExistente = await queryOne<any>(
      `SELECT id FROM sesiones_caja WHERE estado = 'abierta' LIMIT 1`
    )

    if (sesionExistente) {
      return NextResponse.json(
        { success: false, message: 'Ya hay una sesión de caja abierta' },
        { status: 400 }
      )
    }

    // Obtener o crear la caja principal
    let caja = await queryOne<any>(`SELECT id FROM cajas WHERE estado = 'activa' LIMIT 1`)
    if (!caja) {
      const result = await query<any>(
        `INSERT INTO cajas (nombre, codigo, estado) VALUES ('Caja Principal', 'CAJA-01', 'activa')`
      )
      caja = { id: result.insertId }
    }

    // Obtener usuario_id
    const usuario = await queryOne<any>('SELECT id FROM usuarios WHERE email = ?', [session.user.email])
    const usuario_id = usuario?.id || null

    // Crear sesión de caja
    const result = await query<any>(
      `INSERT INTO sesiones_caja (caja_id, usuario_id, fecha_apertura, estado, monto_base, notas_apertura)
       VALUES (?, ?, NOW(), 'abierta', ?, ?)`,
      [caja.id, usuario_id, monto_base, notas || null]
    )

    return NextResponse.json({
      success: true,
      message: 'Caja abierta correctamente',
      data: { sesion_id: result.insertId }
    })
  } catch (error: any) {
    console.error('Error al abrir caja:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Error al abrir caja' },
      { status: 500 }
    )
  }
}

// PUT - Cerrar caja (cerrar sesión activa)
export async function PUT(request: NextRequest) {
  try {
    await migrarTabla()

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { efectivo_contado, notas } = body

    // Verificar que haya una sesión abierta
    const sesion = await queryOne<any>(
      `SELECT id FROM sesiones_caja WHERE estado = 'abierta' LIMIT 1`
    )

    if (!sesion) {
      return NextResponse.json(
        { success: false, message: 'No hay ninguna sesión de caja abierta' },
        { status: 400 }
      )
    }

    // Cerrar la sesión
    await query(
      `UPDATE sesiones_caja 
       SET estado = 'cerrada', fecha_cierre = NOW(), efectivo_contado = ?, notas_cierre = ?
       WHERE id = ?`,
      [efectivo_contado || null, notas || null, sesion.id]
    )

    return NextResponse.json({
      success: true,
      message: 'Caja cerrada correctamente'
    })
  } catch (error: any) {
    console.error('Error al cerrar caja:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Error al cerrar caja' },
      { status: 500 }
    )
  }
}
