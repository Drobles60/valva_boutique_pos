import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Obtener todos los proveedores
export async function GET() {
  try {
    const proveedores = await query<any[]>(
      `SELECT id, codigo, ruc, razon_social, nombre_comercial, telefono, celular, email,
              direccion, ciudad, provincia, persona_contacto, telefono_contacto,
              estado, created_at, updated_at 
       FROM proveedores 
       ORDER BY created_at DESC`
    );

    return NextResponse.json(proveedores);
  } catch (error: any) {
    console.error('Error al obtener proveedores:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener proveedores' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo proveedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { 
      codigo,
      ruc, 
      razonSocial, 
      nombreComercial, 
      telefono, 
      celular, 
      email, 
      direccion, 
      ciudad, 
      provincia, 
      personaContacto, 
      telefonoContacto 
    } = body;

    // Sanitizar valores undefined/vacíos a null
    codigo = codigo || null;
    nombreComercial = nombreComercial || null;
    celular = celular || null;
    email = email || null;
    direccion = direccion || null;
    ciudad = ciudad || null;
    provincia = provincia || null;
    personaContacto = personaContacto || null;
    telefonoContacto = telefonoContacto || null;

    // Validaciones básicas
    if (!ruc || !razonSocial || !telefono) {
      return NextResponse.json(
        { error: 'RUC, razón social y teléfono son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el RUC ya existe
    const existente = await query<any[]>(
      'SELECT id FROM proveedores WHERE ruc = ?',
      [ruc]
    );

    if (existente.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un proveedor con este RUC' },
        { status: 400 }
      );
    }

    // Insertar el proveedor
    const result = await query<any>(
      `INSERT INTO proveedores (
        codigo, ruc, razon_social, nombre_comercial, telefono, celular, email,
        direccion, ciudad, provincia, persona_contacto, telefono_contacto, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [
        codigo,
        ruc,
        razonSocial,
        nombreComercial,
        telefono,
        celular,
        email,
        direccion,
        ciudad,
        provincia,
        personaContacto,
        telefonoContacto
      ]
    );

    // Obtener el proveedor recién creado
    const nuevoProveedor = await query<any[]>(
      `SELECT id, codigo, ruc, razon_social, nombre_comercial, telefono, celular, email,
              direccion, ciudad, provincia, persona_contacto, telefono_contacto,
              estado, created_at, updated_at 
       FROM proveedores 
       WHERE id = ?`,
      [result.insertId]
    );

    return NextResponse.json(nuevoProveedor[0], { status: 201 });
  } catch (error: any) {
    console.error('Error al crear proveedor:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear proveedor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar proveedor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    let { 
      id,
      codigo,
      ruc, 
      razonSocial, 
      nombreComercial, 
      telefono, 
      celular, 
      email, 
      direccion, 
      ciudad, 
      provincia, 
      personaContacto, 
      telefonoContacto 
    } = body;

    // Sanitizar valores undefined/vacíos a null
    codigo = codigo || null;
    nombreComercial = nombreComercial || null;
    celular = celular || null;
    email = email || null;
    direccion = direccion || null;
    ciudad = ciudad || null;
    provincia = provincia || null;
    personaContacto = personaContacto || null;
    telefonoContacto = telefonoContacto || null;

    // Validaciones básicas
    if (!id || !ruc || !razonSocial || !telefono) {
      return NextResponse.json(
        { error: 'ID, RUC, razón social y teléfono son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el RUC ya existe en otro proveedor
    const existente = await query<any[]>(
      'SELECT id FROM proveedores WHERE ruc = ? AND id != ?',
      [ruc, id]
    );

    if (existente.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe otro proveedor con este RUC' },
        { status: 400 }
      );
    }

    // Actualizar el proveedor
    await query(
      `UPDATE proveedores SET
        codigo = ?,
        ruc = ?,
        razon_social = ?,
        nombre_comercial = ?,
        telefono = ?,
        celular = ?,
        email = ?,
        direccion = ?,
        ciudad = ?,
        provincia = ?,
        persona_contacto = ?,
        telefono_contacto = ?,
        estado = ?
       WHERE id = ?`,
      [
        codigo,
        ruc,
        razonSocial,
        nombreComercial,
        telefono,
        celular,
        email,
        direccion,
        ciudad,
        provincia,
        personaContacto,
        telefonoContacto,
        body.estado || 'activo',
        id
      ]
    );

    // Obtener el proveedor actualizado
    const proveedorActualizado = await query<any[]>(
      `SELECT id, codigo, ruc, razon_social, nombre_comercial, telefono, celular, email,
              direccion, ciudad, provincia, persona_contacto, telefono_contacto,
              estado, created_at, updated_at 
       FROM proveedores 
       WHERE id = ?`,
      [id]
    );

    return NextResponse.json(proveedorActualizado[0]);
  } catch (error: any) {
    console.error('Error al actualizar proveedor:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar proveedor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar proveedor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID del proveedor es requerido' },
        { status: 400 }
      );
    }

    // Verificar si el proveedor existe
    const proveedor = await query<any[]>(
      'SELECT id FROM proveedores WHERE id = ?',
      [id]
    );

    if (proveedor.length === 0) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar el proveedor
    await query('DELETE FROM proveedores WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Proveedor eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error al eliminar proveedor:', error);
    
    // Si hay error de foreign key, significa que tiene registros asociados
    if (error.message?.includes('foreign key') || error.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json(
        { error: 'No se puede eliminar el proveedor porque tiene productos o pedidos asociados' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al eliminar proveedor' },
      { status: 500 }
    );
  }
}
