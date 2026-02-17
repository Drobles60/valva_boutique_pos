// @ts-nocheck
"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Users,
  Package,
  FileText,
  DollarSign,
  Sparkles,
  ChevronDown,
  Tag,
  Shield,
  Settings,
  LogOut,
  User,
  Building2,
  ShoppingBag,
  Receipt,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { hasPermission, type Role, type Permission } from "@/lib/auth/permissions"

// Definir permisos requeridos para cada elemento del menú
const menuItems = [
  { 
    title: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/",
    permissions: [] as Permission[] // Dashboard visible para todos
  },
  { 
    title: "Caja", 
    icon: DollarSign, 
    href: "/caja",
    permissions: ['caja.abrir', 'caja.ver'] as Permission[] // Cualquiera de estos permisos
  },
  { 
    title: "Ventas (POS)", 
    icon: ShoppingCart, 
    href: "/ventas",
    permissions: ['ventas.crear', 'ventas.ver'] as Permission[]
  },
  { 
    title: "Clientes", 
    icon: Users, 
    href: "/clientes",
    permissions: ['clientes.ver'] as Permission[]
  },
  { 
    title: "Gastos", 
    icon: Receipt, 
    href: "/gastos",
    permissions: ['gastos.ver', 'gastos.crear'] as Permission[]
  },
  { 
    title: "Proveedores", 
    icon: Building2, 
    href: "/proveedores",
    permissions: ['proveedores.ver'] as Permission[]
  },
  { 
    title: "Pedidos", 
    icon: ShoppingBag, 
    href: "/pedidos",
    permissions: ['compras.ver'] as Permission[]
  },
  { 
    title: "Reportes", 
    icon: FileText, 
    href: "/reportes",
    permissions: ['reportes.ventas', 'reportes.inventario', 'reportes.financieros', 'reportes.clientes'] as Permission[]
  },
  { 
    title: "Usuarios y Roles", 
    icon: Shield, 
    href: "/usuarios",
    permissions: ['usuarios.ver'] as Permission[]
  },
  { 
    title: "Webhooks", 
    icon: Settings, 
    href: "/configuracion/webhooks",
    permissions: ['config.webhooks'] as Permission[]
  },
]

const inventorySubmenu = [
  { 
    title: "Productos", 
    href: "/inventario/productos",
    permissions: ['productos.ver', 'inventario.ver'] as Permission[]
  },
  { 
    title: "Descuentos", 
    href: "/inventario/descuentos",
    permissions: ['descuentos.ver'] as Permission[]
  },
]

export function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar()

  if (state !== 'collapsed') return null

  return (
    <button
      type="button"
      aria-label="Abrir menú"
      onClick={toggleSidebar}
      className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:bg-accent hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="block h-0.5 w-4 rounded-full bg-foreground transition-all" />
      <span className="block h-0.5 w-4 rounded-full bg-foreground transition-all" />
      <span className="block h-0.5 w-4 rounded-full bg-foreground transition-all" />
    </button>
  )
}

export function AppSidebar() {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // Función para verificar si el usuario tiene acceso a un item del menú
  const hasAccess = React.useCallback((permissions: Permission[]) => {
    if (!session?.user?.rol) return false
    
    // Si no se requieren permisos, está disponible para todos
    if (permissions.length === 0) return true
    
    const userRole = session.user.rol as Role
    
    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return permissions.some(permission => hasPermission(userRole, permission))
  }, [session?.user?.rol])

  // Filtrar items del menú según permisos
  const visibleMenuItems = React.useMemo(() => {
    return menuItems.filter(item => hasAccess(item.permissions))
  }, [hasAccess])

  // Filtrar submenu de inventario
  const visibleInventorySubmenu = React.useMemo(() => {
    return inventorySubmenu.filter(item => hasAccess(item.permissions))
  }, [hasAccess])

  // Determinar si mostrar la sección de inventario
  const showInventorySection = visibleInventorySubmenu.length > 0

  return (
    <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-0 px-4 py-6">
            <div className="flex h-18 w-18 items-center justify-center">
              <img src="/logo 1.jpeg" alt="Valva Logo" className="h-18 w-18 object-cover rounded-4xl shadow-md hover:shadow-lg transition-all duration-200" />
            </div>
            <div className="flex-1 ml-2">
              <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">Valva Boutique</h1>
              <p className="text-xs text-sidebar-foreground/70">Sistema POS</p>
            </div>
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={toggleSidebar}
              className="flex h-8 w-8 flex-col items-center justify-center gap-1 rounded-md border border-sidebar-border bg-transparent transition-all duration-200 hover:bg-sidebar-accent hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            >
              <span className="block h-0.5 w-4 rounded-full bg-sidebar-foreground transition-all" />
              <span className="block h-0.5 w-4 rounded-full bg-sidebar-foreground transition-all" />
              <span className="block h-0.5 w-4 rounded-full bg-sidebar-foreground transition-all" />
            </button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <a href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {showInventorySection && (
                  <Collapsible className="group/collapsible" defaultOpen={pathname.startsWith("/inventario")}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton>
                          <Tag className="h-4 w-4" />
                          <span>Inventario</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {visibleInventorySubmenu.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.href}
                              >
                                <a href={subItem.href}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="space-y-3">
            {/* Información del usuario */}
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {session?.user?.nombre || session?.user?.username || 'Usuario'}
                </p>
                <p className="text-xs text-sidebar-foreground/70 capitalize truncate">
                  {session?.user?.rol || 'Sin rol'}
                </p>
              </div>
            </div>
            
            {/* Botón de cerrar sesión */}
            <Button
              variant="ghost"
              className="w-full justify-start bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
  )
}
