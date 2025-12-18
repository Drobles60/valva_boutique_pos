import { AppSidebar } from "@/components/app-sidebar"
import { ClientesContent } from "@/components/clientes-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ClientesPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ClientesContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
