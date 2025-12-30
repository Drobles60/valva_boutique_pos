"use client"

export interface WebhookConfig {
  url: string
  eventos: string[]
  activo: boolean
}

const WEBHOOK_STORAGE_KEY = "valva_webhooks"

export const getWebhookConfig = (): WebhookConfig => {
  if (typeof window === "undefined") {
    return { url: "", eventos: [], activo: false }
  }

  const data = localStorage.getItem(WEBHOOK_STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }

  return {
    url: "",
    eventos: ["nueva_venta", "bajo_inventario", "nuevo_cliente", "pago_recibido"],
    activo: false,
  }
}

export const saveWebhookConfig = (config: WebhookConfig) => {
  if (typeof window === "undefined") return
  localStorage.setItem(WEBHOOK_STORAGE_KEY, JSON.stringify(config))
}

export const enviarWebhook = async (evento: string, data: any) => {
  const config = getWebhookConfig()

  if (!config.activo || !config.url || !config.eventos.includes(evento)) {
    console.log("[v0] Webhook not configured or event not enabled:", evento)
    return
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: evento,
        data,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      console.error("[v0] Webhook failed:", response.statusText)
    } else {
      console.log("[v0] Webhook sent successfully:", evento)
    }
  } catch (error) {
    console.error("[v0] Webhook error:", error)
  }
}
