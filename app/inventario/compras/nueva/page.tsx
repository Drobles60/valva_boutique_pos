import { AppSidebar } from "@/components/app-sidebar"
import { CompraFormContent } from "@/components/compra-form-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function NuevaCompraPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <CompraFormContent />
            </SidebarInset>
        </SidebarProvider>
    )
}
