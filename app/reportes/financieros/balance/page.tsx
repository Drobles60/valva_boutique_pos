import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { BalanceGeneralContent } from "@/components/reportes/balance-general-content"

export default function BalanceGeneralPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BalanceGeneralContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
