import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { GastosReporteContent } from "@/components/reportes/gastos-reporte-content"

export default function GastosReportePage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <GastosReporteContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
