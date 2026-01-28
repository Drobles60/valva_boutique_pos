import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // Probar conexión básica
    const result = await query('SELECT 1 as test')
    
    // Verificar si existe la tabla descuentos
    const tables = await query(`
      SHOW TABLES LIKE 'descuentos'
    `)
    
    return NextResponse.json({ 
      success: true, 
      connection: 'OK',
      tablesFound: tables,
      testQuery: result
    })
  } catch (error: any) {
    console.error('Error en test-db:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack,
        code: error.code
      },
      { status: 500 }
    )
  }
}
