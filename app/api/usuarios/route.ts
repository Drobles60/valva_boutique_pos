import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { requirePermission } from '@/lib/auth/check-permission';

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    await requirePermission('usuarios.ver');

    const usuarios = await query<any[]>(
      `SELECT id, username, email, nombre, apellido, telefono, rol, estado, 
              ultimo_acceso, created_at, updated_at 
       FROM usuarios 
       ORDER BY created_at DESC`
    );

    return NextResponse.json(usuarios);
  } catch (error: any) {
    console.error('Error al obtener usuarios:', error);
    
    // Si es error de autenticación, devolver 401
    if (error.message?.includes('iniciar sesión')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al obtener usuarios' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    await requirePermission('usuarios.crear');

    const body = await request.json();
    let { username, email, password, nombre, apellido, telefono, rol } = body;

    // Sanitizar valores undefined a null
    telefono = telefono || null;

    // Validaciones
    if (!username || !email || !password || !nombre || !apellido || !rol) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Validar que el rol sea válido
    if (!['administrador', 'vendedor'].includes(rol)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Verificar si el username ya existe
    const existingUser = await queryOne<any>(
      'SELECT id FROM usuarios WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'El username o email ya está en uso' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const result = await query<any>(
      `INSERT INTO usuarios (username, email, password_hash, nombre, apellido, telefono, rol, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [username, email, password_hash, nombre, apellido, telefono, rol]
    );

    // Obtener el usuario creado
    const nuevoUsuario = await queryOne<any>(
      `SELECT id, username, email, nombre, apellido, telefono, rol, estado, created_at 
       FROM usuarios WHERE id = ?`,
      [(result as any).insertId]
    );

    return NextResponse.json(nuevoUsuario, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' },
      { status: error.message?.includes('permiso') ? 403 : 500 }
    );
  }
}
