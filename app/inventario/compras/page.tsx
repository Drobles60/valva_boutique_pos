import { AppSidebar } from "@/components/app-sidebar"
import { ComprasListContent } from "@/components/compras-list-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ComprasPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <ComprasListContent />
            </SidebarInset>
        </SidebarProvider>
    )
}
