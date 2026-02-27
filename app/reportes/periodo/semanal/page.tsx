import { AppSidebar } from "@/components/app-sidebar"
import { ResumenSemanalContent } from "@/components/reportes/resumen-semanal-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ResumenSemanalPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ResumenSemanalContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
