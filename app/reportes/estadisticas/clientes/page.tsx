import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AnalisisClientesContent } from "@/components/reportes/analisis-clientes-content"

export default function AnalisisClientesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AnalisisClientesContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
