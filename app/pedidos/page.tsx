import { AppSidebar } from "@/components/app-sidebar"
import { PedidosContent } from "@/components/pedidos-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function PedidosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PedidosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
