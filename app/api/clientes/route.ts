// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requirePermission } from '@/lib/auth/check-permission';
import {
  CLIENTE_IDENTIFICACION_REGEX,
  isNombreClienteValido,
  isTelefonoClienteValido,
} from '@/lib/cliente-validations';

// GET - Obtener todos los clientes
export async function GET() {
  try {
    await requirePermission('clientes.ver');

    const clientes = await query<any[]>(
      `SELECT 
        c.id, c.nombre, c.identificacion, c.telefono, c.direccion, c.email,
        c.tipo_cliente, c.limite_credito, c.saldo_actual, c.saldo_pendiente, c.estado,
        c.created_at, c.updated_at,
        COALESCE(SUM(DISTINCT cpc.monto_total), 0) as total_deuda,
        COALESCE((
          SELECT SUM(a.monto) 
          FROM abonos a
          INNER JOIN cuentas_por_cobrar cpc2 ON a.cuenta_por_cobrar_id = cpc2.id
          WHERE cpc2.cliente_id = c.id
        ), 0) as total_abonado,
        COUNT(DISTINCT cpc.id) as total_cuentas
       FROM clientes c
       LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
       WHERE c.estado = 'activo'
       GROUP BY c.id
       ORDER BY c.nombre ASC`
    );

    // Convertir tipo_cliente al formato esperado
    const clientesFormateados = clientes.map(c => ({
      ...c,
      tipoCliente: c.tipo_cliente,
      total_deuda: Number(c.total_deuda) || 0,
      total_abonado: Number(c.total_abonado) || 0,
      saldo_pendiente: Number(c.saldo_pendiente) || 0,
      total_cuentas: Number(c.total_cuentas) || 0
    }))

    return NextResponse.json({ success: true, data: clientesFormateados });
  } catch (error: any) {
    console.error('Error al obtener clientes:', error);
    
    if (error.message?.includes('iniciar sesión')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al obtener clientes' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    await requirePermission('clientes.crear');

    const body = await request.json();
    const {
      nombre,
      identificacion,
      telefono,
      direccion,
      email,
      tipo_cliente,
      limite_credito
    } = body;

    const nombreLimpio = nombre?.trim() || '';
    const telefonoLimpio = telefono?.trim() || '';
    const identificacionLimpia = identificacion?.trim() || '';

    // Validaciones
    if (!nombreLimpio) {
      return NextResponse.json(
        { error: 'El nombre del cliente es requerido' },
        { status: 400 }
      );
    }

    if (!isNombreClienteValido(nombreLimpio)) {
      return NextResponse.json(
        { error: 'El nombre del cliente solo puede contener letras y espacios' },
        { status: 400 }
      );
    }

    if (!telefonoLimpio) {
      return NextResponse.json(
        { error: 'El teléfono del cliente es requerido' },
        { status: 400 }
      );
    }

    if (!isTelefonoClienteValido(telefonoLimpio)) {
      return NextResponse.json(
        { error: 'El teléfono del cliente solo puede contener números' },
        { status: 400 }
      );
    }

    if (identificacionLimpia && !CLIENTE_IDENTIFICACION_REGEX.test(identificacionLimpia)) {
      return NextResponse.json(
        { error: 'La cédula/identificación del cliente solo puede contener números' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un cliente con la misma identificación
    if (identificacionLimpia) {
      const clienteExistente = await query<any[]>(
        'SELECT id FROM clientes WHERE identificacion = ? AND estado = "activo"',
        [identificacionLimpia]
      );

      if (clienteExistente.length > 0) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con esta identificación' },
          { status: 400 }
        );
      }
    }

    // Insertar el nuevo cliente
    const result = await query<any>(
      `INSERT INTO clientes (
        nombre, identificacion, telefono, direccion, email,
        tipo_cliente, limite_credito, saldo_pendiente, saldo_actual, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 'activo')`,
      [
        nombreLimpio,
        identificacionLimpia || null,
        telefonoLimpio,
        direccion?.trim() || null,
        email?.trim() || null,
        tipo_cliente || 'publico',
        limite_credito || 0
      ]
    );

    const clienteId = (result as any).insertId;

    // Obtener el cliente recién creado
    const clienteNuevo = await query<any[]>(
      `SELECT id, nombre, identificacion, telefono, direccion, email,
              tipo_cliente, limite_credito, saldo_actual, estado,
              created_at, updated_at
       FROM clientes 
       WHERE id = ?`,
      [clienteId]
    );

    return NextResponse.json({
      success: true,
      data: clienteNuevo[0],
      message: 'Cliente registrado exitosamente'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error al crear cliente:', error);
    
    if (error.message?.includes('iniciar sesión')) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al crear cliente' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}
