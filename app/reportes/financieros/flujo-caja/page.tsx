import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { FlujoCajaContent } from "@/components/reportes/flujo-caja-content"

export default function FlujoCajaPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <FlujoCajaContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
