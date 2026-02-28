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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import {
  isIdentificacionClienteValida,
  isNombreClienteValido,
  isTelefonoClienteValido,
  sanitizeIdentificacionCliente,
  sanitizeNombreCliente,
  sanitizeTelefonoCliente,
} from "@/lib/cliente-validations"
import { DollarSign, CreditCard, Repeat, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import type { Cliente } from "@/lib/types"

interface AbonoData {
  monto: number
  metodo: 'efectivo' | 'transferencia' | 'mixto'
  montoEfectivo?: number
  montoTransferencia?: number
  referenciaTransferencia?: string
}

interface CreditoDialogProps {
  open: boolean
  onClose: () => void
  total: number
  clientesExistentes: Cliente[]
  onConfirmar: (data: {
    cliente: Cliente | {
      nombre: string
      identificacion: string
      telefono: string
      direccion: string
      email: string
      tipo_cliente: 'publico' | 'mayorista' | 'especial'
    }
    abono?: AbonoData
    esNuevoCliente: boolean
  }) => void
}

export function CreditoDialog({
  open,
  onClose,
  total,
  clientesExistentes,
  onConfirmar
}: CreditoDialogProps) {
  const [tabActivo, setTabActivo] = React.useState<'existente' | 'nuevo'>('existente')
  const [clienteSeleccionado, setClienteSeleccionado] = React.useState<string>("")
  
  // Datos nuevo cliente
  const [nombre, setNombre] = React.useState("")
  const [identificacion, setIdentificacion] = React.useState("")
  const [telefono, setTelefono] = React.useState("")
  const [direccion, setDireccion] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [tipoCliente, setTipoCliente] = React.useState<'publico' | 'mayorista' | 'especial'>('publico')

  // Datos abono
  const [montoAbono, setMontoAbono] = React.useState("")
  const [metodoAbono, setMetodoAbono] = React.useState<'efectivo' | 'transferencia' | 'mixto'>('efectivo')
  const [montoEfectivo, setMontoEfectivo] = React.useState("")
  const [montoTransferencia, setMontoTransferencia] = React.useState("")
  const [referenciaTransferencia, setReferenciaTransferencia] = React.useState("Nequi")
  const [referenciaPago, setReferenciaPago] = React.useState("")

  // Resetear cuando se abre el diálogo
  React.useEffect(() => {
    if (open) {
      setTabActivo('existente')
      setClienteSeleccionado("")
      setNombre("")
      setIdentificacion("")
      setTelefono("")
      setDireccion("")
      setEmail("")
      setTipoCliente('publico')
      setMontoAbono("")
      setMetodoAbono('efectivo')
      setMontoEfectivo("")
      setMontoTransferencia("")
      setReferenciaTransferencia("Nequi")
      setReferenciaPago("")
    }
  }, [open])

  const abonoMonto = React.useMemo(() => {
    if (metodoAbono === 'mixto') {
      const efectivo = parseFloat(montoEfectivo) || 0
      const transferencia = parseFloat(montoTransferencia) || 0
      return efectivo + transferencia
    }
    return parseFloat(montoAbono) || 0
  }, [montoAbono, metodoAbono, montoEfectivo, montoTransferencia])

  const saldoPendiente = React.useMemo(() => {
    return total - abonoMonto
  }, [total, abonoMonto])

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
    // Validar cliente
    if (tabActivo === 'existente') {
      if (!clienteSeleccionado) {
        toast.error('Debe seleccionar un cliente')
        return
      }
    } else {
      if (!nombre.trim()) {
        toast.error('Debe ingresar el nombre del cliente')
        return
      }
      if (!isNombreClienteValido(nombre)) {
        toast.error('El nombre solo puede contener letras y espacios')
        return
      }
      if (!identificacion.trim()) {
        toast.error('Debe ingresar la cédula/RUC del cliente')
        return
      }
      if (!isIdentificacionClienteValida(identificacion)) {
        toast.error('La cédula/RUC solo puede contener números')
        return
      }
      if (!telefono.trim()) {
        toast.error('Debe ingresar el teléfono del cliente')
        return
      }
      if (!isTelefonoClienteValido(telefono)) {
        toast.error('El teléfono solo puede contener números')
        return
      }
    }

    // Validar abono si se ingresó
    if (abonoMonto > 0) {
      if (abonoMonto > total) {
        toast.error('El abono no puede ser mayor al total')
        return
      }

      if (metodoAbono === 'mixto') {
        const efectivo = parseFloat(montoEfectivo) || 0
        const transferencia = parseFloat(montoTransferencia) || 0
        
        if (efectivo <= 0 || transferencia <= 0) {
          toast.error('Debe ingresar montos válidos para ambos métodos de pago')
          return
        }

        if (!referenciaTransferencia) {
          toast.error('Debe seleccionar el origen de la transferencia')
          return
        }

        if (!referenciaPago.trim()) {
          toast.error('Debe ingresar la referencia de pago')
          return
        }
      }

      if (metodoAbono === 'transferencia' && !referenciaTransferencia) {
        toast.error('Debe seleccionar el origen de la transferencia')
        return
      }

      if (metodoAbono === 'transferencia' && !referenciaPago.trim()) {
        toast.error('Debe ingresar la referencia de pago')
        return
      }
    }

    // Preparar datos
    let abonoData: AbonoData | undefined = undefined
    if (abonoMonto > 0) {
      const referenciaFinal = referenciaPago
        ? `${referenciaTransferencia} - ${referenciaPago}`
        : referenciaTransferencia

      if (metodoAbono === 'mixto') {
        abonoData = {
          monto: abonoMonto,
          metodo: 'mixto',
          montoEfectivo: parseFloat(montoEfectivo) || 0,
          montoTransferencia: parseFloat(montoTransferencia) || 0,
          referenciaTransferencia: referenciaFinal
        }
      } else if (metodoAbono === 'transferencia') {
        abonoData = {
          monto: abonoMonto,
          metodo: metodoAbono,
          referenciaTransferencia: referenciaFinal
        }
      } else {
        abonoData = {
          monto: abonoMonto,
          metodo: metodoAbono
        }
      }
    }

    if (tabActivo === 'existente') {
      const cliente = clientesExistentes.find(c => c.id === parseInt(clienteSeleccionado))
      if (!cliente) {
        toast.error('Cliente no encontrado')
        return
      }

      onConfirmar({
        cliente,
        abono: abonoData,
        esNuevoCliente: false
      })
    } else {
      onConfirmar({
        cliente: {
          nombre: nombre.trim(),
          identificacion: identificacion.trim(),
          telefono: telefono.trim(),
          direccion: direccion.trim(),
          email: email.trim(),
          tipo_cliente: tipoCliente
        },
        abono: abonoData,
        esNuevoCliente: true
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Venta a Crédito</DialogTitle>
          <DialogDescription>
            Registre el cliente y un abono inicial (opcional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Total y saldo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-3 bg-muted">
              <Label className="text-xs text-muted-foreground">Total de la Venta</Label>
              <p className="text-2xl font-bold">${formatCurrency(total)}</p>
            </div>
            <div className={`rounded-lg border p-3 ${saldoPendiente > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
              <Label className="text-xs font-semibold">Saldo Pendiente</Label>
              <p className={`text-2xl font-bold ${saldoPendiente > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                ${formatCurrency(saldoPendiente)}
              </p>
            </div>
          </div>

          {/* Tabs cliente */}
          <Tabs value={tabActivo} onValueChange={(v) => setTabActivo(v as 'existente' | 'nuevo')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existente">
                <Users className="h-4 w-4 mr-2" />
                Cliente Existente
              </TabsTrigger>
              <TabsTrigger value="nuevo">
                <UserPlus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existente" className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="clienteSelect">Seleccione el Cliente</Label>
                <Select value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
                  <SelectTrigger id="clienteSelect">
                    <SelectValue placeholder="Seleccione un cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clientesExistentes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id?.toString() || ''}>
                        {cliente.nombre} - {cliente.identificacion || 'Sin ID'} - {cliente.telefono}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {clienteSeleccionado && (() => {
                const cliente = clientesExistentes.find(c => c.id === parseInt(clienteSeleccionado))
                return cliente ? (
                  <div className="rounded-lg border p-3 bg-muted text-sm space-y-1">
                    <p><span className="font-semibold">Nombre:</span> {cliente.nombre}</p>
                    {cliente.identificacion && <p><span className="font-semibold">ID:</span> {cliente.identificacion}</p>}
                    <p><span className="font-semibold">Teléfono:</span> {cliente.telefono}</p>
                    {cliente.email && <p><span className="font-semibold">Email:</span> {cliente.email}</p>}
                    {cliente.saldo_pendiente !== undefined && cliente.saldo_pendiente > 0 && (
                      <p className="text-orange-600">
                        <span className="font-semibold">Saldo Pendiente Actual:</span> ${formatCurrency(cliente.saldo_pendiente)}
                      </p>
                    )}
                  </div>
                ) : null
              })()}
            </TabsContent>

            <TabsContent value="nuevo" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Juan Pérez"
                    value={nombre}
                    onChange={(e) => setNombre(sanitizeNombreCliente(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identificacion">Cédula/RUC *</Label>
                  <Input
                    id="identificacion"
                    placeholder="0000000000"
                    value={identificacion}
                    inputMode="numeric"
                    onChange={(e) => setIdentificacion(sanitizeIdentificacionCliente(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input
                    id="telefono"
                    placeholder="0999999999"
                    value={telefono}
                    inputMode="numeric"
                    onChange={(e) => setTelefono(sanitizeTelefonoCliente(e.target.value))}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    placeholder="Calle principal..."
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoCliente">Tipo de Cliente</Label>
                  <Select value={tipoCliente} onValueChange={(v) => setTipoCliente(v as any)}>
                    <SelectTrigger id="tipoCliente">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publico">Público</SelectItem>
                      <SelectItem value="mayorista">Mayorista</SelectItem>
                      <SelectItem value="especial">Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Abono inicial */}
          <div className="rounded-lg border p-4 bg-blue-50 border-blue-200">
            <Label className="font-semibold text-blue-900 mb-3 block">
              Abono Inicial (Opcional)
            </Label>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="metodoAbono">Método de Pago</Label>
                <Select value={metodoAbono} onValueChange={(v) => setMetodoAbono(v as any)}>
                  <SelectTrigger id="metodoAbono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Efectivo
                    </SelectItem>
                    <SelectItem value="transferencia">
                      <CreditCard className="inline h-4 w-4 mr-1" />
                      Transferencia
                    </SelectItem>
                    <SelectItem value="mixto">
                      <Repeat className="inline h-4 w-4 mr-1" />
                      Mixto
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {metodoAbono !== 'mixto' ? (
                <>
                  {metodoAbono === 'transferencia' && (
                    <div className="space-y-2">
                      <Label htmlFor="referenciaTransferenciaAbono">Origen de la Transferencia</Label>
                      <Select value={referenciaTransferencia} onValueChange={setReferenciaTransferencia}>
                        <SelectTrigger id="referenciaTransferenciaAbono">
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
                  )}
                  {metodoAbono === 'transferencia' && (
                    <div className="space-y-2">
                      <Label htmlFor="referenciaPagoAbono">Referencia de Pago</Label>
                      <Input
                        id="referenciaPagoAbono"
                        type="text"
                        placeholder="Ingrese la referencia"
                        value={referenciaPago}
                        onChange={(e) => setReferenciaPago(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="montoAbono">Monto del Abono</Label>
                    <Input
                      id="montoAbono"
                      type="text"
                      placeholder="0"
                      value={formatearMontoInput(montoAbono)}
                      onChange={(e) => handleMontoChange(e, setMontoAbono)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Deje en 0 si no hay abono inicial
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="montoEfectivo">Monto en Efectivo</Label>
                    <Input
                      id="montoEfectivo"
                      type="text"
                      placeholder="0"
                      value={formatearMontoInput(montoEfectivo)}
                      onChange={(e) => handleMontoChange(e, setMontoEfectivo)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="montoTransferencia">Monto en Transferencia</Label>
                    <Input
                      id="montoTransferencia"
                      type="text"
                      placeholder="0"
                      value={formatearMontoInput(montoTransferencia)}
                      onChange={(e) => handleMontoChange(e, setMontoTransferencia)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referenciaTransferenciaMixtoAbono">Origen de la Transferencia</Label>
                    <Select value={referenciaTransferencia} onValueChange={setReferenciaTransferencia}>
                      <SelectTrigger id="referenciaTransferenciaMixtoAbono">
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
                  <div className="space-y-2">
                    <Label htmlFor="referenciaPagoMixtoAbono">Referencia de Pago</Label>
                    <Input
                      id="referenciaPagoMixtoAbono"
                      type="text"
                      placeholder="Ingrese la referencia"
                      value={referenciaPago}
                      onChange={(e) => setReferenciaPago(e.target.value)}
                    />
                  </div>

                  {(montoEfectivo || montoTransferencia) && (
                    <div className="rounded border p-2 bg-white">
                      <div className="flex justify-between text-sm">
                        <span>Total Abono:</span>
                        <span className="font-semibold">${formatCurrency(abonoMonto)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar}>
            Confirmar Venta a Crédito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
