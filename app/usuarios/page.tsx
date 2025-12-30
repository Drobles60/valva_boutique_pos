import { AppSidebar } from "@/components/app-sidebar"
import { UsuariosContent } from "@/components/usuarios-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function UsuariosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <UsuariosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
