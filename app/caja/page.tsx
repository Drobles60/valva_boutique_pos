import { AppSidebar } from "@/components/app-sidebar"
import { CajaContent } from "@/components/caja-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function CajaPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <CajaContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
