import { AppSidebar } from "@/components/app-sidebar"
import { WebhooksConfig } from "@/components/webhooks-config"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function WebhooksPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <WebhooksConfig />
      </SidebarInset>
    </SidebarProvider>
  )
}
