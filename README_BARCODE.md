# Sistema de Códigos de Barras y Etiquetas

## Descripción General

Sistema automático de generación de códigos SKU y códigos de barras EAN-13 para productos de la boutique, con capacidad de impresión de etiquetas térmicas.

## Formato de Códigos

### SKU (Stock Keeping Unit)
Formato: `CAT-TIPO-TALLA-SECUENCIA`

**Ejemplo:** `PAN-JEA-28-0001`

- **CAT**: Primeras 3 letras de la categoría padre (Pantalon → PAN)
- **TIPO**: Primeras 3 letras del tipo de prenda (Jean → JEA)
- **TALLA**: Valor de la talla (28, M, XS, etc.)
- **SECUENCIA**: Número secuencial de 4 dígitos (0001, 0002, etc.)

**Ejemplos:**
- `PAN-JEA-28-0001` - Pantalón Jean talla 28, primera unidad
- `BLU-CAM-M-0001` - Blusa Camisa talla M, primera unidad
- `VES-COC-XS-0023` - Vestido Coctel talla XS, unidad 23

### Código de Barras EAN-13
Formato estándar EAN-13 (13 dígitos) con estructura:

`2 XX YYYYY ZZZZ C`

- **2**: Prefijo fijo para uso interno (códigos internos de la tienda)
- **XX**: ID de categoría padre (01-99)
- **YYYYY**: Número secuencial del producto (00001-99999)
- **ZZZZ**: Relleno adicional
- **C**: Dígito verificador (calculado automáticamente)

**Ejemplo:** `2010000100016`

## Flujo de Generación

### 1. Registro de Producto

Al registrar un nuevo producto en el formulario:

1. Usuario selecciona:
   - Categoría Padre
   - Tipo de Prenda (filtrado por categoría)
   - Talla (filtrada por tipo de prenda)
   - Otros datos (nombre, color, precio, etc.)

2. Al hacer clic en "Agregar Producto":
   - El sistema llama a `/api/productos/generar-codigos`
   - Se obtienen los nombres desde la base de datos
   - Se calcula la siguiente secuencia disponible
   - Se generan automáticamente:
     - **SKU**: Formato legible para humanos
     - **Código de Barras**: Formato EAN-13 escaneable

### 2. Generación de Códigos

**Endpoint:** `POST /api/productos/generar-codigos`

**Entrada:**
```json
{
  "categoria_padre_id": 1,
  "tipo_prenda_id": 5,
  "talla_id": 15
}
```

**Proceso:**
1. Consultar nombres de categoría, tipo de prenda y talla
2. Obtener última secuencia para esa combinación específica
3. Incrementar secuencia en 1
4. Generar SKU con formato estándar
5. Generar código de barras EAN-13 con dígito verificador

**Salida:**
```json
{
  "success": true,
  "sku": "PAN-JEA-28-0001",
  "codigo_barras": "2010000100016",
  "secuencia": 1
}
```

### 3. Impresión de Etiquetas

Después de registrar el producto, se muestra un diálogo con vista previa de etiquetas.

**Especificaciones de Etiqueta:**
- **Tamaño:** 50mm x 30mm (etiquetas térmicas estándar)
- **Contenido:**
  - Nombre del producto (máximo 20 caracteres)
  - Color (si aplica)
  - Talla
  - Código de barras EAN-13 (visual y escaneable)
  - SKU
  - Precio de venta

**Funcionalidades:**
- Vista previa antes de imprimir
- Impresión de múltiples etiquetas (según stock inicial)
- Formato optimizado para impresoras térmicas
- Código de barras generado con librería jsbarcode

## Archivos del Sistema

### Utilities
- **`lib/barcode-generator.ts`**: Funciones de generación de códigos
  - `generateSKU()`: Genera código SKU
  - `generateBarcode()`: Genera código de barras EAN-13
  - `calculateEAN13CheckDigit()`: Calcula dígito verificador
  - `validateEAN13()`: Valida formato de código de barras
  - `generateLabelDescription()`: Genera descripción corta para etiqueta

### API Endpoints
- **`app/api/productos/generar-codigos/route.ts`**: Generación automática de códigos
- **`app/api/categorias-padre/route.ts`**: Listado de categorías padre
- **`app/api/tipos-prenda/route.ts`**: Listado de tipos de prenda (con filtro)
- **`app/api/tallas/route.ts`**: Listado de tallas (con filtro)

### Componentes UI
- **`components/ui/product-label.tsx`**: Componente de etiqueta imprimible
- **`components/productos-content.tsx`**: Formulario de productos con integración de códigos

## Dependencias

```json
{
  "jsbarcode": "^3.12.3",
  "@types/jsbarcode": "^3.11.4"
}
```

## Uso

### En el Formulario de Productos

1. **Campos Opcionales:**
   - Código de Barras (opcional - se genera automáticamente)
   - SKU (opcional - se genera automáticamente)

2. **Campos Requeridos:**
   - Categoría Padre
   - Tipo de Prenda
   - Talla
   - Nombre
   - Precio de Venta
   - Stock Inicial

3. **Proceso:**
   - Si los campos de código están vacíos, se generan automáticamente
   - Si están llenos, se respetan los valores ingresados
   - Después de guardar, se muestra el diálogo de impresión de etiquetas

### Reimpresión de Etiquetas

En la tabla de productos, cada producto tiene un botón de acciones donde se puede:
- Editar información
- Eliminar producto
- Reimprimir etiquetas (próximamente)

## Validaciones

### SKU
- Formato: `XXX-XXX-XXX-XXXX`
- Único por cada combinación de categoría + tipo + talla + secuencia
- Máximo 20 caracteres

### Código de Barras
- Formato EAN-13 estándar
- 13 dígitos numéricos
- Incluye dígito verificador válido
- Único en todo el sistema

## Mejoras Futuras

1. **Códigos de Barras Personalizables:**
   - Opción de elegir formato (EAN-13, Code 128, QR)
   - Prefijos personalizables por tienda

2. **Etiquetas Avanzadas:**
   - Múltiples diseños de etiquetas
   - Etiquetas con logo de la tienda
   - Códigos QR con enlace a ficha del producto

3. **Reimpresión:**
   - Botón de "Reimprimir Etiqueta" en cada producto
   - Histórico de impresiones
   - Reimpresión masiva

4. **Integración con Hardware:**
   - Soporte nativo para impresoras térmicas
   - Lectores de código de barras USB
   - Impresión directa sin diálogo del navegador

## Soporte Técnico

Para problemas con la generación de códigos o impresión de etiquetas:
1. Verificar que jsbarcode esté instalado correctamente
2. Revisar logs del navegador (F12) para errores
3. Verificar que la base de datos tenga las categorías, tipos y tallas cargadas
4. Confirmar que la impresora térmica esté configurada para 50mm x 30mm
