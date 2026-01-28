# Sistema de Etiquetas con Código de Barras

## 🎯 Solución Implementada

Para tu boutique donde **los productos NO vienen con código de barras del proveedor**, he configurado el sistema para:

### ✅ Generación Automática al 100%
- **SIEMPRE** genera código de barras y SKU automáticamente al registrar productos
- No hay campos para ingresar códigos manualmente (todo es automático)
- Códigos únicos basados en: Categoría + Tipo + Talla + Secuencia

---

## 📋 Flujo Completo de Trabajo

### 1️⃣ **Registrar Producto**

**Formulario simplificado:**
```
┌─────────────────────────────────────────────────┐
│ ℹ️ Generación Automática                        │
│ El código de barras y SKU se generarán          │
│ automáticamente. Después podrás imprimir        │
│ las etiquetas con código de barras, SKU y       │
│ precio.                                         │
└─────────────────────────────────────────────────┘

📝 Nombre del Producto *
   Ej: Blusa Manga Larga Estampada

📁 Categoría Padre *
   [Seleccionar: Pantalon, Blusa, Conjunto, etc.]

👕 Tipo de Prenda *
   [Filtrado según categoría]

📏 Talla *
   [Filtrada según tipo de prenda]

🎨 Color
   Ej: Azul marino

👤 Proveedor *
   [Seleccionar proveedor]

💰 Precio de Compra *
   $15.00

💵 Precio de Venta *
   $35.00

📦 Stock Inicial *
   5 unidades
```

### 2️⃣ **Sistema Genera Códigos Automáticamente**

Al hacer clic en "Agregar Producto":

```
✓ Consulta base de datos para nombres
✓ Calcula siguiente secuencia disponible
✓ Genera SKU: PAN-JEA-28-0001
✓ Genera Código de Barras: 2010000100016
✓ Guarda producto en sistema
✓ Muestra diálogo de impresión
```

**Notificación:**
```
┌────────────────────────────────────────────────┐
│ ✓ ¡Producto registrado exitosamente!          │
│                                                │
│ SKU: PAN-JEA-28-0001                          │
│ Código: 2010000100016                         │
│ Listo para imprimir etiquetas                 │
└────────────────────────────────────────────────┘
```

### 3️⃣ **Imprimir Etiquetas**

Se abre automáticamente el diálogo con vista previa:

---

## 🏷️ Diseño de Etiqueta (50mm x 30mm)

```
┌──────────────────────────────────────────────┐
│                                              │
│        Blusa Manga Larga - Azul             │
│  ───────────────────────────────────────     │
│                                              │
│         Talla: M | Azul marino              │
│                                              │
│        ▌▐│││▌▐▌││▐││▐▌▐▌│▌                 │
│        ▌▐│││▌▐▌││▐││▐▌▐▌│▌                 │
│         2 010001 000164                     │
│                                              │
│  ─────────────────────────────────────────   │
│  REF:                            $35.00     │
│  BLU-MAN-M-0001                             │
│                                              │
└──────────────────────────────────────────────┘
```

**Elementos de la etiqueta:**
1. **Nombre del producto** - Hasta 18 caracteres + color (10 chars)
2. **Talla y color** - Información destacada y centrada
3. **Código de barras EAN-13** - Visual y escaneable por lectores
4. **Referencia (SKU)** - PAN-JEA-28-0001 (para búsqueda manual)
5. **Precio de venta** - Grande y destacado ($35.00)

---

## 🖨️ Opciones de Impresión

### Vista Previa del Diálogo:

```
┌────────────────────────────────────────────────────┐
│  Imprimir Etiquetas                                │
│  Vista previa de las etiquetas para [Nombre]       │
├────────────────────────────────────────────────────┤
│                                                    │
│  📋 SKU: BLU-MAN-M-0001 | 🏷️ Código: 2010001...  │
│                                                    │
│  [Imprimir 5 Etiquetas] 🖨️                        │
│                                                    │
│  ┌──────────────┐ ┌──────────────┐                │
│  │  Etiqueta 1  │ │  Etiqueta 2  │                │
│  │    PREVIA    │ │    PREVIA    │                │
│  └──────────────┘ └──────────────┘                │
│                                                    │
│                       [Cerrar]                     │
└────────────────────────────────────────────────────┘
```

**Características:**
- Imprime tantas etiquetas como stock inicial registrado
- Vista previa antes de imprimir
- Optimizado para impresoras térmicas de 50mm x 30mm
- Compatible con lectores de código de barras estándar

---

## 📊 Formatos de Códigos

