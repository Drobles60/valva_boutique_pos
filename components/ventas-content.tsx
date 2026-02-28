"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ShoppingCart, Search, Loader2, X } from "lucide-react"
import type { Product, Cliente } from "@/lib/types"
import { getClientes } from "@/lib/storage"
import { SidebarToggle } from "./app-sidebar"
import { FacturaDialog } from "./factura-dialog"
import { CambioDialog } from "./cambio-dialog"
import { CreditoDialog } from "./credito-dialog"
import { ResumenPreciosDialog } from "./resumen-precios-dialog"
import { toast } from "sonner"
import { formatCurrency, normalizeText } from "@/lib/utils"
import { useSession } from "next-auth/react"

type CartItem = {
  product: Product
  cantidad: number
  precioUnitario: number
  tipoCliente: "publico" | "mayorista" | "especial"
}

export function VentasContent() {
  const { data: session } = useSession()
  const [carrito, setCarrito] = React.useState<CartItem[]>([])
  const [productos, setProductos] = React.useState<Product[]>([])
  const [clientes, setClientes] = React.useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [tipoVenta, setTipoVenta] = React.useState("contado")
  const [metodoPago, setMetodoPago] = React.useState("efectivo")
  const [clienteSeleccionado, setClienteSeleccionado] = React.useState<Cliente | null>(null)
  const [procesando, setProcesando] = React.useState(false)
  const [facturaOpen, setFacturaOpen] = React.useState(false)
  const [ventaActual, setVentaActual] = React.useState<any>(null)
  const [cambioDialogOpen, setCambioDialogOpen] = React.useState(false)
  const [creditoDialogOpen, setCreditoDialogOpen] = React.useState(false)
  const [resumenDialogOpen, setResumenDialogOpen] = React.useState(false)
  const [carritoParaProcesar, setCarritoParaProcesar] = React.useState<CartItem[]>([])
  const [cajaAbierta, setCajaAbierta] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    loadProductos()
    loadClientes()
    verificarCaja()
  }, [])

  const verificarCaja = async () => {
    try {
      const response = await fetch('/api/caja/estado')
      if (response.ok) {
        const result = await response.json()
        setCajaAbierta(result.abierta)
      }
    } catch (error) {
      console.error('Error verificando caja:', error)
      setCajaAbierta(false)
    }
  }

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setClientes(result.data)
        }
      } else {
        // Fallback a localStorage
        setClientes(getClientes())
      }
    } catch (error) {
      console.error('Error cargando clientes:', error)
      setClientes(getClientes())
    }
  }

  const loadProductos = async () => {
    try {
      const response = await fetch('/api/productos')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Convertir formato de API a formato de Product
          const productosConvertidos = result.data.map((p: any) => ({
            id: p.id?.toString() || '',
            nombre: p.nombre || '',
            codigo: p.codigo_barras || '',
            referencia: p.sku || '',
            categoria: p.categoria_nombre || '',
            tipoPrenda: p.tipo_prenda_nombre || '',
            talla: p.talla_valor || '',
            color: p.color || '',
            cantidad: Number(p.stock_actual) || 0,
            stockMinimo: 5,
            precioCosto: Number(p.precio_compra) || 0,
            precioVentaPublico: p.tiene_descuento ? Number(p.precio_final) : Number(p.precio_venta),
            precioMayorista: Number(p.precio_venta) || 0,
            precioEspecial: Number(p.precio_minimo) || 0,
            proveedor: p.proveedor_nombre || '',
            // Información completa del descuento
            tieneDescuento: p.tiene_descuento || false,
            descuentoAplicado: p.descuento_aplicado || null,
            precioOriginal: p.precio_original || p.precio_venta,
            precioConDescuento: p.tiene_descuento ? Number(p.precio_final) : undefined,
            montoDescuento: p.monto_descuento || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
          setProductos(productosConvertidos)
        }
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
      toast.error('Error al cargar productos')
    }
  }

  React.useEffect(() => {
    if (clienteSeleccionado) {
      setCarrito((prevCarrito) =>
        prevCarrito.map((item) => ({
          ...item,
          tipoCliente: clienteSeleccionado.tipoCliente,
          precioUnitario: getPrecioByTipo(item.product, clienteSeleccionado.tipoCliente),
        })),
      )
    }
  }, [clienteSeleccionado])

  // Cuando cambia el tipo de venta, resetear cliente si es contado
  React.useEffect(() => {
    if (tipoVenta === "contado") {
      setClienteSeleccionado(null)
      // Actualizar precios del carrito a precio público
      setCarrito((prevCarrito) =>
        prevCarrito.map((item) => ({
          ...item,
          tipoCliente: "publico",
          precioUnitario: getPrecioByTipo(item.product, "publico"),
        })),
      )
    }
  }, [tipoVenta])

  const getPrecioByTipo = (product: Product, tipoCliente: "publico" | "mayorista" | "especial") => {
    // Si el producto tiene descuento aplicado, usar el precio con descuento
    if ((product as any).tieneDescuento && product.precioConDescuento) {
      return product.precioConDescuento
    }
    switch (tipoCliente) {
      case "mayorista":
        return product.precioMayorista
      case "especial":
        return product.precioEspecial
      default:
        return product.precioVentaPublico
    }
  }

  const agregarProducto = (producto: Product) => {
    const tipoCliente = clienteSeleccionado?.tipoCliente || "publico"
    const precio = getPrecioByTipo(producto, tipoCliente)
    const stockDisponible = Number(producto.cantidad) || 0

    if (stockDisponible <= 0) {
      toast.error('Sin stock disponible', {
        description: `${producto.nombre} no tiene unidades disponibles`
      })
      return
    }

    const existente = carrito.find((item) => item.product.id === producto.id)
    if (existente) {
      if (existente.cantidad >= stockDisponible) {
        toast.error('Stock máximo alcanzado', {
          description: `Solo hay ${stockDisponible} unidad(es) disponibles de ${producto.nombre}`
        })
        return
      }

      setCarrito(
        carrito.map((item) => (item.product.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)),
      )
    } else {
      setCarrito([
        ...carrito,
        {
          product: producto,
          cantidad: 1,
          precioUnitario: precio,
          tipoCliente,
        },
      ])
    }
  }

  const eliminarProducto = (id: string) => {
    setCarrito(carrito.filter((item) => item.product.id !== id))
  }

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad < 1) return
    const itemActual = carrito.find((item) => item.product.id === id)
    if (!itemActual) return

    const stockDisponible = Number(itemActual.product.cantidad) || 0
    if (cantidad > stockDisponible) {
      toast.error('Cantidad excede el stock', {
        description: `Máximo disponible: ${stockDisponible} unidad(es) de ${itemActual.product.nombre}`
      })
      return
    }

    setCarrito(carrito.map((item) => (item.product.id === id ? { ...item, cantidad } : item)))
  }

  const actualizarPrecio = (id: string, precio: number) => {
    if (precio < 0) return
    setCarrito(
      carrito.map((item) => {
        if (item.product.id !== id) return item
        if ((item.product as any).tieneDescuento) return item
        return { ...item, precioUnitario: precio }
      })
    )
  }

  const subtotal = carrito.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0)
  const total = subtotal

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío')
      return
    }

    // Verificar que la caja esté abierta antes de continuar
    if (!cajaAbierta) {
      toast.error('Caja cerrada', {
        description: 'Debes abrir la caja antes de registrar ventas.'
      })
      return
    }

    // Abrir diálogo de resumen de precios primero
    setResumenDialogOpen(true)
  }

  const confirmarResumenPrecios = (carritoAjustado: CartItem[]) => {
    // Guardar carrito ajustado y cerrar diálogo de resumen
    setCarritoParaProcesar(carritoAjustado)
    setResumenDialogOpen(false)

    // Actualizar el carrito con los precios ajustados
    setCarrito(carritoAjustado)

    // Abrir diálogo de cobro según tipo de venta
    if (tipoVenta === 'contado') {
      setCambioDialogOpen(true)
    } else {
      setCreditoDialogOpen(true)
    }
  }

  const finalizarVentaContado = async (data: {
    efectivoRecibido: number
    cambio: number
    pagoMixto?: { efectivo: number; transferencia: number }
    referenciaTransferencia?: string
  }) => {
    setCambioDialogOpen(false)
    setProcesando(true)

    try {
      // Preparar datos de la venta de contado
      const ventaData = {
        cliente_id: clienteSeleccionado?.id || null,
        tipo_venta: 'contado',
        metodo_pago: metodoPago,
        productos: carrito.map(item => ({
          producto_id: parseInt(item.product.id),
          cantidad: item.cantidad,
          precio_unitario: item.precioUnitario
        })),
        subtotal,
        iva: 0,
        descuento: 0,
        total,
        descuento_id: null,
        efectivo_recibido: data.efectivoRecibido,
        cambio: data.cambio,
        pago_mixto: data.pagoMixto,
        referencia_transferencia: data.referenciaTransferencia
      }

      // Enviar a la API
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ventaData)
      })

      if (!response.ok) {
        // Intentar parsear el JSON del error
        let errorMessage = 'Error al procesar la venta'
        try {
          const errorResult = await response.json()
          errorMessage = errorResult.error || errorMessage
        } catch (e) {
          // Si no se puede parsear el JSON, usar el texto de la respuesta
          const errorText = await response.text()
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (result.success && result.data) {
        // Limpiar carrito
        setCarrito([])
        setClienteSeleccionado(null)
        
        // Recargar productos para actualizar stock
        await loadProductos()
        
        // Mostrar factura
        setVentaActual(result.data)
        setFacturaOpen(true)
        
        toast.success('¡Venta completada!', {
          description: `Venta ${result.data.numero_venta} registrada exitosamente`
        })
      }
    } catch (error: any) {
      console.error('Error al procesar venta:', error)
      const esCajaCerrada = error.message?.toLowerCase().includes('caja')
      toast.error(esCajaCerrada ? 'Caja cerrada' : 'Error al procesar venta', {
        description: error.message || 'Ocurrió un error inesperado'
      })
      if (esCajaCerrada) setCajaAbierta(false)
    } finally {
      setProcesando(false)
    }
  }

  const finalizarVentaCredito = async (data: {
    cliente: any
    abono?: any
    esNuevoCliente: boolean
  }) => {
    setCreditoDialogOpen(false)
    setProcesando(true)

    try {
      // Si es nuevo cliente, primero registrarlo
      let clienteId = null
      if (data.esNuevoCliente) {
        const clienteResponse = await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data.cliente)
        })

        if (!clienteResponse.ok) {
          // Intentar parsear el JSON del error
          let errorMessage = 'Error al registrar cliente'
          try {
            const errorResult = await clienteResponse.json()
            errorMessage = errorResult.error || errorMessage
          } catch (e) {
            // Si no se puede parsear el JSON, usar el texto de la respuesta
            const errorText = await clienteResponse.text()
            errorMessage = errorText || `Error ${clienteResponse.status}: ${clienteResponse.statusText}`
          }
          throw new Error(errorMessage)
        }

        const clienteResult = await clienteResponse.json()
        clienteId = clienteResult.data.id
      } else {
        clienteId = data.cliente.id
      }

      // Preparar datos de la venta a crédito
      const ventaData = {
        cliente_id: clienteId,
        tipo_venta: 'credito',
        metodo_pago: null,
        productos: carrito.map(item => ({
          producto_id: parseInt(item.product.id),
          cantidad: item.cantidad,
          precio_unitario: item.precioUnitario
        })),
        subtotal,
        iva: 0,
        descuento: 0,
        total,
        descuento_id: null,
        abono: data.abono
      }

      // Enviar a la API
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaData)
      })

      if (!response.ok) {
        // Intentar parsear el JSON del error
        let errorMessage = 'Error al procesar la venta'
        try {
          const errorResult = await response.json()
          errorMessage = errorResult.error || errorMessage
        } catch (e) {
          // Si no se puede parsear el JSON, usar el texto de la respuesta
          const errorText = await response.text()
          errorMessage = errorText || `Error ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (result.success && result.data) {
        // Limpiar carrito
        setCarrito([])
        setClienteSeleccionado(null)
        
        // Recargar productos y clientes
        await loadProductos()
        await loadClientes()
        
        // Mostrar factura
        setVentaActual(result.data)
        setFacturaOpen(true)
        
        toast.success('¡Venta a crédito completada!', {
          description: `Venta ${result.data.numero_venta} registrada exitosamente`
        })
      }
    } catch (error: any) {
      console.error('Error al procesar venta a crédito:', error)
      const esCajaCerrada = error.message?.toLowerCase().includes('caja')
      toast.error(esCajaCerrada ? 'Caja cerrada' : 'Error al procesar venta', {
        description: error.message || 'Ocurrió un error inesperado'
      })
      if (esCajaCerrada) setCajaAbierta(false)
    } finally {
      setProcesando(false)
    }
  }

  const productosFiltrados = productos.filter(
    (p) =>
      p.cantidad > 0 && // Solo mostrar productos con stock disponible
      (normalizeText(p.nombre).includes(normalizeText(searchTerm)) ||
      normalizeText(p.codigo).includes(normalizeText(searchTerm)) ||
      normalizeText(p.referencia).includes(normalizeText(searchTerm))),
  )

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Punto de Venta</h1>
            <p className="text-muted-foreground">Sistema POS con múltiples precios</p>
          </div>
        </div>
        <Button size="lg" disabled={carrito.length === 0 || procesando || !cajaAbierta} onClick={procesarVenta}>
          {procesando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Procesar Venta
            </>
          )}
        </Button>
      </div>

      {cajaAbierta === false && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="font-semibold text-destructive">Caja cerrada</p>
            <p className="text-sm text-muted-foreground">
              No se pueden registrar ventas. Dirígete a{' '}
              <a href="/caja" className="font-medium underline text-destructive hover:opacity-80">Gestión de Caja</a>
              {' '}para abrir la caja primero.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Búsqueda de Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 pr-9"
                    placeholder="Buscar por nombre, código o referencia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 md:h-7 md:w-7"
                      onClick={() => setSearchTerm("")}
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Productos Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              {productosFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron productos</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {productosFiltrados.map((producto) => {
                    const tipoCliente = clienteSeleccionado?.tipoCliente || "publico"
                    const precioActual = getPrecioByTipo(producto, tipoCliente)
                    const precioMinimoMostrado = (producto as any).tieneDescuento
                      ? (producto.precioConDescuento || producto.precioVentaPublico)
                      : producto.precioEspecial

                    return (
                      <div
                        key={producto.id}
                        className="flex flex-col rounded-lg border p-4 hover:bg-secondary cursor-pointer transition-colors"
                        onClick={() => agregarProducto(producto)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium">{producto.nombre}</p>
                            <p className="text-xs text-muted-foreground">{producto.codigo}</p>
                            {(producto as any).tieneDescuento && (producto as any).descuentoAplicado && (
                              <Badge variant="destructive" className="mt-1">
                                {(producto as any).descuentoAplicado.tipo === 'porcentaje' 
                                  ? `${(producto as any).descuentoAplicado.valor}% OFF`
                                  : `Precio ${(producto as any).descuentoAplicado.nombre}`}
                              </Badge>
                            )}
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => agregarProducto(producto)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio de venta:</span>
                            <span className="font-semibold">
                              ${formatCurrency(producto.precioVentaPublico)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Precio mínimo:</span>
                            <span className="font-semibold text-[#D4AF37]">
                              ${formatCurrency(precioMinimoMostrado)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <p className="font-bold text-primary text-lg">${formatCurrency(precioActual)}</p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {producto.cantidad} | {producto.categoria}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carrito de Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No hay productos en el carrito</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div key={item.product.id} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product.nombre}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.tipoCliente === "publico"
                                ? "Público"
                                : item.tipoCliente === "mayorista"
                                  ? "Mayorista"
                                  : "Especial"}
                            </Badge>
                            {(item.product as any).tieneDescuento && (item.product as any).descuentoAplicado && (
                              <Badge variant="destructive" className="text-xs">
                                {(item.product as any).descuentoAplicado.tipo === 'porcentaje' 
                                  ? `${(item.product as any).descuentoAplicado.valor}% OFF`
                                  : `${(item.product as any).descuentoAplicado.nombre}`}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => eliminarProducto(item.product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.product.id, item.cantidad - 1)}
                            disabled={item.cantidad <= 1}
                            title={item.cantidad <= 1 ? 'Cantidad mínima alcanzada' : undefined}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => actualizarCantidad(item.product.id, Number.parseInt(e.target.value) || 1)}
                            className="h-8 w-12 text-center"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarCantidad(item.product.id, item.cantidad + 1)}
                            disabled={item.cantidad >= Number(item.product.cantidad || 0)}
                            title={item.cantidad >= Number(item.product.cantidad || 0) ? 'Stock máximo alcanzado' : undefined}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Precio:</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.precioUnitario === 0 ? '' : String(item.precioUnitario)}
                          onChange={(e) => {
                            const raw = e.target.value
                            const digits = raw.replace(/\D/g, '')
                            const normalized = digits.replace(/^0+(?=\d)/, '')
                            const nextValue = normalized ? Number.parseInt(normalized, 10) : 0
                            actualizarPrecio(item.product.id, nextValue)
                          }}
                          className="h-8 flex-1 text-sm"
                          disabled={(item.product as any).tieneDescuento}
                          title={(item.product as any).tieneDescuento ? 'Precio bloqueado por descuento' : undefined}
                        />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Subtotal:</span>
                        <span className="font-bold text-sm">
                          ${formatCurrency(item.precioUnitario * item.cantidad)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo-venta">Tipo de Venta</Label>
                <Select value={tipoVenta} onValueChange={setTipoVenta}>
                  <SelectTrigger id="tipo-venta">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Contado</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tipoVenta === "contado" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="metodo-pago">Método de Pago</Label>
                    <Select value={metodoPago} onValueChange={setMetodoPago}>
                      <SelectTrigger id="metodo-pago">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="mixto">Mixto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="font-medium">${formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">${formatCurrency(total)}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                disabled={carrito.length === 0 || procesando} 
                onClick={procesarVenta}
              >
                {procesando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Finalizar Venta'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogo de resumen de precios */}
      <ResumenPreciosDialog
        open={resumenDialogOpen}
        onClose={() => setResumenDialogOpen(false)}
        carrito={carrito}
        onConfirmar={confirmarResumenPrecios}
      />

      {/* Diálogo de factura */}
      <FacturaDialog
        open={facturaOpen}
        onClose={() => setFacturaOpen(false)}
        venta={ventaActual}
      />

      {/* Diálogo de cambio (venta contado) */}
      <CambioDialog
        open={cambioDialogOpen}
        onClose={() => setCambioDialogOpen(false)}
        total={total}
        metodoPago={metodoPago as 'efectivo' | 'transferencia' | 'mixto'}
        onConfirmar={finalizarVentaContado}
      />

      {/* Diálogo de crédito */}
      <CreditoDialog
        open={creditoDialogOpen}
        onClose={() => setCreditoDialogOpen(false)}
        total={total}
        clientesExistentes={clientes}
        onConfirmar={finalizarVentaCredito}
      />
    </div>
  )
}
