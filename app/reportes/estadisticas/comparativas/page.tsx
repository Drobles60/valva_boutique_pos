import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ComparativasContent } from "@/components/reportes/comparativas-content"

export default function ComparativasPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ComparativasContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
