import { AppSidebar } from "@/components/app-sidebar"
import { GastosContent } from "@/components/gastos-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function GastosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <GastosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
