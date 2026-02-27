import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ProveedoresReporteContent } from "@/components/reportes/proveedores-reporte-content"

export default function ProveedoresReportePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProveedoresReporteContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
