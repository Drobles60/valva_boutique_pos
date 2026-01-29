"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Package, Plus, Search, Edit, Trash2, TrendingUp, DollarSign, Printer } from "lucide-react"
import type { Product } from "@/lib/types"
import { getProducts, saveProduct, deleteProduct, getCurrentUser } from "@/lib/storage"
import { SidebarToggle } from "@/components/app-sidebar"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { toast } from "sonner"

export function ProductosContent() {
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
    if (formData.categoria_padre_id) {
      // Verificar si la categoría seleccionada es "Bolsos" (u otras con talla única)
      const categoriaSeleccionada = categoriasPadre.find(
        (cat) => cat.id === parseInt(formData.categoria_padre_id)
      )
      const esBolsos = categoriaSeleccionada?.nombre?.toLowerCase() === 'bolsos'
      setEsCategoriaConTallaUnica(esBolsos)

      const tiposFiltrados = tiposPrenda.filter(
        (tipo) => tipo.categoria_padre_id === parseInt(formData.categoria_padre_id)
      )
      setTiposPrendaFiltrados(tiposFiltrados)
      
      // Si es categoría con talla única, buscar y setear automáticamente la talla ÚNICA
      if (esBolsos) {
        const tallaUnica = tallas.find((t) => t.valor?.toUpperCase() === 'ÚNICA')
        if (tallaUnica) {
          setFormData(prev => ({ ...prev, tipo_prenda_id: "", talla_id: tallaUnica.id.toString() }))
        } else {
          setFormData(prev => ({ ...prev, tipo_prenda_id: "", talla_id: "" }))
        }
      } else {
        // Limpiar tipo de prenda y talla si cambia la categoría padre
        setFormData(prev => ({ ...prev, tipo_prenda_id: "", talla_id: "" }))
      }
      setTallasFiltradas([])
    } else {
      setTiposPrendaFiltrados([])
      setEsCategoriaConTallaUnica(false)
    }
  }, [formData.categoria_padre_id, tiposPrenda, categoriasPadre, tallas])

  // Efecto para filtrar tallas cuando cambia el tipo de prenda
  useEffect(() => {
    if (formData.tipo_prenda_id && !esCategoriaConTallaUnica) {
      console.log('Cargando tallas para tipo_prenda_id:', formData.tipo_prenda_id)
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
        console.log('Respuesta de categorías padre:', result)
        if (result.success && Array.isArray(result.data)) {
          setCategoriasPadre(result.data)
          console.log('Categorías cargadas:', result.data.length)
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
      console.log('=== FETCH TALLAS ====')
      console.log('URL:', url)
      console.log('Tipo Prenda ID:', tipoPrendaId)
      const response = await fetch(url)
      console.log('Response status:', response.status)
      if (response.ok) {
        const result = await response.json()
        console.log('Respuesta completa:', JSON.stringify(result, null, 2))
        console.log('result.success:', result.success)
        console.log('Array.isArray(result.data):', Array.isArray(result.data))
        console.log('result.data.length:', result.data?.length)
        if (result.success && Array.isArray(result.data)) {
          console.log('Estableciendo', result.data.length, 'tallas filtradas')
          console.log('Tallas:', result.data)
          setTallasFiltradas(result.data)
        } else {
          console.error('Formato de respuesta inválido:', result)
          setTallasFiltradas([])
        }
      } else {
        console.error('Response no OK:', response.status)
        setTallasFiltradas([])
      }
      console.log('===================\n')
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
      
      console.log('Verificando cambios para SKU:', {
        categoriaOriginal,
        categoriaActual: formData.categoria_padre_id,
        cambioCategoria,
        tipoOriginal,
        tipoActual: formData.tipo_prenda_id,
        cambioTipo,
        tallaOriginal,
        tallaActual: formData.talla_id,
        cambioTalla
      })
      
      if (cambioCategoria || cambioTipo || cambioTalla) {
        console.log('Se detectaron cambios en clasificación - regenerando SKU')
        // Regenerar SKU pero mantener código de barras
        regenerateSKUAndSubmit()
      } else {
        console.log('No hay cambios en clasificación - actualizando sin regenerar códigos')
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
      // Generar solo el nuevo SKU
      const response = await fetch('/api/productos/generar-codigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoria_padre_id: parseInt(formData.categoria_padre_id),
          tipo_prenda_id: parseInt(formData.tipo_prenda_id),
          talla_id: parseInt(formData.talla_id)
        })
      })

      if (!response.ok) {
        toast.error('Error al generar nuevo SKU')
        return
      }

      const data = await response.json()
      const { sku } = data

      console.log('Nuevo SKU generado:', sku, '- Manteniendo código de barras:', formData.codigo_barras)
      
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
        const tallaUnica = tallas.find((t) => t.valor?.toUpperCase() === 'ÚNICA')
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

      console.log('Códigos generados:', { sku, codigo_barras })

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

      console.log('Guardando producto:', productData)

      // Guardar en base de datos
      const method = editingProduct ? 'PUT' : 'POST'
      const response = await fetch('/api/productos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      let result
      try {
        result = await response.json()
        console.log('Response body:', result)
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
          <div class="store-logo">VALVA BOUTIQUE</div>
          <div class="barcode-container">
            <svg id="barcode-${i}"></svg>
          </div>
          <div class="codigo-text">${labelData.codigo_barras}</div>
          <div class="footer-info">
            <div>
              <div class="ref-label">REF</div>
              <div class="ref-value">${labelData.sku}</div>
            </div>
            <div class="precio">$${labelData.precio_venta.toFixed(2)}</div>
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
            size: letter;
            margin: 2mm;
          }
          
          body {
            font-family: Arial, sans-serif;
            background: white;
            padding: 0;
            margin: 0;
          }
          
          .labels-grid {
            display: grid;
            grid-template-columns: repeat(3, 66mm);
            gap: 5mm 3mm;
            justify-content: start;
            padding: 0;
            margin: 0;
          }
          
          .label-item {
            width: 66mm;
            height: 40mm;
            border: 1px solid #000;
            padding: 2mm;
            display: flex;
            flex-direction: column;
            background: white;
            page-break-inside: avoid;
          }
          
          .store-logo {
            font-size: 8pt;
            font-weight: 900;
            text-align: center;
            letter-spacing: 0.3px;
            color: #000;
            border-bottom: 0.5px solid #000;
            padding-bottom: 1mm;
            margin-bottom: 1mm;
            line-height: 1.2;
          }
          
          .barcode-container {
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 1mm;
            min-height: 50px;
            max-height: 50px;
          }
          
          .barcode-container svg {
            max-width: 100%;
            height: auto;
            max-height: 50px;
          }
          
          .codigo-text {
            font-weight: 700;
            font-size: 7pt;
            color: #000;
            text-align: center;
            margin-bottom: 1mm;
            letter-spacing: 0.3px;
            font-family: 'Consolas', monospace;
            line-height: 1;
          }
          
          .footer-info {
            border-top: 0.5px solid #000;
            padding-top: 0.5mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
          }
          
          .ref-label {
            font-size: 6pt;
            color: #666;
            font-weight: 600;
            margin-bottom: 0.5mm;
          }
          
          .ref-value {
            font-size: 7pt;
            color: #000;
            font-weight: 700;
            font-family: 'Consolas', monospace;
          }
          
          .precio {
            font-size: 11pt;
            font-weight: 700;
            color: #000;
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
                  width: 1.5,
                  height: 50,
                  displayValue: false,
                  margin: 1,
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
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
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
              <div className="text-2xl font-bold">${totalInventario.toLocaleString()}</div>
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
            className="pl-9"
          />
        </div>
        {mounted && canEditPrices && (
          <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
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
                <TableHead className="text-center">Acciones</TableHead>
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
                      <span className="text-sm">${producto.precioCosto?.toFixed(2)}</span>
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <span className="font-medium">
                      ${((producto as any).precio_original || producto.precioVentaPublico)?.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {(producto as any).tiene_descuento ? (
                      <span className="font-medium text-green-600">
                        ${producto.precioVentaPublico?.toFixed(2)}
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Sin descuento</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-center">
                    <span className="text-sm text-muted-foreground">
                      ${producto.precioEspecial?.toFixed(2)}
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
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Blusa Manga Larga Estampada"
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
                    <Select
                      value={formData.categoria_padre_id}
                      onValueChange={(value) => setFormData({ ...formData, categoria_padre_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(categoriasPadre) && categoriasPadre.length > 0 ? (
                          categoriasPadre.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0" disabled>
                            No hay categorías disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_prenda_id">Tipo Específico de Prenda *</Label>
                    <Select
                      value={formData.tipo_prenda_id}
                      onValueChange={(value) => setFormData({ ...formData, tipo_prenda_id: value })}
                      disabled={!formData.categoria_padre_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          formData.categoria_padre_id 
                            ? "Seleccionar tipo" 
                            : "Primero seleccione categoría"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(tiposPrendaFiltrados) && tiposPrendaFiltrados.length > 0 ? (
                          tiposPrendaFiltrados.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id.toString()}>
                              {tipo.nombre}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0" disabled>
                            No hay tipos disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Talla y Color */}
              <div className={esCategoriaConTallaUnica ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
                {!esCategoriaConTallaUnica && (
                  <div className="space-y-2">
                    <Label htmlFor="talla_id">Talla</Label>
                    <Select
                      value={formData.talla_id}
                      onValueChange={(value) => setFormData({ ...formData, talla_id: value })}
                      disabled={!formData.tipo_prenda_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          formData.tipo_prenda_id 
                            ? "Seleccionar talla" 
                            : "Primero seleccione tipo"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(tallasFiltradas) && tallasFiltradas.length > 0 ? (
                          tallasFiltradas.map((talla) => (
                            <SelectItem key={talla.id} value={talla.id.toString()}>
                              {talla.valor}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="0" disabled>
                            No hay tallas disponibles
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                <Select
                  value={formData.proveedor_id}
                  onValueChange={(value) => setFormData({ ...formData, proveedor_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(proveedores) && proveedores.length > 0 ? (
                      proveedores
                        .filter(prov => prov.estado === 'activo')
                        .map((prov) => (
                          <SelectItem key={prov.id} value={prov.id.toString()}>
                            {prov.razon_social} ({prov.ruc})
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="0" disabled>
                        No hay proveedores disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Precios */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 text-[#D4AF37]">Precios y Stock</h4>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="precio_compra">Precio Compra *</Label>
                    <Input
                      id="precio_compra"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_compra}
                      onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="precio_venta">Precio Venta *</Label>
                    <Input
                      id="precio_venta"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_venta}
                      onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
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
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_minimo}
                      onChange={(e) => setFormData({ ...formData, precio_minimo: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_actual">Cantidad en Stock *</Label>
                  <Input
                    id="stock_actual"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
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
    </div>
  )
}
