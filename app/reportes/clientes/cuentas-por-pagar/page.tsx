import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CuentasPorPagarContent } from "@/components/reportes/cuentas-por-pagar-content"

export default function CuentasPorPagarPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <CuentasPorPagarContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
