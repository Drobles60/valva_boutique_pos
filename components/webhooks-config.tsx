"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Webhook, Check, X, AlertCircle } from "lucide-react"
import { getWebhookConfig, saveWebhookConfig } from "@/lib/webhooks"
import { SidebarToggle } from "@/components/app-sidebar"

export function WebhooksConfig() {
  const [config, setConfig] = useState({
    url: "",
    eventos: [] as string[],
    activo: false,
  })

  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle")

  const eventosDisponibles = [
    { id: "nueva_venta", label: "Nueva Venta", description: "Se dispara al completar una venta" },
    { id: "bajo_inventario", label: "Inventario Bajo", description: "Alerta cuando un producto llega al stock mínimo" },
    { id: "nuevo_cliente", label: "Nuevo Cliente", description: "Se dispara al registrar un cliente" },
    { id: "pago_recibido", label: "Pago Recibido", description: "Se dispara al registrar un abono" },
  ]

  useEffect(() => {
    setConfig(getWebhookConfig())
  }, [])

  const handleToggleEvento = (eventoId: string) => {
    const nuevosEventos = config.eventos.includes(eventoId)
      ? config.eventos.filter((e) => e !== eventoId)
      : [...config.eventos, eventoId]

    const newConfig = { ...config, eventos: nuevosEventos }
    setConfig(newConfig)
    saveWebhookConfig(newConfig)
  }

  const handleSaveUrl = () => {
    saveWebhookConfig(config)
    alert("Configuración guardada")
  }

  const handleToggleActivo = (activo: boolean) => {
    const newConfig = { ...config, activo }
    setConfig(newConfig)
    saveWebhookConfig(newConfig)
  }

  const handleTestWebhook = async () => {
    if (!config.url) {
      alert("Por favor ingrese una URL de webhook")
      return
    }

    setTestStatus("testing")

    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "test",
          data: {
            message: "Test desde Valva POS",
            timestamp: new Date().toISOString(),
          },
        }),
      })

      if (response.ok) {
        setTestStatus("success")
        setTimeout(() => setTestStatus("idle"), 3000)
      } else {
        setTestStatus("error")
        setTimeout(() => setTestStatus("idle"), 3000)
      }
    } catch (error) {
      console.error("[v0] Test webhook error:", error)
      setTestStatus("error")
      setTimeout(() => setTestStatus("idle"), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex items-center gap-3">
        <SidebarToggle />
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Configuración de Webhooks</h1>
          <p className="text-sm text-muted-foreground md:text-base">Integración con n8n y otros servicios</p>
        </div>
      </div>

      {/* Main Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhook Principal</CardTitle>
              <CardDescription>Configure la URL de su flujo de n8n o servicio externo</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="webhook-activo">Activo</Label>
              <Switch id="webhook-activo" checked={config.activo} onCheckedChange={handleToggleActivo} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL del Webhook</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                placeholder="https://tu-dominio.app.n8n.cloud/webhook/valva-pos"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
              />
              <Button onClick={handleSaveUrl}>Guardar</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Ingrese la URL de su webhook de n8n o cualquier servicio compatible
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTestWebhook} disabled={testStatus === "testing" || !config.url}>
              <Webhook className="mr-2 h-4 w-4" />
              {testStatus === "testing" ? "Probando..." : "Probar Webhook"}
            </Button>

            {testStatus === "success" && (
              <Badge className="bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Conexión exitosa
              </Badge>
            )}

            {testStatus === "error" && (
              <Badge variant="destructive">
                <X className="h-3 w-3 mr-1" />
                Error de conexión
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Disponibles</CardTitle>
          <CardDescription>Seleccione qué eventos desea enviar al webhook</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventosDisponibles.map((evento) => (
              <div key={evento.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={config.eventos.includes(evento.id)}
                    onCheckedChange={() => handleToggleEvento(evento.id)}
                  />
                  <div>
                    <p className="font-medium">{evento.label}</p>
                    <p className="text-sm text-muted-foreground">{evento.description}</p>
                  </div>
                </div>
                {config.eventos.includes(evento.id) && <Badge variant="outline">Activo</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Información sobre Webhooks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Los webhooks permiten enviar datos automáticamente a n8n u otros servicios cuando ocurren eventos
            importantes en su sistema POS.
          </p>
          <div className="rounded-lg bg-secondary p-4 space-y-2">
            <p className="font-medium">Formato de datos enviados:</p>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(
                {
                  event: "nueva_venta",
                  data: {
                    id: "123456",
                    cliente: "Juan Pérez",
                    total: 150000,
                    estado: "completada",
                  },
                  timestamp: "2024-01-15T10:30:00Z",
                },
                null,
                2,
              )}
            </pre>
          </div>
          <p className="text-muted-foreground">
            Configure un flujo de trabajo en n8n que reciba estos datos y realice las acciones que necesite, como enviar
            notificaciones, actualizar hojas de cálculo, o sincronizar con otros sistemas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
