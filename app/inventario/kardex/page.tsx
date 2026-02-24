import { AppSidebar } from "@/components/app-sidebar"
import { KardexContent } from "@/components/kardex-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function KardexPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <KardexContent />
            </SidebarInset>
        </SidebarProvider>
    )
}
