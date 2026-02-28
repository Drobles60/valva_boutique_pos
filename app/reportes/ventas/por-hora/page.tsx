import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { VentasPorHoraContent } from "@/components/reportes/ventas-por-hora-content"

export default function VentasPorHoraPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <VentasPorHoraContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
