import { AppSidebar } from "@/components/app-sidebar"
import { TopProductosContent } from "@/components/reportes/top-productos-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function VentasProductosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopProductosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
