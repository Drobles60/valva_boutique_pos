import { AppSidebar } from "@/components/app-sidebar"
import { ProductosContent } from "@/components/productos-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ProductosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProductosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
