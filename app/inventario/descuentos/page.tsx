import { AppSidebar } from "@/components/app-sidebar"
import { DescuentosContent } from "@/components/descuentos-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function DescuentosPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DescuentosContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
