import { AppSidebar } from "@/components/app-sidebar"
import { BajoStockContent } from "@/components/reportes/bajo-stock-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function BajoStockPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BajoStockContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
