import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CreditosContent } from "@/components/reportes/creditos-content"

export default function CreditosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <CreditosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
