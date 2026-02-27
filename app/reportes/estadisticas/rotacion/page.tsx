import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { EstadisticasRotacionContent } from "@/components/reportes/estadisticas-rotacion-content"

export default function RotacionEstadisticasPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <EstadisticasRotacionContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
