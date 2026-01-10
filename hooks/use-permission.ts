// @ts-nocheck
import { useSession } from 'next-auth/react';
import { hasPermission, type Permission, type Role } from '@/lib/auth/permissions';

// Hook para verificar si el usuario tiene un permiso específico
export function usePermission(permission: Permission): boolean {
  const { data: session } = useSession();
  
  if (!session?.user?.rol) {
    return false;
  }
  
  return hasPermission(session.user.rol as Role, permission);
}

// Hook para obtener el rol del usuario actual
export function useRole(): Role | null {
  const { data: session } = useSession();
  return (session?.user?.rol as Role) || null;
}

// Hook para verificar si el usuario es administrador
export function useIsAdmin(): boolean {
  const role = useRole();
  return role === 'administrador';
}

// Hook para verificar si el usuario es vendedor
export function useIsVendedor(): boolean {
  const role = useRole();
  return role === 'vendedor';
}

// Hook para verificar si el usuario tiene alguno de los permisos
export function useAnyPermission(permissions: Permission[]): boolean {
  const { data: session } = useSession();
  
  if (!session?.user?.rol) {
    return false;
  }
  
  return permissions.some(permission => 
    hasPermission(session.user.rol as Role, permission)
  );
}

// Hook para verificar si el usuario tiene todos los permisos
export function useAllPermissions(permissions: Permission[]): boolean {
  const { data: session } = useSession();
  
  if (!session?.user?.rol) {
    return false;
  }
  
  return permissions.every(permission => 
    hasPermission(session.user.rol as Role, permission)
  );
}
