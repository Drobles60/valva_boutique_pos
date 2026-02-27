import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MovimientosInventarioContent } from "@/components/reportes/movimientos-inventario-content"

export default function MovimientosInventarioPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <MovimientosInventarioContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
