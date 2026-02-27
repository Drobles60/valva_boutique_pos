import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DiarioCajaContent } from "@/components/reportes/diario-caja-content"

export default function DiarioCajaPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DiarioCajaContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
