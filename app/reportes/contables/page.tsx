import { AppSidebar } from "@/components/app-sidebar"
import { ReportesContablesContent } from "@/components/reportes-contables-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ReportesContablesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ReportesContablesContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
