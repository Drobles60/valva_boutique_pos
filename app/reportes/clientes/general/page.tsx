import { AppSidebar } from "@/components/app-sidebar"
import { ClientesFrecuentesContent } from "@/components/reportes/clientes-frecuentes-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ClientesFrecuentesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ClientesFrecuentesContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
