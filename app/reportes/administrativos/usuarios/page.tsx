import { AppSidebar } from "@/components/app-sidebar"
import { VentasVendedorContent } from "@/components/reportes/ventas-vendedor-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function VentasVendedorPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <VentasVendedorContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
