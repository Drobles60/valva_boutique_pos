import { AppSidebar } from "@/components/app-sidebar"
import { EstadisticasAvanzadasContent } from "@/components/estadisticas-avanzadas-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function EstadisticasAvanzadasPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <EstadisticasAvanzadasContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
