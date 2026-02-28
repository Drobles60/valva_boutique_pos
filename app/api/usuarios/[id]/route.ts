import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { requirePermission } from '@/lib/auth/check-permission';

// GET - Obtener un usuario específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('usuarios.ver');
    const { id } = await context.params;

    const usuario = await queryOne<any>(
      `SELECT id, username, email, nombre, apellido, telefono, rol, estado, 
              ultimo_acceso, created_at, updated_at 
       FROM usuarios WHERE id = ?`,
      [id]
    );

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario);
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener usuario' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}

// PUT - Actualizar usuario
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('usuarios.editar');
    
    // Await params en Next.js 15
    const { id } = await context.params;
    const body = await request.json();
    
    // Extraer y sanitizar TODOS los campos
    const username = body.username?.trim() || null;
    const email = body.email?.trim() || null;
    const nombre = body.nombre?.trim() || null;
    const apellido = body.apellido?.trim() || null;
    const telefono = body.telefono?.trim() || null;
    const rol = body.rol || null;
    const estado = body.estado || 'activo';
    const password = body.password?.trim() || null;

    // Validaciones
    if (!username || !email || !nombre || !apellido || !rol) {
      return NextResponse.json(
        { error: 'Campos obligatorios faltantes' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const usuarioExistente = await queryOne<any>(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (!usuarioExistente) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el username o email ya existe en otro usuario
    const duplicado = await queryOne<any>(
      'SELECT id FROM usuarios WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, id]
    );

    if (duplicado) {
      return NextResponse.json(
        { error: 'El username o email ya está en uso por otro usuario' },
        { status: 400 }
      );
    }

    // Construir query de actualización
    let updateQuery = `
      UPDATE usuarios 
      SET username = ?, email = ?, nombre = ?, apellido = ?, 
          telefono = ?, rol = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
    `;
    
    const params_query: any[] = [
      username, 
      email, 
      nombre, 
      apellido, 
      telefono,
      rol, 
      estado
    ];

    // Si hay contraseña nueva, actualizarla
    if (password && password.length > 0) {
      const password_hash = await bcrypt.hash(password, 10);
      updateQuery += ', password_hash = ?';
      params_query.push(password_hash);
    }

    updateQuery += ' WHERE id = ?';
    params_query.push(id);

    // Ejecutar actualización
    await query(updateQuery, params_query);

    // Obtener el usuario actualizado
    const usuarioActualizado = await queryOne<any>(
      `SELECT id, username, email, nombre, apellido, telefono, rol, estado, 
              ultimo_acceso, created_at, updated_at 
       FROM usuarios WHERE id = ?`,
      [id]
    );

    return NextResponse.json(usuarioActualizado);
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar usuario' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}

// PATCH - Actualizar estado del usuario (activar/desactivar)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('usuarios.editar');
    const { id } = await context.params;
    const body = await request.json();

    const { estado } = body;

    if (!estado || !['activo', 'inactivo', 'suspendido'].includes(estado)) {
      return NextResponse.json(
        { error: 'Estado inválido. Debe ser: activo, inactivo o suspendido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const usuario = await queryOne<any>(
      'SELECT id, username FROM usuarios WHERE id = ?',
      [id]
    );

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar solo el estado
    await query(
      'UPDATE usuarios SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [estado, id]
    );

    return NextResponse.json({ 
      message: `Usuario ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
      id: id,
      estado: estado
    });
  } catch (error: any) {
    console.error('Error al actualizar estado del usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar estado del usuario' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission('usuarios.eliminar');
    const { id } = await context.params;
    
    // Verificar si se solicita eliminación permanente
    const { searchParams } = new URL(request.url);
    const permanente = searchParams.get('permanente') === 'true';

    // Verificar que el usuario existe
    const usuario = await queryOne<any>(
      'SELECT id, username FROM usuarios WHERE id = ?',
      [id]
    );

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminar el usuario admin
    if (usuario.username === 'admin') {
      return NextResponse.json(
        { error: 'No se puede eliminar el usuario administrador principal' },
        { status: 400 }
      );
    }

    if (permanente) {
      // Eliminación permanente de la base de datos
      await query(
        'DELETE FROM usuarios WHERE id = ?',
        [id]
      );

      return NextResponse.json({ 
        message: 'Usuario eliminado permanentemente',
        id: id 
      });
    } else {
      // Desactivar el usuario (mejor práctica)
      await query(
        'UPDATE usuarios SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['inactivo', id]
      );

      return NextResponse.json({ 
        message: 'Usuario desactivado exitosamente',
        id: id 
      });
    }
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar usuario' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}
