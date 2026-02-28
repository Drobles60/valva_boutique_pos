import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TendenciasVentasContent } from "@/components/reportes/tendencias-ventas-content"

export default function TendenciasVentasPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TendenciasVentasContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
