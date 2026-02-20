"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Lock, Unlock, Loader2 } from "lucide-react"
import { SidebarToggle } from "./app-sidebar"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export function CajaContent() {
  const [cajaAbierta, setCajaAbierta] = useState(false)
  const [sesion, setSesion] = useState<any>(null)
  const [baseInicial, setBaseInicial] = useState("")
  const [notas, setNotas] = useState("")
  const [efectivoContado, setEfectivoContado] = useState("")
  const [notasCierre, setNotasCierre] = useState("")
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)

  // Cargar estado de caja al montar
  useEffect(() => {
    verificarEstadoCaja()
  }, [])

  const verificarEstadoCaja = async () => {
    try {
      setCargando(true)
      const response = await fetch('/api/caja/estado')
      if (response.ok) {
        const result = await response.json()
        setCajaAbierta(result.abierta)
        setSesion(result.sesion)
        if (result.sesion?.monto_base) {
          setBaseInicial(String(result.sesion.monto_base))
        }
      }
    } catch (error) {
      console.error('Error verificando caja:', error)
    } finally {
      setCargando(false)
    }
  }

  const handleAbrirCaja = async () => {
    if (!baseInicial) return
    setProcesando(true)
    try {
      const response = await fetch('/api/caja/sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monto_base: parseFloat(baseInicial),
          notas: notas || null
        })
      })
      const result = await response.json()
      if (result.success) {
        toast.success('Caja abierta correctamente')
        await verificarEstadoCaja()
        setNotas("")
      } else {
        toast.error(result.message || 'Error al abrir caja')
      }
    } catch (error) {
      toast.error('Error al abrir caja')
    } finally {
      setProcesando(false)
    }
  }

  const handleCerrarCaja = async () => {
    setProcesando(true)
    try {
      const response = await fetch('/api/caja/sesion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          efectivo_contado: efectivoContado ? parseFloat(efectivoContado) : null,
          notas: notasCierre || null
        })
      })
      const result = await response.json()
      if (result.success) {
        toast.success('Caja cerrada correctamente')
        setCajaAbierta(false)
        setSesion(null)
        setBaseInicial("")
        setNotas("")
        setEfectivoContado("")
        setNotasCierre("")
      } else {
        toast.error(result.message || 'Error al cerrar caja')
      }
    } catch (error) {
      toast.error('Error al cerrar caja')
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestión de Caja</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestión de Caja</h1>
            <p className="text-sm text-muted-foreground md:text-base">Control de apertura y cierre de caja</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 md:px-4">
          {cajaAbierta ? (
            <>
              <Unlock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="text-sm font-medium text-primary md:text-base">Caja Abierta</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground md:text-base">Caja Cerrada</span>
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
                <Input id="fecha" type="date" defaultValue={new Date().toISOString().split("T")[0]} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  defaultValue={new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="base">Base Inicial *</Label>
              <Input
                id="base"
                type="text"
                placeholder="500.000"
                value={baseInicial ? formatCurrency(baseInicial) : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                  setBaseInicial(value)
                }}
                onFocus={(e) => {
                  if (baseInicial) e.target.value = baseInicial
                }}
                onBlur={(e) => {
                  if (baseInicial) e.target.value = formatCurrency(baseInicial)
                }}
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
            <Button className="w-full" size="lg" onClick={handleAbrirCaja} disabled={!baseInicial || procesando}>
              {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
              {procesando ? 'Abriendo caja...' : 'Abrir Caja'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Turno</CardTitle>
              <CardDescription>
                Abierta desde: {sesion?.fecha_apertura
                  ? new Date(sesion.fecha_apertura).toLocaleString('es-CO')
                  : '—'}
                {sesion?.usuario_nombre && ` · Cajero: ${sesion.usuario_nombre}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">Base Inicial</p>
                  <p className="text-2xl font-bold">
                    ${formatCurrency(Number(sesion?.monto_base || baseInicial || 0))}
                  </p>
                </div>
                <div className="rounded-lg border bg-secondary p-4">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="text-2xl font-bold text-primary">Abierta</p>
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
                <div className="space-y-2">
                  <Label htmlFor="efectivo-contado">Efectivo Contado en Caja</Label>
                  <Input
                    id="efectivo-contado"
                    type="text"
                    placeholder="Ingrese el monto contado"
                    value={efectivoContado ? formatCurrency(efectivoContado) : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                      setEfectivoContado(value)
                    }}
                    onFocus={(e) => {
                      if (efectivoContado) e.target.value = efectivoContado
                    }}
                    onBlur={(e) => {
                      if (efectivoContado) e.target.value = formatCurrency(efectivoContado)
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas-cierre">Notas de Cierre (Opcional)</Label>
                  <Textarea
                    id="notas-cierre"
                    placeholder="Observaciones del cierre..."
                    value={notasCierre}
                    onChange={(e) => setNotasCierre(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="w-full" onClick={handleCerrarCaja} disabled={procesando}>
                  {procesando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  {procesando ? 'Cerrando caja...' : 'Cerrar Caja'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
