"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, CreditCard, Repeat } from "lucide-react"
import { toast } from "sonner"

interface PagoMixto {
  efectivo: number
  transferencia: number
}

interface CambioDialogProps {
  open: boolean
  onClose: () => void
  total: number
  metodoPago: 'efectivo' | 'transferencia' | 'mixto'
  onConfirmar: (data: { 
    efectivoRecibido: number
    cambio: number
    pagoMixto?: PagoMixto
    referenciaTransferencia?: string
  }) => void
}

export function CambioDialog({ 
  open, 
  onClose, 
  total, 
  metodoPago,
  onConfirmar 
}: CambioDialogProps) {
  const [efectivoRecibido, setEfectivoRecibido] = React.useState("")
  const [montoEfectivo, setMontoEfectivo] = React.useState("")
  const [montoTransferencia, setMontoTransferencia] = React.useState("")
  const [referenciaTransferencia, setReferenciaTransferencia] = React.useState("Nequi")

  // Resetear cuando se abre el diálogo
  React.useEffect(() => {
    if (open) {
      setEfectivoRecibido("")
      setMontoEfectivo("")
      setMontoTransferencia("")
      setReferenciaTransferencia("Nequi")
    }
  }, [open])

  const cambio = React.useMemo(() => {
    if (metodoPago === 'efectivo') {
      const recibido = parseFloat(efectivoRecibido) || 0
      return recibido - total
    }
    return 0
  }, [efectivoRecibido, total, metodoPago])

  const totalMixto = React.useMemo(() => {
    const efectivo = parseFloat(montoEfectivo) || 0
    const transferencia = parseFloat(montoTransferencia) || 0
    return efectivo + transferencia
  }, [montoEfectivo, montoTransferencia])

  const cambioMixto = React.useMemo(() => {
    return totalMixto - total
  }, [totalMixto, total])

  // Función para formatear input mientras se escribe
  const formatearMontoInput = (valor: string) => {
    // Remover todo excepto números
    const numeros = valor.replace(/[^0-9]/g, '')
    if (!numeros) return ''
    // Formatear con puntos de miles
    return parseInt(numeros).toLocaleString('es-CO')
  }

  // Función para manejar cambio en input de monto
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const valor = e.target.value
    // Remover formato y guardar solo números
    const numeros = valor.replace(/[^0-9]/g, '')
    setter(numeros)
  }

  const handleConfirmar = () => {
    if (metodoPago === 'efectivo') {
      const recibido = parseFloat(efectivoRecibido) || 0
      
      if (recibido < total) {
        toast.error('El efectivo recibido es menor al total a pagar')
        return
      }

      onConfirmar({
        efectivoRecibido: recibido,
        cambio: cambio
      })
    } else if (metodoPago === 'transferencia') {
      // Para transferencia no hay cambio, solo confirmar
      if (!referenciaTransferencia) {
        toast.error('Debe seleccionar el origen de la transferencia')
        return
      }
      
      onConfirmar({
        efectivoRecibido: total,
        cambio: 0,
        referenciaTransferencia
      })
    } else if (metodoPago === 'mixto') {
      const efectivo = parseFloat(montoEfectivo) || 0
      const transferencia = parseFloat(montoTransferencia) || 0

      if (efectivo <= 0 || transferencia <= 0) {
        toast.error('Debe ingresar montos válidos para ambos métodos de pago')
        return
      }

      if (totalMixto < total) {
        toast.error('El monto total es menor al total a pagar')
        return
      }

      if (!referenciaTransferencia) {
        toast.error('Debe seleccionar el origen de la transferencia')
        return
      }

      onConfirmar({
        efectivoRecibido: efectivo,
        cambio: cambioMixto > 0 ? cambioMixto : 0,
        pagoMixto: {
          efectivo,
          transferencia
        },
        referenciaTransferencia
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Procesar Pago</DialogTitle>
          <DialogDescription>
            Complete los datos del pago para finalizar la venta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Total a pagar */}
          <div className="rounded-lg border p-4 bg-muted">
            <Label className="text-sm text-muted-foreground">Total a Pagar</Label>
            <p className="text-3xl font-bold">${formatCurrency(total)}</p>
          </div>

          {/* Efectivo */}
          {metodoPago === 'efectivo' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="efectivoRecibido">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Efectivo Recibido
                </Label>
                <Input
                  id="efectivoRecibido"
                  type="text"
                  placeholder="0"
                  value={formatearMontoInput(efectivoRecibido)}
                  onChange={(e) => handleMontoChange(e, setEfectivoRecibido)}
                  className="text-lg"
                  autoFocus
                />
              </div>

              {efectivoRecibido && (
                <div className={`rounded-lg border p-4 ${cambio >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <Label className="text-sm font-semibold">Cambio a Devolver</Label>
                  <p className={`text-2xl font-bold ${cambio >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    ${formatCurrency(Math.abs(cambio))}
                  </p>
                  {cambio < 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Falta: ${formatCurrency(Math.abs(cambio))}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Transferencia */}
          {metodoPago === 'transferencia' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="referencia">Origen de la Transferencia</Label>
                <Select value={referenciaTransferencia} onValueChange={setReferenciaTransferencia}>
                  <SelectTrigger id="referencia">
                    <SelectValue placeholder="Seleccione el origen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nequi">Nequi</SelectItem>
                    <SelectItem value="Bancolombia">Bancolombia</SelectItem>
                    <SelectItem value="Daviplata">Daviplata</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <Label className="text-sm font-semibold text-blue-900">Pago por Transferencia</Label>
                </div>
                <p className="text-sm text-blue-700">
                  Verifique que la transferencia por ${formatCurrency(total)} ha sido recibida antes de confirmar.
                </p>
              </div>
            </>
          )}

          {/* Mixto */}
          {metodoPago === 'mixto' && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  <Label className="font-semibold">Pago Mixto</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montoEfectivo">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Monto en Efectivo
                  </Label>
                  <Input
                    id="montoEfectivo"
                    type="text"
                    placeholder="0"
                    value={formatearMontoInput(montoEfectivo)}
                    onChange={(e) => handleMontoChange(e, setMontoEfectivo)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montoTransferencia">
                    <CreditCard className="inline h-4 w-4 mr-1" />
                    Monto en Transferencia
                  </Label>
                  <Input
                    id="montoTransferencia"
                    type="text"
                    placeholder="0"
                    value={formatearMontoInput(montoTransferencia)}
                    onChange={(e) => handleMontoChange(e, setMontoTransferencia)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenciaTransferenciaMixto">Origen de la Transferencia</Label>
                  <Select value={referenciaTransferencia} onValueChange={setReferenciaTransferencia}>
                    <SelectTrigger id="referenciaTransferenciaMixto">
                      <SelectValue placeholder="Seleccione el origen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Nequi">Nequi</SelectItem>
                      <SelectItem value="Bancolombia">Bancolombia</SelectItem>
                      <SelectItem value="Daviplata">Daviplata</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(montoEfectivo || montoTransferencia) && (
                <div className="space-y-2">
                  <div className="rounded-lg border p-3 bg-muted">
                    <div className="flex justify-between text-sm">
                      <span>Total Recibido:</span>
                      <span className="font-semibold">${formatCurrency(totalMixto)}</span>
                    </div>
                  </div>

                  <div className={`rounded-lg border p-3 ${cambioMixto >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between">
                      <Label className="text-sm font-semibold">Cambio:</Label>
                      <p className={`text-lg font-bold ${cambioMixto >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        ${formatCurrency(Math.abs(cambioMixto))}
                      </p>
                    </div>
                    {cambioMixto < 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        Falta: ${formatCurrency(Math.abs(cambioMixto))}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar}>
            Confirmar Venta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
