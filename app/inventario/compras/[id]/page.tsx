import { AppSidebar } from "@/components/app-sidebar"
import { CompraFormContent } from "@/components/compra-form-content"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

interface Props { params: Promise<{ id: string }> }

export default async function CompraDetallePage({ params }: Props) {
    const { id } = await params
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <CompraFormContent compraId={Number(id)} />
            </SidebarInset>
        </SidebarProvider>
    )
}
