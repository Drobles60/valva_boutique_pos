import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CorteMensualContent } from "@/components/reportes/corte-mensual-content"

export default function CorteMensualPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <CorteMensualContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
