// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requirePermission } from '@/lib/auth/check-permission';

// GET - Obtener todos los clientes
export async function GET() {
  try {
    await requirePermission('clientes.ver');

    const clientes = await query<any[]>(
      `SELECT id, nombre, identificacion, telefono, direccion, email,
              tipo_cliente, limite_credito, saldo_actual, estado,
              created_at, updated_at
       FROM clientes 
       WHERE estado = 'activo'
       ORDER BY nombre ASC`
    );

    // Convertir tipo_cliente al formato esperado
    const clientesFormateados = clientes.map(c => ({
      ...c,
      tipoCliente: c.tipo_cliente
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

    // Validaciones
    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre del cliente es requerido' },
        { status: 400 }
      );
    }

    if (!telefono || !telefono.trim()) {
      return NextResponse.json(
        { error: 'El teléfono del cliente es requerido' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un cliente con la misma identificación
    if (identificacion && identificacion.trim()) {
      const clienteExistente = await query<any[]>(
        'SELECT id FROM clientes WHERE identificacion = ? AND estado = "activo"',
        [identificacion.trim()]
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
        nombre.trim(),
        identificacion?.trim() || null,
        telefono.trim(),
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
