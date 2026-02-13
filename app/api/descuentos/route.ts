import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerSession } from 'next-auth'

// Helper function to convert date to MySQL DATE format (YYYY-MM-DD)
function formatDateForMySQL(dateString: string | null | undefined): string | null {
  if (!dateString) return null
  try {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  } catch {
    return null
  }
}

// GET: Obtener todos los descuentos
export async function GET() {
  try {
    const descuentos = await query<any[]>(`
      SELECT * FROM descuentos 
      ORDER BY created_at DESC
    `)

    // Para cada descuento, obtener sus productos o tipos de prenda relacionados
    for (const descuento of descuentos) {
      if (descuento.aplicable_a === 'productos') {
        const productos = await query<any[]>(`
          SELECT dp.producto_id, p.nombre, p.sku, p.codigo_barras, p.precio_venta
          FROM descuento_productos dp
          JOIN productos p ON dp.producto_id = p.id
          WHERE dp.descuento_id = ?
        `, [descuento.id])
        descuento.productos = productos
      } else if (descuento.aplicable_a === 'tipos_prenda') {
        const tiposPrenda = await query<any[]>(`
          SELECT dtp.tipo_prenda_id, tp.nombre, tp.descripcion
          FROM descuento_tipos_prenda dtp
          JOIN tipos_prenda tp ON dtp.tipo_prenda_id = tp.id
          WHERE dtp.descuento_id = ?
        `, [descuento.id])
        descuento.tipos_prenda = tiposPrenda
      }
    }

    return NextResponse.json({ success: true, data: descuentos })
  } catch (error: any) {
    console.error('Error obteniendo descuentos:', error)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener descuentos',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo descuento
export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Datos recibidos:', body)
    
    const {
      nombre,
      descripcion,
      tipo,
      valor,
      fecha_inicio,
      fecha_fin,
      estado,
      aplicable_a,
      productos_seleccionados,
      tipos_prenda_seleccionados
    } = body

    // Validaciones
    if (!nombre || !tipo || !valor || !aplicable_a) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Convertir a mayúsculas
    const nombreMayusculas = nombre.toUpperCase()
    const descripcionMayusculas = descripcion ? descripcion.toUpperCase() : null

    // Validar porcentaje
    if (tipo === 'porcentaje' && (valor > 100 || valor <= 0)) {
      return NextResponse.json(
        { success: false, error: 'El porcentaje debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    console.log('Insertando descuento...')
    
    // Insertar descuento
    const result = await query<any>(`
      INSERT INTO descuentos (
        nombre, 
        descripcion, 
        tipo, 
        valor, 
        fecha_inicio, 
        fecha_fin, 
        estado, 
        aplicable_a
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombreMayusculas,
      descripcionMayusculas,
      tipo,
      valor,
      formatDateForMySQL(fecha_inicio),
      formatDateForMySQL(fecha_fin),
      estado || 'activo',
      aplicable_a
    ])

    const descuentoId = result.insertId
    console.log('Descuento creado con ID:', descuentoId)

    // Insertar relaciones según el tipo
    if (aplicable_a === 'productos' && productos_seleccionados && productos_seleccionados.length > 0) {
      console.log('Insertando productos:', productos_seleccionados)
      
      for (const prodId of productos_seleccionados) {
        await query(`
          INSERT INTO descuento_productos (descuento_id, producto_id)
          VALUES (?, ?)
        `, [descuentoId, parseInt(prodId)])
      }
    } else if (aplicable_a === 'tipos_prenda' && tipos_prenda_seleccionados && tipos_prenda_seleccionados.length > 0) {
      console.log('Insertando tipos de prenda:', tipos_prenda_seleccionados)
      
      for (const tipoId of tipos_prenda_seleccionados) {
        await query(`
          INSERT INTO descuento_tipos_prenda (descuento_id, tipo_prenda_id)
          VALUES (?, ?)
        `, [descuentoId, parseInt(tipoId)])
      }
    }

    console.log('Descuento creado exitosamente')
    
    return NextResponse.json({
      success: true,
      data: { id: descuentoId, ...body }
    })
  } catch (error: any) {
    console.error('Error creando descuento:', error)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear descuento',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}

// PUT: Actualizar descuento
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      nombre,
      descripcion,
      tipo,
      valor,
      fecha_inicio,
      fecha_fin,
      estado,
      aplicable_a,
      productos_seleccionados,
      tipos_prenda_seleccionados
    } = body

    // Validaciones
    if (!id || !nombre || !tipo || !valor || !aplicable_a) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Convertir a mayúsculas
    const nombreMayusculas = nombre.toUpperCase()
    const descripcionMayusculas = descripcion ? descripcion.toUpperCase() : null

    // Validar porcentaje
    if (tipo === 'porcentaje' && (valor > 100 || valor <= 0)) {
      return NextResponse.json(
        { success: false, error: 'El porcentaje debe estar entre 0 y 100' },
        { status: 400 }
      )
    }

    // Actualizar descuento
    await query(`
      UPDATE descuentos SET
        nombre = ?,
        descripcion = ?,
        tipo = ?,
        valor = ?,
        fecha_inicio = ?,
        fecha_fin = ?,
        estado = ?,
        aplicable_a = ?
      WHERE id = ?
    `, [
      nombreMayusculas,
      descripcionMayusculas,
      tipo,
      valor,
      formatDateForMySQL(fecha_inicio),
      formatDateForMySQL(fecha_fin),
      estado || 'activo',
      aplicable_a,
      id
    ])

    // Eliminar relaciones anteriores
    await query(`DELETE FROM descuento_productos WHERE descuento_id = ?`, [id])
    await query(`DELETE FROM descuento_tipos_prenda WHERE descuento_id = ?`, [id])

    // Insertar nuevas relaciones
    if (aplicable_a === 'productos' && productos_seleccionados && productos_seleccionados.length > 0) {
      for (const productoId of productos_seleccionados) {
        await query(`
          INSERT INTO descuento_productos (descuento_id, producto_id)
          VALUES (?, ?)
        `, [id, productoId])
      }
    } else if (aplicable_a === 'tipos_prenda' && tipos_prenda_seleccionados && tipos_prenda_seleccionados.length > 0) {
      for (const tipoPrendaId of tipos_prenda_seleccionados) {
        await query(`
          INSERT INTO descuento_tipos_prenda (descuento_id, tipo_prenda_id)
          VALUES (?, ?)
        `, [id, tipoPrendaId])
      }
    }

    return NextResponse.json({
      success: true,
      data: body
    })
  } catch (error) {
    console.error('Error actualizando descuento:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar descuento' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar descuento
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      )
    }

    console.log('Eliminando descuento con ID:', id)

    // Primero eliminar las relaciones manualmente para mayor control
    await query(`DELETE FROM descuento_productos WHERE descuento_id = ?`, [id])
    await query(`DELETE FROM descuento_tipos_prenda WHERE descuento_id = ?`, [id])
    
    // Luego eliminar el descuento
    const result = await query<any>(`DELETE FROM descuentos WHERE id = ?`, [id])

    console.log('Resultado de eliminación:', result)

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Descuento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Descuento eliminado correctamente' })
  } catch (error: any) {
    console.error('Error eliminando descuento:', error)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar descuento',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
