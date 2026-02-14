"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Printer, Download, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import jsPDF from "jspdf"
import { toast } from "sonner"

interface DetalleVenta {
  id: number
  producto_nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface VentaFactura {
  id: number
  numero_venta: string
  fecha_venta: string
  cliente_nombre?: string
  cliente_identificacion?: string
  cliente_telefono?: string
  cliente_direccion?: string
  vendedor_nombre?: string
  vendedor_apellido?: string
  subtotal: number
  iva: number
  descuento: number
  total: number
  tipo_venta: string
  metodo_pago: string
  efectivo_recibido?: number
  cambio?: number
  credito_abono_total?: number
  credito_saldo_pendiente?: number
  detalles: DetalleVenta[]
}

interface FacturaDialogProps {
  open: boolean
  onClose: () => void
  venta: VentaFactura | null
}

export function FacturaDialog({ open, onClose, venta }: FacturaDialogProps) {
  const facturaRef = React.useRef<HTMLDivElement>(null)

  if (!venta) return null

  const crearPDF = async () => {
    try {
      // Formato de ticket estrecho (80mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 297], // Ancho de ticket térmico de 80mm
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const centerX = pageWidth / 2
      const margin = 5
      let yPos = 5

      // Línea de separación
      const lineaGuiones = '-'.repeat(50)

      // Cargar logo centrado
      try {
        const img = new Image()
        img.src = '/logo 1.jpeg'
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          setTimeout(reject, 2000)
        })
        
        const logoWidth = 40
        const logoHeight = 20
        pdf.addImage(img, 'JPEG', centerX - (logoWidth / 2), yPos, logoWidth, logoHeight)
        yPos += logoHeight + 4
      } catch (error) {
        console.log('Continuando sin logo')
      }

      // Nombre empresa (centrado)
      pdf.setFontSize(12)
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('Valva Boutique', centerX, yPos, { align: 'center' })
      yPos += 5

      pdf.setFontSize(10)
      pdf.setFont('Lucida Console', 'normal')
      pdf.text('Descubre tu estilo y llévalo al siguiente nivel', centerX, yPos, { align: 'center' })
      yPos += 6

      // NIT o identificación (centrado)
      pdf.text('Telefono: 3224081839', centerX, yPos, { align: 'center' })
      yPos += 5

      // Teléfono (centrado)
      pdf.text('@valva_.boutique', centerX, yPos, { align: 'center' })
      yPos += 4

      // Línea separadora
      pdf.setFontSize(12)
      pdf.text(lineaGuiones, centerX, yPos, { align: 'center' })
      yPos += 4

      // FACTURA DE VENTA POS (centrado)
      pdf.setFontSize(12)
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('FACTURA DE VENTA POS', centerX, yPos, { align: 'center' })
      yPos += 4

      // Línea separadora
      pdf.setFontSize(12)
      pdf.setFont('Lucida Console', 'normal')
      pdf.text(lineaGuiones, centerX, yPos, { align: 'center' })
      yPos += 5

      // Información de la factura (alineado a la izquierda)
      pdf.setFontSize(11)
      const fechaFormateada = new Date(venta.fecha_venta).toLocaleString('es-EC', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ' -')
      
      // Fecha
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('Fecha:', margin, yPos)
      const anchoFecha = pdf.getTextWidth('Fecha: ')
      pdf.setFont('Lucida Console', 'normal')
      pdf.text(fechaFormateada, margin + anchoFecha, yPos)
      yPos += 4
      
      // Factura #
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('Factura #:', margin, yPos)
      const anchoFactura = pdf.getTextWidth('Factura #: ')
      pdf.setFont('Lucida Console', 'normal')
      pdf.text(venta.numero_venta, margin + anchoFactura, yPos)
      yPos += 4
      
      // Cajero
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('Cajero:', margin, yPos)
      const anchoCajero = pdf.getTextWidth('Cajero: ')
      pdf.setFont('Lucida Console', 'normal')
      pdf.text(`${venta.vendedor_nombre || 'admin'} ${venta.vendedor_apellido || ''}`, margin + anchoCajero, yPos)
      yPos += 4
      
      // Caja
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('Caja:', margin, yPos)
      const anchoCaja = pdf.getTextWidth('Caja: ')
      pdf.setFont('Lucida Console', 'normal')
      pdf.text('Principal', margin + anchoCaja, yPos)
      yPos += 4
      
      // Máquina
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('Máquina:', margin, yPos)
      const anchoMaquina = pdf.getTextWidth('Máquina: ')
      pdf.setFont('Lucida Console', 'normal')
      pdf.text('POS001', margin + anchoMaquina, yPos)
      yPos += 5

      // Línea separadora
      pdf.setFontSize(12)
      pdf.text(lineaGuiones, centerX, yPos, { align: 'center' })
      yPos += 4

      // Encabezado de tabla
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('Nombre', margin + 10, yPos)
      pdf.text('Total', pageWidth - margin - 10, yPos, { align: 'right' })
      yPos += 3

      // Línea separadora
      pdf.setFontSize(12)
      pdf.setFont('Lucida Console', 'normal')
      pdf.text(lineaGuiones, centerX, yPos, { align: 'center' })
      yPos += 4

      // Productos
      venta.detalles.forEach((detalle) => {
        // Nombre del producto (izquierda) y Total (derecha) en la misma línea
        pdf.setFontSize(11) // Tamaño más grande para el nombre
        pdf.setFont('Lucida Console', 'normal')
        const nombreMaxWidth = pageWidth - margin * 2 - 20 // Espacio para el precio
        const lineasNombre = pdf.splitTextToSize(detalle.producto_nombre, nombreMaxWidth)
        
        // Primera línea: nombre a la izquierda, total a la derecha
        pdf.text(lineasNombre[0], margin, yPos)
        pdf.text(formatCurrency(detalle.subtotal), pageWidth - margin, yPos, { align: 'right' })
        yPos += 4
        
        // Si el nombre tiene más de una línea, imprimir el resto
        if (lineasNombre.length > 1) {
          for (let i = 1; i < lineasNombre.length; i++) {
            pdf.text(lineasNombre[i], margin, yPos)
            yPos += 4
          }
        }
        
        // Unidades en la siguiente línea (en negrilla)
        pdf.setFontSize(9)
        pdf.setFont('Lucida Console', 'bold')
        pdf.text(`> UNIDADES: -> Cantidad:${detalle.cantidad.toFixed(2)} x ${formatCurrency(detalle.precio_unitario)}`, margin, yPos)
        yPos += 5
      })

      // Línea separadora
      pdf.setFontSize(12)
      pdf.text(lineaGuiones, centerX, yPos, { align: 'center' })
      yPos += 4

      // TOTAL A PAGAR
      pdf.setFontSize(11)
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('TOTAL A PAGAR:', margin, yPos)
      pdf.text(`$ ${formatCurrency(venta.total)}`, pageWidth - margin, yPos, { align: 'right' })
      yPos += 5

      // Si es venta a crédito, mostrar abono y saldo pendiente
      if (venta.tipo_venta === 'credito') {
        pdf.setFontSize(10)
        pdf.setFont('Lucida Console', 'normal')
        
        // Abono inicial
        const abonoInicial = venta.credito_abono_total || 0
        pdf.text('Abono Inicial:', margin, yPos)
        pdf.text(`$ ${formatCurrency(abonoInicial)}`, pageWidth - margin, yPos, { align: 'right' })
        yPos += 4

        // Saldo pendiente
        const saldoPendiente = venta.credito_saldo_pendiente || venta.total
        pdf.setFont('Lucida Console', 'bold')
        pdf.text('Saldo Pendiente:', margin, yPos)
        pdf.text(`$ ${formatCurrency(saldoPendiente)}`, pageWidth - margin, yPos, { align: 'right' })
        yPos += 5
      }

      // Línea separadora
      pdf.setFontSize(12)
      pdf.setFont('Lucida Console', 'normal')
      pdf.text(lineaGuiones, centerX, yPos, { align: 'center' })
      yPos += 4

      // FORMA DE PAGO
      pdf.setFontSize(10)
      pdf.setFont('Lucida Console', 'bold')
      pdf.text('**FORMA DE PAGO**', centerX, yPos, { align: 'center' })
      yPos += 4

      pdf.setFont('Lucida Console', 'normal')
      const metodoPago = venta.metodo_pago === 'efectivo' ? 'Efectivo' :
                         venta.metodo_pago === 'transferencia' ? 'Transferencia' :
                         venta.metodo_pago === 'tarjeta' ? 'Tarjeta' : 'Mixto'
      const tipoPago = venta.tipo_venta === 'contado' ? 'Contado' : 'Crédito'
      
      pdf.text(tipoPago, margin + 10, yPos)
      pdf.text(formatCurrency(venta.total), pageWidth - margin - 10, yPos, { align: 'right' })
      yPos += 5

      // Línea separadora
      pdf.setFontSize(12)
      pdf.text(lineaGuiones, centerX, yPos, { align: 'center' })
      yPos += 4

      // Mensaje de agradecimiento
      pdf.setFont('Lucida Console', 'bold')
      pdf.setFontSize(13)
      pdf.text('Gracias Por Su Compra', centerX, yPos, { align: 'center' })
      yPos += 5

      // Línea separadora
      pdf.setFontSize(12)
      pdf.setFont('Lucida Console', 'normal')
      pdf.text(lineaGuiones, centerX, yPos, { align: 'center' })
      yPos += 4

      // Información de recibido y cambio
      pdf.setFontSize(9)
      if (venta.tipo_venta === 'contado' && venta.metodo_pago !== 'transferencia') {
        const efectivoRecibido = venta.efectivo_recibido || venta.total
        const cambio = venta.cambio || 0
        pdf.text(`RECIBIDO: $${formatCurrency(efectivoRecibido)}`, margin, yPos)
        yPos += 3.5
        pdf.text(`CAMBIO: $${formatCurrency(cambio)}`, margin, yPos)
        yPos += 8
      }

      // Info del software (centrado, muy pequeño)
      pdf.setFontSize(7.5)
      pdf.text('Software: Valva Boutique POS', centerX, yPos, { align: 'center' })

      return pdf
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert(`Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
      return null
    }
  }

  const descargarPDF = async () => {
    const pdf = await crearPDF()
    if (!pdf) return
    pdf.save(`Factura-${venta.numero_venta}.pdf`)
    toast.success('¡Factura descargada exitosamente!', {
      description: `Archivo: Factura-${venta.numero_venta}.pdf`,
      duration: 4000,
    })
  }

  const imprimirFactura = async () => {
    const pdf = await crearPDF()
    if (!pdf) return
    const blob = pdf.output('blob')
    const blobUrl = URL.createObjectURL(blob)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.src = blobUrl

    iframe.onload = () => {
      const cleanup = () => {
        URL.revokeObjectURL(blobUrl)
        iframe.remove()
      }

      if (iframe.contentWindow) {
        iframe.contentWindow.onafterprint = cleanup
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      } else {
        cleanup()
      }
    }

    document.body.appendChild(iframe)
  }

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha)
    return date.toLocaleString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Factura de Venta</DialogTitle>
              <DialogDescription>
                Número: {venta.numero_venta}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={imprimirFactura}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" size="sm" onClick={descargarPDF}>
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div ref={facturaRef} className="bg-white p-6 mx-auto">
          {/* Encabezado con logo */}
          <div className="flex flex-col items-center text-center mb-6 pb-4 border-b-2 border-gray-300">
            <img
              src="/logo 1.jpeg"
              alt="Logo"
              className="h-20 w-20 object-cover rounded-lg mb-3"
            />
            <h1 className="text-2xl font-bold text-gray-900">Valva Boutique</h1>
            <p className="text-sm text-gray-600 mt-1">Moda y Estilo</p>
            <p className="text-sm text-gray-600">Tel: (Por definir)</p>
            <div className="bg-gray-100 px-4 py-2 rounded-lg mt-4 w-full">
              <p className="text-xs text-gray-600">FACTURA</p>
              <p className="text-lg font-bold text-gray-900">{venta.numero_venta}</p>
              <p className="text-xs text-gray-600 mt-1">{formatearFecha(venta.fecha_venta)}</p>
            </div>
          </div>

          {/* Información del cliente y vendedor */}
          <div className="mb-6 space-y-4">
            <div className="border rounded-lg p-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">CLIENTE</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {venta.cliente_nombre || 'Cliente General'}
                </p>
                {venta.cliente_identificacion && (
                  <p>ID: {venta.cliente_identificacion}</p>
                )}
                {venta.cliente_telefono && (
                  <p>Tel: {venta.cliente_telefono}</p>
                )}
                {venta.cliente_direccion && (
                  <p>Dir: {venta.cliente_direccion}</p>
                )}
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <h3 className="text-xs font-semibold text-gray-700 mb-2">VENDEDOR</h3>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">
                  {venta.vendedor_nombre} {venta.vendedor_apellido}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Tipo:</span> {venta.tipo_venta === 'contado' ? 'Contado' : 'Crédito'}
                </p>
                <p>
                  <span className="font-semibold">Pago:</span> {
                    venta.metodo_pago === 'efectivo' ? 'Efectivo' :
                    venta.metodo_pago === 'transferencia' ? 'Transferencia' :
                    venta.metodo_pago === 'tarjeta' ? 'Tarjeta' : 'Mixto'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="mb-6">
            <div className="bg-gray-100 border-y-2 border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700">
              PRODUCTOS
            </div>
            <div className="divide-y">
              {venta.detalles.map((detalle) => (
                <div key={detalle.id} className="py-3">
                  <div className="text-sm font-medium text-gray-900">{detalle.producto_nombre}</div>
                  <div className="text-xs text-gray-600 mt-1 flex items-center justify-between">
                    <span>{detalle.cantidad} x ${formatCurrency(detalle.precio_unitario)}</span>
                    <span className="font-semibold text-gray-900">${formatCurrency(detalle.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="border-t-2 border-gray-300 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">${formatCurrency(venta.subtotal)}</span>
              </div>
              {venta.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-medium text-red-600">-${formatCurrency(venta.descuento)}</span>
                </div>
              )}
              {venta.iva > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (15%):</span>
                  <span className="font-medium text-gray-900">${formatCurrency(venta.iva)}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-gray-300 pt-2 mt-2">
                <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                <span className="text-2xl font-bold text-gray-900">${formatCurrency(venta.total)}</span>
              </div>

              {/* Información de crédito */}
              {venta.tipo_venta === 'credito' && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600 font-medium">Abono Inicial:</span>
                    <span className="font-medium text-blue-600">${formatCurrency(venta.credito_abono_total || 0)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-orange-600 font-bold">Saldo Pendiente:</span>
                    <span className="text-xl font-bold text-orange-600">${formatCurrency(venta.credito_saldo_pendiente || venta.total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información de pago */}
          {venta.tipo_venta === 'contado' && venta.metodo_pago !== 'transferencia' && venta.efectivo_recibido && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Efectivo Recibido:</span>
                <span className="font-medium text-gray-900">${formatCurrency(venta.efectivo_recibido)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Cambio:</span>
                <span className="font-bold text-green-600">${formatCurrency(venta.cambio || 0)}</span>
              </div>
            </div>
          )}

          {/* Pie de página */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">¡Gracias por su compra!</p>
            <p className="text-xs text-gray-500 mt-1">Este documento es un comprobante de venta</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
