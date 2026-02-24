import { AppSidebar } from "@/components/app-sidebar"
import { CompraFormContent } from "@/components/compra-form-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface Props { params: { id: string } }

export default function CompraDetallePage({ params }: Props) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <CompraFormContent compraId={Number(params.id)} />
            </SidebarInset>
        </SidebarProvider>
    )
}
