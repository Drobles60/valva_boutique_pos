import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DevolucionesContent } from "@/components/reportes/devoluciones-content"

export default function DevolucionesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DevolucionesContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
