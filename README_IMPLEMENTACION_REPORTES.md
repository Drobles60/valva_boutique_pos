# Guía de Implementación de Reportes con Exportación

## 📊 Sistema de Reportes Implementado

Se ha creado un sistema completo de reportes contables con funcionalidad de exportación a PDF y Excel.

## ✅ Componentes Implementados

### 1. Utilidades de Exportación (`lib/export-utils.ts`)

Funciones reutilizables para exportar datos:
- `exportToPDF()` - Exporta tablas a PDF con formato profesional
- `exportToExcel()` - Exporta datos a hojas de cálculo Excel
- `exportSimpleReportToPDF()` - Para reportes sin tablas
- `formatCurrency()` - Formatea números como moneda
- `formatPercentage()` - Formatea porcentajes

### 2. Navegación Actualizada

**Sidebar (`components/app-sidebar.tsx`):**
- Nuevo submenú "Reportes" con dos opciones:
  - Reportes Generales → `/reportes`
  - Reportes Contables → `/reportes/contables`

**Página Principal de Reportes (`components/reportes-content.tsx`):**
- Tarjetas informativas sobre tipos de reportes
- Enlace directo a Reportes Contables
- Información sobre reportes disponibles

### 3. Páginas de Detalle con Exportación

Se crearon 3 páginas de ejemplo completas:

#### ✅ Estado de Resultados
**Ruta:** `/reportes/financieros/estado-resultados`
**Archivo:** `app/reportes/financieros/estado-resultados/page.tsx`
- Muestra ingresos, egresos y utilidad
- Calcula márgenes bruto y neto
- Exportación a PDF y Excel incluida

#### ✅ Flujo de Caja
**Ruta:** `/reportes/financieros/flujo-caja`
**Archivo:** `app/reportes/financieros/flujo-caja/page.tsx`
- Tabla detallada de movimientos
- Balance acumulado
- Filtros por fecha
- Exportación completa

#### ✅ Cartera de Créditos
**Ruta:** `/reportes/clientes/creditos`
**Archivo:** `app/reportes/clientes/creditos/page.tsx`
- Lista de clientes con crédito
- Estados: al día, por vencer, vencido
- Análisis de cartera
- Exportación PDF/Excel

## 🚀 Cómo Crear Nuevas Páginas de Reportes

### Paso 1: Crear el Archivo de Página

Crear archivo en la ruta correspondiente según el tipo de reporte:
```
app/reportes/[categoria]/[nombre-reporte]/page.tsx
```

Categorías disponibles:
- `financieros/` - Reportes financieros
- `ventas/` - Reportes de ventas
- `clientes/` - Reportes de clientes
- `inventario/` - Reportes de inventario
- `administrativos/` - Reportes administrativos

### Paso 2: Estructura Básica de la Página

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, ArrowLeft } from "lucide-react"
import { SidebarToggle } from "@/components/app-sidebar"
import { exportToPDF, exportToExcel, formatCurrency, type TableData, type PDFConfig } from "@/lib/export-utils"
import type { TuTipoDeReporte } from "@/types/reportes"

