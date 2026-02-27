import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EstadoInventarioContent } from "@/components/reportes/estado-inventario-content"

export default function EstadoInventarioPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <EstadoInventarioContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
