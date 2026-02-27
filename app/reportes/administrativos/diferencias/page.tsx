import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DiferenciasCajaContent } from "@/components/reportes/diferencias-caja-content"

export default function DiferenciasCajaPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DiferenciasCajaContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
