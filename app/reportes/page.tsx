import { AppSidebar } from "@/components/app-sidebar"
import { ReportesContent } from "@/components/reportes-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ReportesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ReportesContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
