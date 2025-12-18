"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Lock, Unlock } from "lucide-react"

export function CajaContent() {
  const [cajaAbierta, setCajaAbierta] = React.useState(false)
  const [baseInicial, setBaseInicial] = React.useState("")
  const [notas, setNotas] = React.useState("")
  const [efectivoContado, setEfectivoContado] = React.useState("")

  const handleAbrirCaja = () => {
    if (baseInicial) {
      setCajaAbierta(true)
    }
  }

  const handleCerrarCaja = () => {
    setCajaAbierta(false)
    setBaseInicial("")
    setNotas("")
    setEfectivoContado("")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Caja</h1>
          <p className="text-muted-foreground">Control de apertura y cierre de caja</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2">
          {cajaAbierta ? (
            <>
              <Unlock className="h-5 w-5 text-primary" />
              <span className="font-medium text-primary">Caja Abierta</span>
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Caja Cerrada</span>
            </>
          )}
        </div>
      </div>

      {!cajaAbierta ? (
        <Card>
          <CardHeader>
            <CardTitle>Apertura de Caja</CardTitle>
            <CardDescription>Ingrese los datos para iniciar el turno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input id="fecha" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  defaultValue={new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cajero">Cajero</Label>
              <Input id="cajero" placeholder="Nombre del cajero" defaultValue="Usuario Actual" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="base">Base Inicial *</Label>
              <Input
                id="base"
                type="number"
                placeholder="500000"
                value={baseInicial}
                onChange={(e) => setBaseInicial(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notas">Notas Opcionales</Label>
              <Textarea
                id="notas"
                placeholder="Observaciones del turno..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
            <Button className="w-full" size="lg" onClick={handleAbrirCaja} disabled={!baseInicial}>
              <Unlock className="mr-2 h-4 w-4" />
              Abrir Caja
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Turno</CardTitle>
              <CardDescription>Estado actual de la caja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">Base Inicial</p>
                  <p className="text-2xl font-bold">${Number.parseInt(baseInicial).toLocaleString("es-CO")}</p>
                </div>
                <div className="rounded-lg border bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">Ventas del Turno</p>
                  <p className="text-2xl font-bold text-primary">$2,450,000</p>
                </div>
                <div className="rounded-lg border bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">Total en Caja</p>
                  <p className="text-2xl font-bold">
                    ${(Number.parseInt(baseInicial) + 2450000).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cierre de Caja</CardTitle>
              <CardDescription>Complete el arqueo para cerrar el turno</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border bg-secondary p-4">
                  <h3 className="mb-3 font-semibold">Desglose por Tipo de Pago</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Efectivo:</span>
                      <span className="font-medium">$1,350,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Transferencia:</span>
                      <span className="font-medium">$850,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tarjeta:</span>
                      <span className="font-medium">$250,000</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-semibold">Crédito:</span>
                      <span className="font-semibold text-primary">$450,000</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="efectivo-contado">Efectivo Contado en Caja</Label>
                  <Input
                    id="efectivo-contado"
                    type="number"
                    placeholder="Ingrese el monto contado"
                    value={efectivoContado}
                    onChange={(e) => setEfectivoContado(e.target.value)}
                  />
                </div>

                {efectivoContado && (
                  <div className="rounded-lg border bg-secondary p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Esperado:</span>
                        <span className="font-medium">
                          ${(Number.parseInt(baseInicial) + 1350000).toLocaleString("es-CO")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Real:</span>
                        <span className="font-medium">${Number.parseInt(efectivoContado).toLocaleString("es-CO")}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Diferencia:</span>
                        <span
                          className={`font-bold ${Number.parseInt(efectivoContado) - (Number.parseInt(baseInicial) + 1350000) === 0 ? "text-primary" : "text-destructive"}`}
                        >
                          $
                          {(Number.parseInt(efectivoContado) - (Number.parseInt(baseInicial) + 1350000)).toLocaleString(
                            "es-CO",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Imprimir Reporte
                </Button>
                <Button className="flex-1" onClick={handleCerrarCaja}>
                  <Lock className="mr-2 h-4 w-4" />
                  Cerrar Caja
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
