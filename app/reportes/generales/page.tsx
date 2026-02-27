import { AppSidebar } from "@/components/app-sidebar"
import { ReportesGeneralesContent } from "@/components/reportes-generales-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ReportesGeneralesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ReportesGeneralesContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
