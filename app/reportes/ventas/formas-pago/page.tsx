import { AppSidebar } from "@/components/app-sidebar"
import { FormasPagoContent } from "@/components/reportes/formas-pago-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function FormasPagoPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <FormasPagoContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
