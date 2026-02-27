import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AnalisisMargenesContent } from "@/components/reportes/analisis-margenes-content"

export default function AnalisisMargenesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AnalisisMargenesContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
