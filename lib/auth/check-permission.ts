// @ts-nocheck
import { getServerSession } from 'next-auth/next';
import { hasPermission, type Permission, type Role } from './permissions';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Verificar si el usuario actual tiene un permiso específico
export async function checkPermission(permission: Permission): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.rol) {
      return false;
    }
    
    return hasPermission(session.user.rol as Role, permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

// Middleware para requerir un permiso (lanza error si no lo tiene)
export async function requirePermission(permission: Permission): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.rol) {
      throw new Error('Debes iniciar sesión para acceder a este recurso');
    }
    
    const allowed = hasPermission(session.user.rol as Role, permission);
    
    if (!allowed) {
      throw new Error('No tienes permiso para realizar esta acción');
    }
  } catch (error) {
    throw error;
  }
}

// Verificar si el usuario tiene alguno de los permisos especificados
export async function checkAnyPermission(permissions: Permission[]): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.rol) {
    return false;
  }
  
  return permissions.some(permission => 
    hasPermission(session.user.rol as Role, permission)
  );
}

// Verificar si el usuario tiene todos los permisos especificados
export async function checkAllPermissions(permissions: Permission[]): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.rol) {
    return false;
  }
  
  return permissions.every(permission => 
    hasPermission(session.user.rol as Role, permission)
  );
}

// Obtener el rol del usuario actual
export async function getCurrentUserRole(): Promise<Role | null> {
  const session = await getServerSession(authOptions);
  return (session?.user?.rol as Role) || null;
}

// Verificar si el usuario es administrador
export async function isAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'administrador';
}

// Verificar si el usuario es vendedor
export async function isVendedor(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'vendedor';
}
