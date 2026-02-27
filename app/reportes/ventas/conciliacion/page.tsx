import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ConciliacionPagosContent } from "@/components/reportes/conciliacion-pagos-content"

export default function ConciliacionPagosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ConciliacionPagosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