### SKU (Referencia Interna)
**Formato:** `CAT-TIPO-TALLA-SECUENCIA`

**Ejemplos por categoría:**

| Categoría | Tipo | Talla | Secuencia | SKU Generado |
|-----------|------|-------|-----------|--------------|
| Pantalon | Jean | 28 | 1 | `PAN-JEA-28-0001` |
| Blusa | Manga Larga | M | 15 | `BLU-MAN-M-0015` |
| Vestido | Cóctel | 8 | 3 | `VES-COC-8-0003` |
| Bolso | Bandolera | ÚNICA | 7 | `BOL-BAN-UNIC-0007` |

**Ventajas:**
- ✅ Legible por humanos
- ✅ Identifica categoría a simple vista
- ✅ Facilita búsquedas y organización
- ✅ Único para cada producto

### Código de Barras EAN-13
**Formato:** `2 XX YYYYY ZZZZ C`

**Estructura:**
- `2` - Prefijo fijo (uso interno de tienda)
- `XX` - ID de categoría (01-07)
- `YYYYY` - Secuencia del producto (00001-99999)
- `ZZZZ` - Relleno
- `C` - Dígito verificador automático

**Ejemplo:** `2010000100016`
- `2` = Uso interno
- `01` = Categoría Pantalón
- `00001` = Primer producto de esta combinación
- `0001` = Relleno
- `6` = Dígito verificador

**Ventajas:**
- ✅ Escaneable con cualquier lector de código de barras
- ✅ Formato EAN-13 estándar internacional
- ✅ Dígito verificador previene errores
- ✅ Único en todo el sistema

---

## 🔧 Configuración de Hardware

### Impresora Térmica Recomendada

**Especificaciones necesarias:**
- Tamaño de etiqueta: 50mm x 30mm (2" x 1.2")
- Tecnología: Transferencia térmica directa
- Resolución: 203 DPI mínimo
- Conexión: USB o Bluetooth

**Marcas recomendadas:**
- Zebra GK420d
- Brother QL-700/800
- Dymo LabelWriter
- TSC DA210

### Lector de Código de Barras

**Características:**
- Compatible con EAN-13
- Conexión USB (plug & play)
- Modo teclado (emula typing)

**Marcas confiables:**
- Honeywell Voyager 1200g
- Zebra DS2208
- Datalogic QuickScan

---

## 💡 Uso Diario

### Registrar 10 Blusas del mismo modelo:

1. **Llenás el formulario UNA vez:**
   - Nombre: Blusa Manga Larga Floreada
   - Categoría: Blusa
   - Tipo: Manga Larga
   - Talla: M
   - Color: Floreado
   - Precio: $35.00
   - Stock: **10 unidades**

2. **Sistema genera:**
   - SKU: BLU-MAN-M-0023
   - Código: 2020000230014

3. **Imprimís:**
   - **10 etiquetas idénticas** en una sola vez
   - Pegás una en cada blusa
   - Todas tienen el mismo código (mismo producto, misma talla)

### Al Vender:

1. Escaneás el código de barras de la etiqueta
2. Sistema busca el producto automáticamente
3. Muestra: nombre, talla, color, precio
4. Confirmas la venta
5. Stock se actualiza automáticamente (10 → 9)

---

## 🎨 Personalización Futura

### Mejoras Disponibles:

1. **Logo en la etiqueta**
   - Agregar logo de "Valva Boutique" arriba

2. **Información adicional**
   - Código de proveedor
   - Fecha de ingreso
   - Instrucciones de lavado

3. **Colores por categoría**
   - Pantalones: fondo azul
   - Blusas: fondo rosa
   - Vestidos: fondo morado

4. **Códigos QR**
   - Enlace a ficha del producto
   - Información de cuidados

---

## ✅ Resumen

Tu sistema ahora:

✓ **Genera automáticamente** código de barras y SKU al registrar productos
✓ **Imprime etiquetas profesionales** con código de barras escaneable
✓ Muestra **referencia (SKU)** y **precio de venta** claramente
✓ Optimizado para **etiquetas térmicas de 50mm x 30mm**
✓ **Compatible con lectores estándar** de código de barras
✓ **Códigos únicos** para cada combinación de producto

**¡Todo listo para usar!** 🎉

---

## 📞 Siguiente Paso

1. **Comprar o configurar impresora térmica** (50mm x 30mm)
2. **Probar impresión de etiquetas** con productos de prueba
3. **Adquirir lector de código de barras** USB
4. **Empezar a registrar productos reales**

El sistema está 100% funcional y automático.
