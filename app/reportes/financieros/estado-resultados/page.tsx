import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EstadoResultadosContent } from "@/components/reportes/estado-resultados-content"

export default function EstadoResultadosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <EstadoResultadosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}

