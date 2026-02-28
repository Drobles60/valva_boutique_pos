import { AppSidebar } from "@/components/app-sidebar"
import { VentasPorDiaContent } from "@/components/reportes/ventas-dia-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function VentasGeneralPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <VentasPorDiaContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
