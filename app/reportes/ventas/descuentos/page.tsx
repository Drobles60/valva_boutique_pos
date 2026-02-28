import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DescuentosAplicadosContent } from "@/components/reportes/descuentos-aplicados-content"

export default function DescuentosAplicadosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DescuentosAplicadosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
