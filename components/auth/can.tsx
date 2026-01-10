// @ts-nocheck
'use client';

import { usePermission } from '@/hooks/use-permission';
import { type Permission } from '@/lib/auth/permissions';

interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente para mostrar contenido condicionalmente basado en permisos
 * 
 * @example
 * <Can permission="productos.crear">
 *   <Button>Crear Producto</Button>
 * </Can>
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const hasPermission = usePermission(permission);
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface CanAnyProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente para mostrar contenido si el usuario tiene AL MENOS UNO de los permisos
 * 
 * @example
 * <CanAny permissions={['productos.crear', 'productos.editar']}>
 *   <Button>Gestionar Producto</Button>
 * </CanAny>
 */
export function CanAny({ permissions, children, fallback = null }: CanAnyProps) {
  const { data: session } = useSession();
  
  if (!session?.user?.rol) {
    return <>{fallback}</>;
  }
  
  const hasAnyPermission = permissions.some(permission => 
    hasPermission(session.user.rol as any, permission)
  );
  
  if (!hasAnyPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

interface CanAllProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente para mostrar contenido si el usuario tiene TODOS los permisos
 * 
 * @example
 * <CanAll permissions={['productos.ver', 'productos.editar']}>
 *   <Button>Editar Producto</Button>
 * </CanAll>
 */
export function CanAll({ permissions, children, fallback = null }: CanAllProps) {
  const { data: session } = useSession();
  
  if (!session?.user?.rol) {
    return <>{fallback}</>;
  }
  
  const hasAllPermissions = permissions.every(permission => 
    hasPermission(session.user.rol as any, permission)
  );
  
  if (!hasAllPermissions) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Import necesario
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth/permissions';
