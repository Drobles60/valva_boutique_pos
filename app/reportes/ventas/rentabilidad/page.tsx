import { AppSidebar } from "@/components/app-sidebar"
import { TopProductosContent } from "@/components/reportes/top-productos-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function RentabilidadPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopProductosContent vistaInicial="rentables" />
      </SidebarInset>
    </SidebarProvider>
  )
}
