import { AppSidebar } from "@/components/app-sidebar"
import { ProveedoresContent } from "@/components/proveedores-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ProveedoresPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <ProveedoresContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
