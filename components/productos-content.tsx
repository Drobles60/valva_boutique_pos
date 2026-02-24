"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, Plus, Search, Edit, Trash2, TrendingUp, DollarSign, Printer, X } from "lucide-react"
import type { Product } from "@/lib/types"
import { getProducts, saveProduct, deleteProduct, getCurrentUser } from "@/lib/storage"
import { SidebarToggle } from "@/components/app-sidebar"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"
import { formatCurrency, normalizeText } from "@/lib/utils"
import {
  isColorProductoValido,
  isNombreProductoValido,
  sanitizeColorProducto,
  sanitizeNombreProducto,
} from "@/lib/producto-validations"

export function ProductosContent() {
  const previousCategoriaPadreIdRef = useRef("")

  const [productos, setProductos] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(null)
  const [mounted, setMounted] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)

  // Estados para los datos del servidor
  const [categoriasPadre, setCategoriasPadre] = useState<any[]>([])
  const [tiposPrenda, setTiposPrenda] = useState<any[]>([])
  const [tiposPrendaFiltrados, setTiposPrendaFiltrados] = useState<any[]>([])
  const [tallas, setTallas] = useState<any[]>([])
  const [tallasFiltradas, setTallasFiltradas] = useState<any[]>([])
  const [proveedores, setProveedores] = useState<any[]>([])
  const [esCategoriaConTallaUnica, setEsCategoriaConTallaUnica] = useState(false)

  // Estados para mini-modales de creación inline
  const [crearCategoriaOpen, setCrearCategoriaOpen] = useState(false)
  const [crearCategoriaName, setCrearCategoriaName] = useState("")
  const [crearCategoriaLoading, setCrearCategoriaLoading] = useState(false)

  const [crearTipoPrendaOpen, setCrearTipoPrendaOpen] = useState(false)
  const [crearTipoPrendaName, setCrearTipoPrendaName] = useState("")
  const [crearTipoPrendaLoading, setCrearTipoPrendaLoading] = useState(false)

  const [crearProveedorOpen, setCrearProveedorOpen] = useState(false)
  const [crearProveedorData, setCrearProveedorData] = useState({ razonSocial: "", ruc: "", telefono: "" })
  const [crearProveedorLoading, setCrearProveedorLoading] = useState(false)

  const [formData, setFormData] = useState({
    sku: "",
    codigo_barras: "",
    nombre: "",
    descripcion: "",
    categoria_padre_id: "",
    tipo_prenda_id: "",
    talla_id: "",
    proveedor_id: "",
    color: "",
    precio_compra: "",
    precio_venta: "",
    precio_minimo: "",
    stock_actual: "",
  })

  useEffect(() => {
    setMounted(true)
    setCurrentUser(getCurrentUser())
    loadProductos()
    loadCategoriasPadre()
    loadTiposPrenda()
    loadTallas()
    loadProveedores()
  }, [])

  // Efecto para filtrar tipos de prenda cuando cambia la categoría padre
  useEffect(() => {
    if (!formData.categoria_padre_id) {
      setTiposPrendaFiltrados([])
      setTallasFiltradas([])
      setEsCategoriaConTallaUnica(false)
      previousCategoriaPadreIdRef.current = ""
      return
    }

    const categoriaSeleccionada = categoriasPadre.find(
      (cat) => cat.id === parseInt(formData.categoria_padre_id)
    )
    const esBolsos = categoriaSeleccionada?.nombre?.toLowerCase() === 'bolsos'
    const categoriaCambio = previousCategoriaPadreIdRef.current !== formData.categoria_padre_id

    setEsCategoriaConTallaUnica(esBolsos)

    const tiposFiltrados = tiposPrenda.filter(
      (tipo) => tipo.categoria_padre_id === parseInt(formData.categoria_padre_id)
    )
    setTiposPrendaFiltrados(tiposFiltrados)

    if (categoriaCambio) {
      if (esBolsos) {
        const tallaUnica = tallas.find((t) => t.valor?.toUpperCase() === 'U')
        if (tallaUnica) {
          setFormData(prev => ({ ...prev, tipo_prenda_id: "", talla_id: tallaUnica.id.toString() }))
        } else {
          setFormData(prev => ({ ...prev, tipo_prenda_id: "", talla_id: "" }))
        }
      } else {
        setFormData(prev => ({ ...prev, tipo_prenda_id: "", talla_id: "" }))
      }
      setTallasFiltradas([])
    } else if (esBolsos && !formData.talla_id) {
      const tallaUnica = tallas.find((t) => t.valor?.toUpperCase() === 'U')
      if (tallaUnica) {
        setFormData(prev => ({ ...prev, talla_id: tallaUnica.id.toString() }))
      }
    }

    previousCategoriaPadreIdRef.current = formData.categoria_padre_id
  }, [formData.categoria_padre_id, tiposPrenda, categoriasPadre, tallas])

  // Efecto para filtrar tallas cuando cambia el tipo de prenda
  useEffect(() => {
    if (formData.tipo_prenda_id && !esCategoriaConTallaUnica) {
      fetchTallasPorTipoPrenda(parseInt(formData.tipo_prenda_id))
    } else if (!esCategoriaConTallaUnica) {
      setTallasFiltradas([])
    }
  }, [formData.tipo_prenda_id, esCategoriaConTallaUnica])

  const loadCategoriasPadre = async () => {
    try {
      const response = await fetch('/api/categorias-padre')
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setCategoriasPadre(result.data)
        } else {
          console.error('Formato de respuesta inválido:', result)
          setCategoriasPadre([])
        }
      } else {
        console.error('Error en respuesta:', response.status)
        setCategoriasPadre([])
      }
    } catch (error) {
      console.error('Error al cargar categorías padre:', error)
      setCategoriasPadre([])
    }
  }

  const loadTiposPrenda = async () => {
    try {
      const response = await fetch('/api/tipos-prenda')
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setTiposPrenda(result.data)
        } else {
          setTiposPrenda([])
        }
      } else {
        setTiposPrenda([])
      }
    } catch (error) {
      console.error('Error al cargar tipos de prenda:', error)
      setTiposPrenda([])
    }
  }

  const loadTallas = async () => {
    try {
      const response = await fetch('/api/tallas')
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setTallas(result.data)
        } else {
          setTallas([])
        }
      } else {
        setTallas([])
      }
    } catch (error) {
      console.error('Error al cargar tallas:', error)
      setTallas([])
    }
  }

  const fetchTallasPorTipoPrenda = async (tipoPrendaId: number) => {
    try {
      const url = `/api/tallas?tipo_prenda_id=${tipoPrendaId}`
      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setTallasFiltradas(result.data)
        } else {
          console.error('Formato de respuesta inválido:', result)
          setTallasFiltradas([])
        }
      } else {
        console.error('Response no OK:', response.status)
        setTallasFiltradas([])
      }
    } catch (error) {
      console.error('Error al cargar tallas filtradas:', error)
      setTallasFiltradas([])
    }
  }

  const loadProveedores = async () => {
    try {
      const response = await fetch('/api/proveedores')
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setProveedores(result.data)
        } else {
          setProveedores([])
        }
      } else {
        setProveedores([])
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error)
      setProveedores([])
    }
  }

  // ── Funciones de creación inline ──────────────────────────────────────────

  const handleCrearCategoria = async () => {
    if (!crearCategoriaName.trim()) return
    setCrearCategoriaLoading(true)
    try {
      const res = await fetch('/api/categorias-padre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: crearCategoriaName.trim() })
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || 'Error al crear categoría'); return }
      await loadCategoriasPadre()
      setFormData(prev => ({ ...prev, categoria_padre_id: json.data.id.toString(), tipo_prenda_id: '', talla_id: '' }))
      toast.success(`Categoría "${json.data.nombre}" creada`)
      setCrearCategoriaOpen(false)
      setCrearCategoriaName("")
    } catch {
      toast.error('Error al crear categoría')
    } finally {
      setCrearCategoriaLoading(false)
    }
  }

  const handleCrearTipoPrenda = async () => {
    if (!crearTipoPrendaName.trim() || !formData.categoria_padre_id) return
    setCrearTipoPrendaLoading(true)
    try {
      const res = await fetch('/api/tipos-prenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: crearTipoPrendaName.trim(), categoria_padre_id: parseInt(formData.categoria_padre_id) })
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || 'Error al crear tipo de prenda'); return }
      await loadTiposPrenda()
      // Actualizar filtrados también
      const tiposFiltrados = [...tiposPrenda, json.data].filter(
        (t) => t.categoria_padre_id === parseInt(formData.categoria_padre_id)
      )
      setTiposPrendaFiltrados(tiposFiltrados)
      setFormData(prev => ({ ...prev, tipo_prenda_id: json.data.id.toString(), talla_id: '' }))
      toast.success(`Tipo de prenda "${json.data.nombre}" creado`)
      setCrearTipoPrendaOpen(false)
      setCrearTipoPrendaName("")
    } catch {
      toast.error('Error al crear tipo de prenda')
    } finally {
      setCrearTipoPrendaLoading(false)
    }
  }

  const handleCrearProveedor = async () => {
    const { razonSocial, ruc, telefono } = crearProveedorData
    if (!razonSocial.trim() || !ruc.trim() || !telefono.trim()) {
      toast.error('Razón social, RUC y teléfono son obligatorios')
      return
    }
    setCrearProveedorLoading(true)
    try {
      const res = await fetch('/api/proveedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ razonSocial: razonSocial.trim(), ruc: ruc.trim(), telefono: telefono.trim() })
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error || 'Error al crear proveedor'); return }
      await loadProveedores()
      setFormData(prev => ({ ...prev, proveedor_id: json.id.toString() }))
      toast.success(`Proveedor "${json.razon_social}" creado`)
      setCrearProveedorOpen(false)
      setCrearProveedorData({ razonSocial: '', ruc: '', telefono: '' })
    } catch {
      toast.error('Error al crear proveedor')
    } finally {
      setCrearProveedorLoading(false)
    }
  }

  // ────────────────────────────────────────────────────────────────────────────

  const loadProductos = async () => {
    try {
      const response = await fetch('/api/productos')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Convertir formato de API a formato de Product del storage
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Agregar información de descuento
            descuento_aplicado: p.descuento_aplicado,
            tiene_descuento: p.tiene_descuento,
            precio_original: Number(p.precio_original),
            precio_final: Number(p.precio_final),
            // Guardar IDs originales para detectar cambios al editar
            categoria_padre_id: p.categoria_padre_id,
            tipo_prenda_id: p.tipo_prenda_id,
            talla_id: p.talla_id,
            proveedor_id: p.proveedor_id
          }))
          setProductos(productosConvertidos)
        }
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
      // Fallback a localStorage si falla la API
      setProductos(getProducts())
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      toast.error('Debe ingresar el nombre del producto')
      return
    }

    if (!isNombreProductoValido(formData.nombre)) {
      toast.error('El nombre del producto solo puede contener letras y espacios')
      return
    }

    if (!isColorProductoValido(formData.color)) {
      toast.error('El color solo puede contener letras y espacios')
      return
    }

    if (!formData.categoria_padre_id) {
      toast.error('Debe seleccionar la categoría principal')
      return
    }

    if (!formData.tipo_prenda_id) {
      toast.error('Debe seleccionar el tipo específico de prenda')
      return
    }

    if (!esCategoriaConTallaUnica && !formData.talla_id) {
      toast.error('Debe seleccionar una talla')
      return
    }

    if (!formData.proveedor_id) {
      toast.error('Debe seleccionar un proveedor')
      return
    }

    if (!formData.precio_compra) {
      toast.error('Debe ingresar el precio de compra')
      return
    }

    if (!formData.precio_venta) {
      toast.error('Debe ingresar el precio de venta')
      return
    }

    if (!formData.stock_actual) {
      toast.error('Debe ingresar la cantidad en stock')
      return
    }

    // Si estamos editando, verificar si cambió categoría, tipo o talla para regenerar SKU
    if (editingProduct) {
      // Obtener IDs originales del producto
      const categoriaOriginal = (editingProduct as any).categoria_padre_id?.toString() || ""
      const tipoOriginal = (editingProduct as any).tipo_prenda_id?.toString() || ""
      const tallaOriginal = (editingProduct as any).talla_id?.toString() || ""

      // Verificar si cambió alguno de los factores que afectan el SKU
      const cambioCategoria = categoriaOriginal !== formData.categoria_padre_id
      const cambioTipo = tipoOriginal !== formData.tipo_prenda_id
      const cambioTalla = tallaOriginal !== formData.talla_id

      if (cambioCategoria || cambioTipo || cambioTalla) {
        // Regenerar SKU pero mantener código de barras
        regenerateSKUAndSubmit()
      } else {
        // Actualizar sin regenerar códigos
        submitProduct()
      }
    } else {
      // Producto nuevo: generar ambos códigos
      generateCodesAndSubmit()
    }
  }

  const regenerateSKUAndSubmit = async () => {
    try {
      let tallaId = formData.talla_id

      if (esCategoriaConTallaUnica && !tallaId) {
        const tallaUnica = tallas.find((t) => t.valor?.toUpperCase() === 'U')
        if (tallaUnica) {
          tallaId = tallaUnica.id.toString()
          setFormData(prev => ({ ...prev, talla_id: tallaId }))
        } else {
          toast.error('No se encontró la talla única en el sistema')
          return
        }
      }

      if (!tallaId) {
        toast.error('Debe seleccionar una talla')
        return
      }

      // Generar solo el nuevo SKU
      const response = await fetch('/api/productos/generar-codigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria_padre_id: parseInt(formData.categoria_padre_id),
          tipo_prenda_id: parseInt(formData.tipo_prenda_id),
          talla_id: parseInt(tallaId)
        })
      })

      if (!response.ok) {
        let errorMessage = 'Error al generar nuevo SKU'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // Ignorar error de parseo y usar mensaje por defecto
        }
        toast.error(errorMessage)
        return
      }

      const data = await response.json()
      const { sku } = data

      setFormData(prev => ({ ...prev, sku }))
      await submitProduct(sku, formData.codigo_barras) // Mantener código de barras original

      toast.success('Producto actualizado con nuevo SKU')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar producto')
    }
  }

  const generateCodesAndSubmit = async () => {
    try {
      // Si es categoría con talla única y aún no se ha asignado, buscarla
      let tallaId = formData.talla_id
      if (esCategoriaConTallaUnica && !tallaId) {
        const tallaUnica = tallas.find((t) => t.valor?.toUpperCase() === 'U')
        if (tallaUnica) {
          tallaId = tallaUnica.id.toString()
          setFormData(prev => ({ ...prev, talla_id: tallaId }))
        } else {
          toast.error('No se encontró la talla única en el sistema')
          return
        }
      }

      if (!tallaId) {
        toast.error('Debe seleccionar una talla')
        return
      }

      // Generar códigos únicos
      const response = await fetch('/api/productos/generar-codigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria_padre_id: parseInt(formData.categoria_padre_id),
          tipo_prenda_id: parseInt(formData.tipo_prenda_id),
          talla_id: parseInt(tallaId)
        })
      })

      if (!response.ok) {
        toast.error('Error al generar códigos')
        return
      }

      const data = await response.json()
      const { sku, codigo_barras } = data

      setFormData(prev => ({ ...prev, sku, codigo_barras }))
      await submitProduct(sku, codigo_barras)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al generar códigos')
    }
  }

  const submitProduct = async (generatedSku?: string, generatedBarcode?: string) => {
    try {
      // Preparar datos para la API
      const productData = {
        id: editingProduct?.id,
        codigo_barras: generatedBarcode || formData.codigo_barras,
        sku: generatedSku || formData.sku,
        nombre: formData.nombre,
        descripcion: formData.descripcion || '',
        categoria_padre_id: parseInt(formData.categoria_padre_id),
        tipo_prenda_id: parseInt(formData.tipo_prenda_id),
        talla_id: formData.talla_id ? parseInt(formData.talla_id) : null,
        proveedor_id: parseInt(formData.proveedor_id),
        color: formData.color,
        precio_compra: parseFloat(formData.precio_compra),
        precio_venta: parseFloat(formData.precio_venta),
        precio_minimo: parseFloat(formData.precio_minimo || formData.precio_venta),
        stock_actual: parseInt(formData.stock_actual),
        estado: 'activo'
      }

      // Guardar en base de datos
      const method = editingProduct ? 'PUT' : 'POST'
      const response = await fetch('/api/productos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Error parseando JSON:', parseError)
        const text = await response.text()
        console.error('Response text:', text)
        toast.error('Error de servidor - respuesta inválida')
        return
      }

      if (!response.ok) {
        console.error('Error del servidor:', result)
        console.error('Detalles:', result.details)
        console.error('Código:', result.code)

        // Mensaje personalizado para código duplicado
        if (result.code === 'ER_DUP_ENTRY') {
          if (result.details?.includes('codigo_barras')) {
            toast.error('El código de barras ya existe en el sistema')
          } else if (result.details?.includes('sku')) {
            toast.error('El SKU ya existe en el sistema')
          } else {
            toast.error('Ya existe un producto con estos datos')
          }
        } else {
          toast.error(result.error || 'Error al guardar producto')
        }
        return
      }

      // Obtener talla para las etiquetas
      const talla = tallasFiltradas.find(t => t.id === parseInt(formData.talla_id)) ||
        tallas.find(t => t.id === parseInt(formData.talla_id))

      // También guardar en localStorage para mantener compatibilidad
      const categoria = categoriasPadre.find(c => c.id === parseInt(formData.categoria_padre_id))
      const tipo = tiposPrendaFiltrados.find(t => t.id === parseInt(formData.tipo_prenda_id))

      const product: Product = {
        id: result.data?.id?.toString() || editingProduct?.id || Date.now().toString(),
        codigo: generatedBarcode || formData.codigo_barras,
        nombre: formData.nombre,
        referencia: generatedSku || formData.sku,
        categoria: categoria?.nombre || formData.categoria_padre_id,
        tipoPrenda: tipo?.nombre || '',
        talla: talla?.valor || '',
        color: formData.color,
        cantidad: Number.parseFloat(formData.stock_actual),
        precioCosto: Number.parseFloat(formData.precio_compra),
        precioVentaPublico: Number.parseFloat(formData.precio_venta),
        precioMayorista: Number.parseFloat(formData.precio_venta),
        precioEspecial: Number.parseFloat(formData.precio_minimo || formData.precio_venta),
        stockMinimo: 5,
        proveedor: formData.proveedor_id,
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      saveProduct(product)
      loadProductos()

      handleCloseDialog()

      // Generar PDF de etiquetas directamente
      toast.success('¡Producto registrado exitosamente!', {
        description: `SKU: ${generatedSku || formData.sku} - Generando etiquetas...`
      })

      setTimeout(() => {
        generateLabelPDF({
          sku: generatedSku || formData.sku,
          codigo_barras: generatedBarcode || formData.codigo_barras,
          nombre: formData.nombre,
          color: formData.color,
          talla: talla?.valor || 'N/A',
          precio_venta: Number.parseFloat(formData.precio_venta),
          cantidad: Number.parseFloat(formData.stock_actual)
        })
      }, 500)
    } catch (error) {
      console.error('Error al guardar producto:', error)
      toast.error('Error al guardar producto')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)

    // Usar IDs guardados directamente o buscar como fallback
    const categoriaId = (product as any).categoria_padre_id?.toString() ||
      categoriasPadre.find(c => c.nombre === product.categoria)?.id?.toString() || ""
    const tipoPrendaId = (product as any).tipo_prenda_id?.toString() ||
      tiposPrenda.find(t => t.nombre === product.tipoPrenda)?.id?.toString() || ""
    const tallaId = (product as any).talla_id?.toString() ||
      tallas.find(t => t.valor === product.talla)?.id?.toString() || ""
    const proveedorId = (product as any).proveedor_id?.toString() ||
      proveedores.find(p => p.razon_social === product.proveedor)?.id?.toString() || ""

    setFormData({
      sku: product.referencia || "",
      codigo_barras: product.codigo || "",
      nombre: product.nombre || "",
      descripcion: "",
      categoria_padre_id: categoriaId,
      tipo_prenda_id: tipoPrendaId,
      talla_id: tallaId,
      proveedor_id: proveedorId,
      color: product.color || "",
      precio_compra: product.precioCosto?.toString() || "",
      precio_venta: (product as any).precio_original?.toString() || product.precioVentaPublico?.toString() || "",
      precio_minimo: product.precioEspecial?.toString() || "",
      stock_actual: product.cantidad?.toString() || "",
    })
    setDialogOpen(true)
  }

  const handleOpenNewProduct = () => {
    // Limpiar todos los datos del formulario y estado
    setEditingProduct(null)
    setFormData({
      sku: "",
      codigo_barras: "",
      nombre: "",
      descripcion: "",
      categoria_padre_id: "",
      tipo_prenda_id: "",
      talla_id: "",
      proveedor_id: "",
      color: "",
      precio_compra: "",
      precio_venta: "",
      precio_minimo: "",
      stock_actual: "",
    })
    setTiposPrendaFiltrados([])
    setTallasFiltradas([])
    setEsCategoriaConTallaUnica(false)
    // Abrir el diálogo
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setProductToDelete(id)
    setConfirmDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete)
      loadProductos()
      toast.success("Producto eliminado", {
        description: "El producto ha sido eliminado del inventario"
      })
      setProductToDelete(null)
    }
  }

  const handlePrintLabel = (product: Product) => {
    // Generar PDF directamente con la cantidad del stock
    generateLabelPDF({
      sku: product.referencia,
      codigo_barras: product.codigo,
      nombre: product.nombre,
      color: product.color || '',
      talla: product.talla || '',
      precio_venta: product.precioVentaPublico,
      cantidad: product.cantidad || 1
    })
  }

  const generateLabelPDF = (labelData: any) => {
    const cantidad = labelData.cantidad || 1
    let labelsHTML = ''

    for (let i = 0; i < cantidad; i++) {
      labelsHTML += `
        <div class="label-item">
          <div class="header-row">
            <div class="store-logo">VALVA BOUTIQUE</div>
            <div class="precio">$${formatCurrency(labelData.precio_venta)}</div>
          </div>
          <div class="barcode-container">
            <svg id="barcode-${i}"></svg>
          </div>
          <div class="footer-info">
            <span class="codigo-text">${labelData.codigo_barras}</span>
            <span class="ref-label">REF</span>
            <span class="ref-value">${labelData.sku}</span>
          </div>
        </div>
      `
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Etiquetas - ${labelData.nombre}</title>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            size: 100mm auto;
            margin: 2mm;
          }

          body {
            font-family: Arial, sans-serif;
            background: white;
            width: 96mm;
          }

          .labels-grid {
            display: grid;
            grid-template-columns: repeat(3, 30mm);
            gap: 1.5mm 3mm;
          }

          .label-item {
            width: 30mm;
            height: 25mm;
            border: 0.5px solid #000;
            padding: 0.8mm 1mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: white;
            page-break-inside: avoid;
            overflow: hidden;
          }

          /* Fila 1: tienda + precio */
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 0.4px solid #000;
            padding-bottom: 0.5mm;
          }

          .store-logo {
            font-size: 5pt;
            font-weight: 900;
            color: #000;
            line-height: 1.1;
            letter-spacing: -0.2px;
          }

          .precio {
            font-size: 7pt;
            font-weight: 900;
            color: #000;
            white-space: nowrap;
            line-height: 1.1;
          }

          /* Fila 2: código de barras */
          .barcode-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .barcode-container svg {
            max-width: 100%;
            height: auto;
            max-height: 22px;
            display: block;
          }

          /* Fila 3: código + SKU */
          .footer-info {
            display: flex;
            align-items: center;
            gap: 1mm;
            border-top: 0.4px solid #ccc;
            padding-top: 0.4mm;
          }

          .codigo-text {
            font-size: 4.5pt;
            font-weight: 700;
            color: #000;
            font-family: 'Consolas', monospace;
            white-space: nowrap;
          }

          .ref-label {
            font-size: 4pt;
            color: #777;
            font-weight: 600;
          }

          .ref-value {
            font-size: 4.5pt;
            color: #000;
            font-weight: 700;
            font-family: 'Consolas', monospace;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 16mm;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="labels-grid">
          ${labelsHTML}
        </div>
        <script>
          // Esperar a que JsBarcode esté disponible
          function generateBarcodes() {
            if (typeof JsBarcode === 'undefined') {
              setTimeout(generateBarcodes, 100);
              return;
            }
            
            for (let i = 0; i < ${cantidad}; i++) {
              try {
                JsBarcode('#barcode-' + i, '${labelData.codigo_barras}', {
                  format: 'CODE128',
                  width: 1,
                  height: 20,
                  displayValue: false,
                  margin: 0,
                  background: '#ffffff',
                  lineColor: '#000000'
                });
              } catch (e) {
                console.error('Error generando código de barras:', e);
                document.getElementById('barcode-' + i).innerHTML = '<text>Error: ' + e.message + '</text>';
              }
            }
            
            // Esperar a que se generen los códigos de barras antes de imprimir
            setTimeout(() => {
              window.print();
            }, 500);
          }
          
          generateBarcodes();
        </script>
      </body>
      </html>
    `

    // Crear un Blob con el contenido HTML
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    // Abrir en una nueva pestaña del navegador de forma no bloqueante
    window.open(url, '_blank', 'noopener,noreferrer')

    // Liberar la URL después de un tiempo
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 5000)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingProduct(null)
    setFormData({
      sku: "",
      codigo_barras: "",
      nombre: "",
      descripcion: "",
      categoria_padre_id: "",
      tipo_prenda_id: "",
      talla_id: "",
      proveedor_id: "",
      color: "",
      precio_compra: "",
      precio_venta: "",
      precio_minimo: "",
      stock_actual: "",
    })
    setTiposPrendaFiltrados([])
    setTallasFiltradas([])
  }

  const calcularMargen = (costo: number, venta: number) => {
    if (!costo || !venta) return "0"
    return (((venta - costo) / costo) * 100).toFixed(2)
  }

  const filteredProductos = productos.filter(
    (p) =>
      normalizeText(p.nombre).includes(normalizeText(searchTerm)) ||
      normalizeText(p.codigo).includes(normalizeText(searchTerm)) ||
      normalizeText(p.referencia).includes(normalizeText(searchTerm)) ||
      normalizeText(p.categoria).includes(normalizeText(searchTerm)),
  )

  const totalInventario = productos.reduce((sum, p) => sum + p.cantidad * p.precioCosto, 0)
  const totalProductos = productos.length
  const productosStockBajo = productos.filter((p) => p.stockMinimo && p.cantidad <= p.stockMinimo).length

  const canViewCosts = currentUser?.rol === 'administrador'
  const canEditPrices = currentUser?.rol === 'administrador'

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Gestión de Productos</h1>
            <p className="text-sm text-muted-foreground md:text-base">Administra tu inventario de productos</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProductos}</div>
            <p className="text-xs text-muted-foreground">{productosStockBajo} con stock bajo</p>
          </CardContent>
        </Card>
        {mounted && canViewCosts && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${formatCurrency(totalInventario)}</div>
              <p className="text-xs text-muted-foreground">Costo total</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productos.length > 0
                ? String((
                  productos.reduce(
                    (sum, p) => sum + Number.parseFloat(calcularMargen(p.precioCosto, p.precioVentaPublico)),
                    0,
                  ) / productos.length
                ).toFixed(1))
                : "0"}
              %
            </div>
            <p className="text-xs text-muted-foreground">Rentabilidad</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col gap-2 md:flex-row md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
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
        {mounted && canEditPrices && (
          <Button onClick={handleOpenNewProduct} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        )}
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
          <CardDescription>Lista completa de productos registrados</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell text-center">Referencia (SKU)</TableHead>
                <TableHead className="hidden lg:table-cell text-center">Tipo de Prenda</TableHead>
                <TableHead className="hidden xl:table-cell text-center">Talla</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                {mounted && canViewCosts && <TableHead className="text-center">P. Compra</TableHead>}
                <TableHead className="text-center">P. Venta</TableHead>
                <TableHead className="text-center">Descuento</TableHead>
                <TableHead className="hidden lg:table-cell text-center">P. Mínimo</TableHead>
                <TableHead className="text-center pl-8">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-xs text-muted-foreground md:hidden">SKU: {producto.referencia}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    <span className="font-mono text-sm">{producto.referencia}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    <Badge variant="outline">{producto.tipoPrenda || producto.categoria}</Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-center">
                    <span className="text-sm">{producto.talla || 'N/A'}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        producto.stockMinimo && producto.cantidad <= producto.stockMinimo
                          ? "text-red-600 font-semibold"
                          : "font-medium"
                      }
                    >
                      {producto.cantidad}
                    </span>
                  </TableCell>
                  {mounted && canViewCosts && (
                    <TableCell className="text-center">
                      <span className="text-sm">${formatCurrency(producto.precioCosto)}</span>
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <span className="font-medium">
                      ${formatCurrency((producto as any).precio_original || producto.precioVentaPublico)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {(producto as any).tiene_descuento ? (
                      <span className="font-medium text-green-600">
                        ${formatCurrency(producto.precioVentaPublico)}
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Sin descuento</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    <span className="text-sm text-muted-foreground">
                      ${formatCurrency(producto.precioEspecial)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePrintLabel(producto)}
                        title="Imprimir etiqueta"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      {mounted && canEditPrices && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(producto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(producto.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription>Complete la información del producto según la base de datos</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Información Automática */}
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                  ℹ️ Generación Automática
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  El código de barras y SKU se generarán automáticamente al guardar el producto.
                  Después podrás imprimir las etiquetas con el código de barras, SKU y precio.
                </p>
              </div>

              {/* Nombre y Descripción */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: sanitizeNombreProducto(e.target.value).toUpperCase() })}
                  required
                  placeholder="Ej: Blusa Manga Larga Estampada"
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción detallada del producto"
                  rows={3}
                />
              </div>

              {/* Categorización */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-[#D4AF37]">Categorización</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria_padre_id">Categoría Principal *</Label>
                    <SearchableSelect
                      value={formData.categoria_padre_id}
                      onValueChange={(value) => setFormData({ ...formData, categoria_padre_id: value })}
                      items={categoriasPadre.map((cat) => ({
                        value: cat.id.toString(),
                        label: cat.nombre
                      }))}
                      placeholder="Seleccionar categoría"
                      searchPlaceholder="Buscar categoría..."
                      emptyMessage="No se encontraron categorías"
                      onCreateNew={(term) => { setCrearCategoriaName(term); setCrearCategoriaOpen(true) }}
                      createNewLabel="Crear categoría"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_prenda_id">Tipo Específico de Prenda *</Label>
                    <SearchableSelect
                      value={formData.tipo_prenda_id}
                      onValueChange={(value) => setFormData({ ...formData, tipo_prenda_id: value })}
                      disabled={!formData.categoria_padre_id}
                      items={tiposPrendaFiltrados.map((tipo) => ({
                        value: tipo.id.toString(),
                        label: tipo.nombre
                      }))}
                      placeholder={
                        formData.categoria_padre_id
                          ? "Seleccionar tipo"
                          : "Primero seleccione categoría"
                      }
                      searchPlaceholder="Buscar tipo de prenda..."
                      emptyMessage="No se encontraron tipos de prenda"
                      onCreateNew={(term) => { setCrearTipoPrendaName(term); setCrearTipoPrendaOpen(true) }}
                      createNewLabel="Crear tipo de prenda"
                    />
                  </div>
                </div>
              </div>

              {/* Talla y Color */}
              <div className={esCategoriaConTallaUnica ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
                {!esCategoriaConTallaUnica && (
                  <div className="space-y-2">
                    <Label htmlFor="talla_id">Talla</Label>
                    <SearchableSelect
                      value={formData.talla_id}
                      onValueChange={(value) => setFormData({ ...formData, talla_id: value })}
                      disabled={!formData.tipo_prenda_id}
                      items={tallasFiltradas.map((talla) => ({
                        value: talla.id.toString(),
                        label: talla.valor
                      }))}
                      placeholder={
                        formData.tipo_prenda_id
                          ? "Seleccionar talla"
                          : "Primero seleccione tipo"
                      }
                      searchPlaceholder="Buscar talla..."
                      emptyMessage="No se encontraron tallas"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: sanitizeColorProducto(e.target.value) })}
                    placeholder="Ej: Rojo, Azul marino"
                  />
                </div>
              </div>

              {esCategoriaConTallaUnica && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    ℹ️ Los productos de esta categoría no requieren talla. Se asignará automáticamente como "Talla Única".
                  </p>
                </div>
              )}

              {/* Proveedor */}
              <div className="space-y-2">
                <Label htmlFor="proveedor_id">Proveedor *</Label>
                <SearchableSelect
                  value={formData.proveedor_id}
                  onValueChange={(value) => setFormData({ ...formData, proveedor_id: value })}
                  items={proveedores
                    .filter(prov => prov.estado === 'activo')
                    .map((prov) => ({
                      value: prov.id.toString(),
                      label: `${prov.razon_social} (${prov.ruc})`
                    }))}
                  placeholder="Seleccionar proveedor"
                  searchPlaceholder="Buscar proveedor..."
                  emptyMessage="No se encontraron proveedores"
                  onCreateNew={(term) => { setCrearProveedorData(d => ({ ...d, razonSocial: term })); setCrearProveedorOpen(true) }}
                  createNewLabel="Crear proveedor"
                />
              </div>

              {/* Precios */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-[#D4AF37]">Precios y Stock</h4>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="precio_compra">Precio Compra *</Label>
                    <Input
                      id="precio_compra"
                      type="text"
                      value={formData.precio_compra ? formatCurrency(formData.precio_compra) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                        setFormData({ ...formData, precio_compra: value })
                      }}
                      onFocus={(e) => {
                        if (formData.precio_compra) {
                          e.target.value = formData.precio_compra
                        }
                      }}
                      onBlur={(e) => {
                        if (formData.precio_compra) {
                          e.target.value = formatCurrency(formData.precio_compra)
                        }
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precio_venta">Precio Venta *</Label>
                    <Input
                      id="precio_venta"
                      type="text"
                      value={formData.precio_venta ? formatCurrency(formData.precio_venta) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                        setFormData({ ...formData, precio_venta: value })
                      }}
                      onFocus={(e) => {
                        if (formData.precio_venta) {
                          e.target.value = formData.precio_venta
                        }
                      }}
                      onBlur={(e) => {
                        if (formData.precio_venta) {
                          e.target.value = formatCurrency(formData.precio_venta)
                        }
                      }}
                      required
                    />
                    {formData.precio_compra && formData.precio_venta && (
                      <p className="text-xs text-muted-foreground">
                        Margen:{" "}
                        {calcularMargen(
                          Number.parseFloat(formData.precio_compra),
                          Number.parseFloat(formData.precio_venta),
                        )}
                        %
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precio_minimo">Precio Mínimo</Label>
                    <Input
                      id="precio_minimo"
                      type="text"
                      value={formData.precio_minimo ? formatCurrency(formData.precio_minimo) : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                        setFormData({ ...formData, precio_minimo: value })
                      }}
                      onFocus={(e) => {
                        if (formData.precio_minimo) {
                          e.target.value = formData.precio_minimo
                        }
                      }}
                      onBlur={(e) => {
                        if (formData.precio_minimo) {
                          e.target.value = formatCurrency(formData.precio_minimo)
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_actual">Cantidad en Stock *</Label>
                  <Input
                    id="stock_actual"
                    type="text"
                    value={formData.stock_actual ? formatCurrency(formData.stock_actual) : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '')
                      setFormData({ ...formData, stock_actual: value })
                    }}
                    onFocus={(e) => {
                      if (formData.stock_actual) {
                        e.target.value = formData.stock_actual
                      }
                    }}
                    onBlur={(e) => {
                      if (formData.stock_actual) {
                        e.target.value = formatCurrency(formData.stock_actual)
                      }
                    }}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta cantidad se registrará en el inventario inicial
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">{editingProduct ? "Guardar Cambios" : "Agregar Producto"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar producto?"
        description="Esta acción eliminará permanentemente este producto del inventario. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Mini-modal: Crear Categoría */}
      <Dialog open={crearCategoriaOpen} onOpenChange={setCrearCategoriaOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
            <DialogDescription>Ingresa el nombre de la nueva categoría principal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Nombre *</Label>
            <Input
              value={crearCategoriaName}
              onChange={(e) => setCrearCategoriaName(e.target.value.toUpperCase())}
              placeholder="Ej: VESTIDOS"
              className="uppercase"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCrearCategoria() } }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCrearCategoriaOpen(false)}>Cancelar</Button>
            <Button onClick={handleCrearCategoria} disabled={crearCategoriaLoading || !crearCategoriaName.trim()}>
              {crearCategoriaLoading ? 'Creando...' : 'Crear Categoría'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mini-modal: Crear Tipo de Prenda */}
      <Dialog open={crearTipoPrendaOpen} onOpenChange={setCrearTipoPrendaOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo Tipo de Prenda</DialogTitle>
            <DialogDescription>
              Se creará dentro de la categoría seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Nombre *</Label>
            <Input
              value={crearTipoPrendaName}
              onChange={(e) => setCrearTipoPrendaName(e.target.value.toUpperCase())}
              placeholder="Ej: BLUSA MANGA CORTA"
              className="uppercase"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCrearTipoPrenda() } }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCrearTipoPrendaOpen(false)}>Cancelar</Button>
            <Button onClick={handleCrearTipoPrenda} disabled={crearTipoPrendaLoading || !crearTipoPrendaName.trim()}>
              {crearTipoPrendaLoading ? 'Creando...' : 'Crear Tipo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mini-modal: Crear Proveedor */}
      <Dialog open={crearProveedorOpen} onOpenChange={setCrearProveedorOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo Proveedor</DialogTitle>
            <DialogDescription>Completa los datos mínimos del proveedor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Razón Social *</Label>
              <Input
                value={crearProveedorData.razonSocial}
                onChange={(e) => setCrearProveedorData(d => ({ ...d, razonSocial: e.target.value }))}
                placeholder="Nombre de la empresa o persona"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label>RUC *</Label>
              <Input
                value={crearProveedorData.ruc}
                onChange={(e) => setCrearProveedorData(d => ({ ...d, ruc: e.target.value }))}
                placeholder="Número de RUC"
              />
            </div>
            <div className="space-y-1">
              <Label>Teléfono *</Label>
              <Input
                value={crearProveedorData.telefono}
                onChange={(e) => setCrearProveedorData(d => ({ ...d, telefono: e.target.value }))}
                placeholder="Teléfono de contacto"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCrearProveedor() } }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCrearProveedorOpen(false); setCrearProveedorData({ razonSocial: '', ruc: '', telefono: '' }) }}>Cancelar</Button>
            <Button onClick={handleCrearProveedor} disabled={crearProveedorLoading || !crearProveedorData.razonSocial.trim() || !crearProveedorData.ruc.trim() || !crearProveedorData.telefono.trim()}>
              {crearProveedorLoading ? 'Creando...' : 'Crear Proveedor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
