import { AppSidebar } from "@/components/app-sidebar"
import { VentasContent } from "@/components/ventas-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function VentasPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <VentasContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
