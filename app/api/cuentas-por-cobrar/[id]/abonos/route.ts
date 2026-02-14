// @ts-nocheck
import { NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { requirePermission } from '@/lib/auth/check-permission'

// GET - Obtener abonos de una cuenta específica
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('clientes.ver')
    
    const { id: cuentaId } = await params

    // Verificar que la cuenta existe
    const cuenta = await queryOne(
      'SELECT * FROM cuentas_por_cobrar WHERE id = ?',
      [cuentaId]
    )

    if (!cuenta) {
      return NextResponse.json(
        { success: false, error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    // Obtener abonos de esta cuenta específica
    const abonos = await query(
      `SELECT 
        a.id,
        a.monto,
        a.fecha_abono as fecha,
        a.metodo_pago,
        a.referencia_transferencia as referencia,
        a.notas,
        a.created_at,
        u.nombre as usuario_nombre,
        u.apellido as usuario_apellido,
        v.numero_venta
      FROM abonos a
      INNER JOIN cuentas_por_cobrar cpc ON a.cuenta_por_cobrar_id = cpc.id
      INNER JOIN ventas v ON cpc.venta_id = v.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.cuenta_por_cobrar_id = ?
      ORDER BY a.fecha_abono DESC`,
      [cuentaId]
    )

    // Formatear respuesta
    const abonosFormateados = abonos.map((abono: any) => ({
      ...abono,
      metodoPago: abono.metodo_pago === 'efectivo' ? 'Efectivo' : 
                  abono.metodo_pago === 'transferencia' ? 'Transferencia' : 
                  'Otro',
      usuario: `${abono.usuario_nombre || ''} ${abono.usuario_apellido || ''}`.trim() || 'Sistema'
    }))

    return NextResponse.json({
      success: true,
      data: {
        cuenta,
        abonos: abonosFormateados
      }
    })
  } catch (error: any) {
    console.error('Error al obtener abonos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al obtener abonos'
      },
      { status: error.status || 500 }
    )
  }
}

// POST - Registrar abono para una cuenta específica
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('clientes.abonar')
    
    const { id: cuentaId } = await params
    const body = await request.json()

    const { monto, metodo_pago, referencia_transferencia, notas, usuario_id } = body

    // Validaciones
    if (!monto || monto <= 0) {
      return NextResponse.json(
        { success: false, error: 'El monto debe ser mayor a 0' },
        { status: 400 }
      )
    }

    if (!metodo_pago) {
      return NextResponse.json(
        { success: false, error: 'Debe especificar el método de pago' },
        { status: 400 }
      )
    }

    // Verificar que la cuenta existe
    const cuenta = await queryOne(
      `SELECT cpc.*, c.nombre as cliente_nombre, v.numero_venta
       FROM cuentas_por_cobrar cpc
       INNER JOIN clientes c ON cpc.cliente_id = c.id
       INNER JOIN ventas v ON cpc.venta_id = v.id
       WHERE cpc.id = ?`,
      [cuentaId]
    )

    if (!cuenta) {
      return NextResponse.json(
        { success: false, error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    // Validar que el monto no exceda el saldo pendiente
    if (monto > cuenta.saldo_pendiente) {
      return NextResponse.json(
        { 
          success: false, 
          error: `El monto no puede exceder el saldo pendiente de $${cuenta.saldo_pendiente.toFixed(2)}` 
        },
        { status: 400 }
      )
    }

    // Insertar abono
    const result = await query(
      `INSERT INTO abonos (
        cuenta_por_cobrar_id,
        monto,
        metodo_pago,
        referencia_transferencia,
        notas,
        usuario_id,
        fecha_abono
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        cuentaId,
        monto,
        metodo_pago,
        referencia_transferencia || null,
        notas || null,
        usuario_id || null
      ]
    )

    // El trigger actualizar_saldo_cliente_abono se encarga de actualizar
    // cuenta.saldo_pendiente y cliente.saldo_pendiente automáticamente

    // Obtener el saldo actualizado
    const cuentaActualizada = await queryOne(
      `SELECT cpc.*, v.numero_venta, c.nombre as cliente_nombre
       FROM cuentas_por_cobrar cpc
       INNER JOIN ventas v ON cpc.venta_id = v.id
       INNER JOIN clientes c ON cpc.cliente_id = c.id
       WHERE cpc.id = ?`,
      [cuentaId]
    )

    return NextResponse.json({
      success: true,
      message: 'Abono registrado exitosamente',
      data: {
        abono_id: result.insertId,
        cuenta: cuentaActualizada,
        nuevo_saldo_pendiente: cuentaActualizada.saldo_pendiente,
        numero_venta: cuentaActualizada.numero_venta
      }
    })
  } catch (error: any) {
    console.error('Error al registrar abono:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error al registrar abono'
      },
      { status: error.status || 500 }
    )
  }
}
