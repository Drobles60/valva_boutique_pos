import { AppSidebar } from "@/components/app-sidebar"
import { ConfiguracionesContent } from "@/components/configuraciones-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ConfiguracionPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ConfiguracionesContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
