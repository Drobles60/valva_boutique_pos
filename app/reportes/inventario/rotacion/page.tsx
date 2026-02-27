import { AppSidebar } from "@/components/app-sidebar"
import { RotacionInventarioContent } from "@/components/reportes/rotacion-inventario-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function RotacionInventarioPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <RotacionInventarioContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