export default function TuReportePage() {
  const router = useRouter()
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [reporte, setReporte] = useState<TuTipoDeReporte | null>(null)
  const [loading, setLoading] = useState(false)

  // Establecer fechas por defecto
  useEffect(() => {
    const hoy = new Date()
    const hace30Dias = new Date(hoy)
    hace30Dias.setDate(hoy.getDate() - 30)
    setFechaInicio(hace30Dias.toISOString().split('T')[0])
    setFechaFin(hoy.toISOString().split('T')[0])
  }, [])

  // Cargar datos del API
  const cargarReporte = async () => {
    if (!fechaInicio || !fechaFin) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/reportes/[categoria]/[nombre]?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      )
      const data = await response.json()
      setReporte(data)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }

  // Función para exportar a PDF
  const exportarPDF = () => {
    if (!reporte) return

    const tableData: TableData = {
      headers: ['Columna1', 'Columna2', 'Columna3'],
      rows: reporte.datos.map(item => [
        item.campo1,
        formatCurrency(item.campo2),
        item.campo3
      ])
    }

    const config: PDFConfig = {
      title: 'Título del Reporte',
      subtitle: 'Descripción del reporte',
      period: `${fechaInicio} a ${fechaFin}`,
      orientation: 'portrait', // o 'landscape'
      companyInfo: {
        name: 'Valva Boutique',
        address: 'Sistema POS',
        phone: 'Reporte [Tipo]'
      }
    }

    exportToPDF(tableData, config)
  }

  // Función para exportar a Excel
  const exportarExcel = () => {
    if (!reporte) return

    const tableData: TableData = {
      headers: ['Columna1', 'Columna2', 'Columna3'],
      rows: reporte.datos.map(item => [
        item.campo1,
        item.campo2, // Números sin formato para Excel
        item.campo3
      ])
    }

    exportToExcel(tableData, {
      title: 'Título del Reporte',
      period: `${fechaInicio} a ${fechaFin}`,
      sheetName: 'Nombre Hoja'
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header con botones de exportación */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <SidebarToggle />
          <div>
            <h1 className="text-2xl font-bold">Título del Reporte</h1>
            <p className="text-sm text-muted-foreground">Descripción del reporte</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarPDF} disabled={!reporte}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm" onClick={exportarExcel} disabled={!reporte}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Período a analizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="flex items-end md:col-span-2">
              <Button className="w-full" onClick={cargarReporte} disabled={loading}>
                <FileText className="mr-2 h-4 w-4" />
                {loading ? 'Generando...' : 'Generar Reporte'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido del reporte */}
      {reporte && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Columna 1</TableHead>
                  <TableHead>Columna 2</TableHead>
                  <TableHead>Columna 3</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reporte.datos.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.campo1}</TableCell>
                    <TableCell>{item.campo2}</TableCell>
                    <TableCell>{item.campo3}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Mensaje cuando no hay datos */}
      {!reporte && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Genere el reporte</h3>
            <p className="text-muted-foreground text-center">
              Seleccione las fechas y haga clic en "Generar Reporte"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

### Paso 3: Personalización

1. **Cambiar el tipo de datos:** Importar el tipo correcto desde `@/types/reportes`
2. **Ajustar la URL del API:** Cambiar la ruta del fetch según el endpoint
3. **Personalizar las columnas:** Modificar headers y rows según tus datos
4. **Agregar cards de resumen:** Similar a los ejemplos (opcional)
5. **Ajustar orientación PDF:** `portrait` para vertical, `landscape` para horizontal

## 📝 Reportes Pendientes de Implementar

Estos reportes ya tienen su API funcionando, solo falta crear la página de visualización:

### Financieros
- ✅ Estado de Resultados
- ✅ Flujo de Caja
- ⏳ Ganancias (`/reportes/financieros/ganancias`)
- ⏳ Gastos (`/reportes/financieros/gastos`)
- ⏳ Diario de Caja (`/reportes/financieros/diario`)

### Ventas
- ⏳ Ventas Generales (`/reportes/ventas/general`)
- ⏳ Promociones (`/reportes/ventas/promociones`)

### Clientes
- ✅ Cartera de Créditos
- ⏳ Estado de Cuenta (`/reportes/clientes/estado-cuenta`)

### Inventario
- ⏳ Estado de Inventario (`/reportes/inventario/estado`)
- ⏳ Movimientos (`/reportes/inventario/movimientos`)

### Administrativos
- ⏳ Diferencias de Caja (`/reportes/administrativos/diferencias`)

## 🎨 Componentes UI Disponibles

Todos los componentes de shadcn/ui están disponibles:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `TableCell`
- `Button`, `Input`, `Label`, `Select`
- `Badge` - Para estados y etiquetas
- `Alert` - Para mensajes informativos

## 🎯 Tips y Mejores Prácticas

### 1. Formato de Fechas
```typescript
new Date(fecha).toLocaleDateString('es-MX')
```

### 2. Formato de Moneda
```typescript
import { formatCurrency } from "@/lib/export-utils"
formatCurrency(monto) // Retorna "$1,234.56"
```

### 3. Badges de Estado
```typescript
<Badge variant="default">Al Día</Badge>
<Badge variant="destructive">Vencido</Badge>
<Badge variant="secondary">Por Vencer</Badge>
```

### 4. Colores Consistentes
- Verde: Ingresos, ganancias, positivos
- Rojo: Egresos, pérdidas, negativos, vencidos
- Azul: Totales, balances
- Amarillo: Advertencias, por vencer
- Púrpura: Márgenes, porcentajes

### 5. Orientación de PDF
- **Portrait (vertical):** Para reportes con pocas columnas
- **Landscape (horizontal):** Para tablas con muchas columnas

### 6. Validación de Datos
Siempre validar que existen datos antes de exportar:
```typescript
disabled={!reporte}
```

## 🔧 Solución de Problemas

### Error: "Module not found: xlsx"
```bash
pnpm add xlsx
```

### Error: "Module not found: jspdf"
Está instalado, pero revisa la importación:
```typescript
import jsPDF from 'jspdf'
```

### Los datos no se cargan
1. Verifica que el API esté respondiendo en `/api/reportes/...`
2. Revisa la consola del navegador para errores
3. Verifica que las fechas se envíen en formato correcto

### La exportación a PDF no funciona
1. Asegúrate de que `tableData` tenga la estructura correcta
2. Verifica que todos los valores sean strings o numbers
3. Prueba con menos datos primero

## 📚 Referencias

- [Documentación de jsPDF](https://github.com/parallax/jsPDF)
- [Documentación de xlsx](https://github.com/SheetJS/sheetjs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [README_REPORTES_CONTABLES.md](./README_REPORTES_CONTABLES.md) - Documentación de APIs

## 🎉 Próximos Pasos

1. Crear las páginas para los reportes pendientes usando las plantillas
2. Personalizar cada reporte según necesidades específicas
3. Agregar gráficas con librerías como Chart.js o Recharts
4. Implementar exportación programada/automática
5. Agregar filtros avanzados según sea necesario

---

**¡El sistema está listo para usar!** Navega a `/reportes/contables` desde el menú lateral y prueba los reportes implementados.
