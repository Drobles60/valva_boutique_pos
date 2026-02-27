import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { GananciasContent } from "@/components/reportes/ganancias-content"

export default function GananciasPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <GananciasContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
