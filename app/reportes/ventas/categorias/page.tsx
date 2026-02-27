import { AppSidebar } from "@/components/app-sidebar"
import { CategoriasProductosContent } from "@/components/reportes/categorias-productos-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function CategoriasProductosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <CategoriasProductosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
