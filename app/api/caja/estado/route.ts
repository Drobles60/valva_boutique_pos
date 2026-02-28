// @ts-nocheck
import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'

// GET - Verificar si hay una sesión de caja abierta
export async function GET() {
  try {
    // Consulta básica primero para verificar si existen las columnas nuevas
    let sesion: any = null
    try {
      sesion = await queryOne<any>(
        `SELECT sc.id, sc.caja_id, sc.usuario_id, sc.fecha_apertura, sc.monto_base,
                c.nombre as caja_nombre,
                u.nombre as usuario_nombre
         FROM sesiones_caja sc
         LEFT JOIN cajas c ON sc.caja_id = c.id
         LEFT JOIN usuarios u ON sc.usuario_id = u.id
         WHERE sc.estado = 'abierta'
         ORDER BY sc.fecha_apertura DESC
         LIMIT 1`
      )
    } catch (e: any) {
      // Si falla por columnas faltantes, usar consulta simple
      if (e.message?.includes('monto_base') || e.message?.includes('Unknown column')) {
        sesion = await queryOne<any>(
          `SELECT sc.id, sc.caja_id, sc.usuario_id, sc.fecha_apertura,
                  c.nombre as caja_nombre,
                  u.nombre as usuario_nombre
           FROM sesiones_caja sc
           LEFT JOIN cajas c ON sc.caja_id = c.id
           LEFT JOIN usuarios u ON sc.usuario_id = u.id
           WHERE sc.estado = 'abierta'
           ORDER BY sc.fecha_apertura DESC
           LIMIT 1`
        )
      } else {
        throw e
      }
    }

    return NextResponse.json({
      success: true,
      abierta: !!sesion,
      sesion: sesion || null
    })
  } catch (error: any) {
    console.error('Error al verificar estado de caja:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Error al verificar estado de caja' },
      { status: 500 }
    )
  }
}
