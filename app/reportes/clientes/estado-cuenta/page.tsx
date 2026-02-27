import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { EstadoCuentaContent } from "@/components/reportes/estado-cuenta-content"

export default function EstadoCuentaPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <EstadoCuentaContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
