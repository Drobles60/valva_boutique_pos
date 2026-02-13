'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Product } from '@/lib/types'

interface CarritoItem {
  product: Product
  cantidad: number
  precioUnitario: number
  tipoCliente: string
}

interface AjustePrecio {
  productoId: string
  aplicarMinimo: boolean
}

interface ResumenPreciosDialogProps {
  open: boolean
  onClose: () => void
  carrito: CarritoItem[]
  onConfirmar: (carritoAjustado: CarritoItem[]) => void
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function ResumenPreciosDialog({
  open,
  onClose,
  carrito,
  onConfirmar,
}: ResumenPreciosDialogProps) {
  const [ajustes, setAjustes] = useState<AjustePrecio[]>([])

  // Inicializar ajustes cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      setAjustes(
        carrito.map((item) => ({
          productoId: item.product.id,
          aplicarMinimo: false,
        })),
      )
    }
  }, [open, carrito])

  const toggleAjuste = (productoId: string) => {
    setAjustes((prev) =>
      prev.map((ajuste) =>
        ajuste.productoId === productoId
          ? { ...ajuste, aplicarMinimo: !ajuste.aplicarMinimo }
          : ajuste,
      ),
    )
  }

  const calcularTotales = () => {
    let totalOriginal = 0
    let totalAjustado = 0

    carrito.forEach((item) => {
      const subtotalOriginal = item.precioUnitario * item.cantidad
      totalOriginal += subtotalOriginal

      const ajuste = ajustes.find((a) => a.productoId === item.product.id)
      if (ajuste?.aplicarMinimo) {
        totalAjustado += item.product.precioEspecial * item.cantidad
      } else {
        totalAjustado += subtotalOriginal
      }
    })

    return {
      totalOriginal,
      totalAjustado,
      descuentoTotal: totalOriginal - totalAjustado,
    }
  }

  const handleConfirmar = () => {
    // Crear carrito ajustado con los precios seleccionados
    const carritoAjustado = carrito.map((item) => {
      const ajuste = ajustes.find((a) => a.productoId === item.product.id)
      if (ajuste?.aplicarMinimo) {
        return {
          ...item,
          precioUnitario: item.product.precioEspecial,
        }
      }
      return item
    })

    onConfirmar(carritoAjustado)
  }

  const { totalOriginal, totalAjustado, descuentoTotal } = calcularTotales()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Confirmar Productos y Precios</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Selecciona los productos a los que deseas aplicar el precio mínimo de venta
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {carrito.map((item) => {
              const ajuste = ajustes.find((a) => a.productoId === item.product.id)
              const aplicarMinimo = ajuste?.aplicarMinimo || false
              const subtotalActual = aplicarMinimo
                ? item.product.precioEspecial * item.cantidad
                : item.precioUnitario * item.cantidad
              const hayDiferencia = item.precioUnitario !== item.product.precioEspecial
              const descuento = item.precioUnitario - item.product.precioEspecial

              return (
                <div
                  key={item.product.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Checkbox
                    id={`precio-${item.product.id}`}
                    checked={aplicarMinimo}
                    onCheckedChange={() => toggleAjuste(item.product.id)}
                    disabled={!hayDiferencia}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <label
                          htmlFor={`precio-${item.product.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {item.product.nombre}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Cantidad: {item.cantidad} unidad{item.cantidad > 1 ? 'es' : ''}
                        </p>
                      </div>
                      {aplicarMinimo && (
                        <Badge variant="destructive" className="ml-2">
                          Precio mínimo aplicado
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Precio actual:</span>
                        <p className={aplicarMinimo ? 'line-through text-muted-foreground' : 'font-semibold'}>
                          ${formatCurrency(item.precioUnitario)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Precio mínimo:</span>
                        <p className={aplicarMinimo ? 'font-bold text-[#D4AF37]' : 'text-muted-foreground'}>
                          ${formatCurrency(item.product.precioEspecial)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Subtotal:</span>
                        <span className="font-bold text-lg">
                          ${formatCurrency(subtotalActual)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total original:</span>
            <span className={descuentoTotal > 0 ? 'line-through text-muted-foreground' : 'font-semibold'}>
              ${formatCurrency(totalOriginal)}
            </span>
          </div>

          {descuentoTotal > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Descuento aplicado:</span>
                <span className="text-green-600 font-medium">-${formatCurrency(descuentoTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-lg pt-2 border-t">
                <span className="font-bold">Total con ajustes:</span>
                <span className="font-bold text-2xl text-primary">${formatCurrency(totalAjustado)}</span>
              </div>
            </>
          )}

          {descuentoTotal === 0 && (
            <div className="flex justify-between items-center text-lg pt-2 border-t">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-2xl text-primary">${formatCurrency(totalAjustado)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar}>
            Continuar al Cobro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
