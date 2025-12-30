"use client"

import * as React from "react"
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
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Caja", icon: DollarSign, href: "/caja" },
  { title: "Ventas (POS)", icon: ShoppingCart, href: "/ventas" },
  { title: "Compras", icon: Package, href: "/compras" },
  { title: "Proveedores", icon: CreditCard, href: "/proveedores" },
  { title: "Clientes", icon: Users, href: "/clientes" },
  { title: "Reportes", icon: FileText, href: "/reportes" },
  { title: "Usuarios y Roles", icon: Shield, href: "/usuarios" },
  { title: "Webhooks", icon: Settings, href: "/configuracion/webhooks" },
]

const inventorySubmenu = [
  { title: "Productos", href: "/inventario/productos" },
  { title: "Descuentos", href: "/inventario/descuentos" },
]

export function AppSidebar() {
  const [activeItem, setActiveItem] = React.useState("/")

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">Valva</h1>
            <p className="text-xs text-sidebar-foreground/70">Sistema POS</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeItem === item.href}
                    onClick={() => setActiveItem(item.href)}
                  >
                    <a href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <Collapsible className="group/collapsible">
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
                      {inventorySubmenu.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={activeItem === subItem.href}
                            onClick={() => setActiveItem(subItem.href)}
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
