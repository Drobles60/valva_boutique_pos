# 📦 Sistema de Ventas - Valva Boutique POS

## ✅ Funcionalidades Implementadas

### 1. Registro de Ventas
- ✅ Guardado completo en base de datos (tabla `ventas`)
- ✅ Registro de detalles de venta (tabla `detalle_ventas`)
- ✅ Generación automática de número de venta (VEN-YYYYMMDD-0001)
- ✅ Soporte para ventas a contado y crédito
- ✅ Múltiples métodos de pago (efectivo, transferencia, tarjeta)

### 2. Control de Inventario
- ✅ Descuento automático de stock al completar venta
- ✅ Registro de movimientos de inventario (tabla `movimientos_inventario`)
- ✅ Validación de stock disponible antes de procesar venta
- ✅ Prevención de ventas con stock insuficiente

### 3. Gestión de Créditos
- ✅ Registro de cuentas por cobrar (tabla `cuentas_por_cobrar`)
- ✅ Actualización de saldo del cliente
- ✅ Fecha de vencimiento automática (30 días)
- ✅ Control de límite de crédito por cliente

### 4. Facturación
- ✅ Vista previa de factura con diseño profesional
- ✅ Impresión directa de factura
- ✅ Generación de PDF para descarga
- ✅ Almacenamiento como histórico de venta

## 📋 Estructura de la Factura

La factura generada incluye:

### Encabezado
- Logo de la empresa (logo 1.jpeg)
- Nombre del negocio: "Valva Boutique"
- Eslogan: "Moda y Estilo"
- Teléfono: (Pendiente de definir)
- Número de factura (VEN-YYYYMMDD-0001)
- Fecha y hora de la venta

### Información del Cliente
- Nombre completo
- Identificación
- Teléfono
- Dirección

### Información del Vendedor
- Nombre del vendedor
- Tipo de venta (Contado/Crédito)
- Método de pago

### Detalle de Productos
Tabla con:
- Nombre del producto
- Cantidad
- Precio unitario
- Subtotal

### Totales
- Subtotal
- Descuentos (si aplica)
- IVA (si aplica)
- **TOTAL en grande**

### Pie de Página
- Mensaje de agradecimiento
- Texto de comprobante

## 🔄 Flujo del Proceso de Venta

```
1. Usuario agrega productos al carrito
   ↓
2. Selecciona cliente (opcional para contado)
   ↓
3. Selecciona tipo de venta (contado/crédito)
   ↓
4. Si es contado, selecciona método de pago
   ↓
5. Click en "Finalizar Venta"
   ↓
6. Sistema valida:
   - Carrito no vacío
   - Cliente seleccionado si es crédito
   - Stock disponible
   ↓
7. Sistema registra:
   - Venta en tabla ventas
   - Detalles en detalle_ventas
   - Descuenta stock de productos
   - Crea movimientos de inventario
   - Si es crédito: crea cuenta por cobrar
   - Registra movimiento en caja (si es contado)
   ↓
8. Muestra factura en vista previa
   ↓
9. Usuario puede:
   - Ver factura
   - Imprimir
   - Descargar PDF
```

## 📁 Archivos Modificados/Creados

### Backend (API)
- ✅ `app/api/ventas/route.ts` - API de ventas (GET, POST)
- ✅ `app/api/clientes/route.ts` - API de clientes (GET)

### Frontend (Componentes)
- ✅ `components/ventas-content.tsx` - Módulo de ventas actualizado
- ✅ `components/factura-dialog.tsx` - Vista previa y PDF de factura

### Base de Datos
- ✅ `database/schema.sql` - Tabla ventas actualizada
- ✅ `database/update-ventas-table.sql` - Script de actualización
- ✅ Tabla `cuentas_por_cobrar` creada
- ✅ Tabla `abonos` creada

### Scripts de Utilidad
- ✅ `scripts/update-ventas-table.js` - Actualizar tabla ventas
- ✅ `scripts/create-cuentas-por-cobrar.js` - Crear tablas de crédito
- ✅ `scripts/verificar-sistema-ventas.js` - Verificación del sistema

## 🗃️ Estructura de Base de Datos

### Tabla: ventas
```sql
- id (PK)
- numero_venta (UNIQUE)
- cliente_id (FK)
- fecha_venta
- subtotal
- iva
- descuento
- total
- estado (completada, credito, anulada)
- tipo_venta (contado, credito)
- metodo_pago (efectivo, transferencia, tarjeta, mixto)
- descuento_id (FK)
- usuario_id (FK)
- caja_id (FK)
- created_at
- updated_at
```

### Tabla: detalle_ventas
```sql
- id (PK)
- venta_id (FK)
- producto_id (FK)
- cantidad
- precio_unitario
- subtotal
```

### Tabla: cuentas_por_cobrar
```sql
- id (PK)
- cliente_id (FK)
- venta_id (FK)
- monto_total
- saldo_pendiente
- fecha_vencimiento
- estado (pendiente, pagada, vencida)
- created_at
- updated_at
```

## 🧪 Cómo Probar

### 1. Verificar el Sistema
```bash
node scripts/verificar-sistema-ventas.js
```

### 2. Acceder al Módulo de Ventas
1. Iniciar sesión (admin o vendedor)
2. Ir a "Ventas (POS)"

### 3. Realizar una Venta de Contado
1. Buscar y agregar productos al carrito
2. Seleccionar tipo de venta: "Contado"
3. Seleccionar método de pago: "Efectivo"
4. Click en "Finalizar Venta"
5. Ver vista previa de factura
6. Opcionalmente: Imprimir o Descargar PDF

### 4. Realizar una Venta a Crédito
1. Buscar y agregar productos al carrito
2. Seleccionar un cliente
3. Seleccionar tipo de venta: "Crédito"
4. Click en "Finalizar Venta"
5. Ver vista previa de factura

### 5. Verificar en Base de Datos
```sql
-- Ver última venta
SELECT * FROM ventas ORDER BY id DESC LIMIT 1;

-- Ver detalles de la última venta
SELECT dv.*, p.nombre 
FROM detalle_ventas dv
INNER JOIN productos p ON dv.producto_id = p.id
WHERE dv.venta_id = (SELECT MAX(id) FROM ventas);

-- Verificar stock actualizado
SELECT nombre, stock_actual FROM productos;

-- Ver movimientos de inventario
SELECT * FROM movimientos_inventario ORDER BY id DESC LIMIT 10;
```

## 📝 Permisos Requeridos

### Para Realizar Ventas
- Permiso: `ventas.crear`
- Roles con acceso: Administrador, Vendedor

### Para Ver Historial de Ventas
- Permiso: `ventas.ver`
- Roles con acceso: Administrador, Vendedor

## 🎨 Personalización de Factura

Para personalizar la factura, edita:
- **Logo**: Cambiar `/public/logo 1.jpeg`
- **Nombre negocio**: Línea 127 de `factura-dialog.tsx`
- **Teléfono**: Línea 129 de `factura-dialog.tsx` (actualmente "Por definir")
- **Eslogan**: Línea 128 de `factura-dialog.tsx`

## 📦 Dependencias Instaladas

```json
{
  "jspdf": "^4.1.0",
  "html2canvas": "^1.4.1",
  "react-to-print": "^3.2.0"
}
```

## ⚠️ Notas Importantes

1. **Stock**: El sistema valida stock antes de procesar la venta
2. **Cliente Crédito**: Para ventas a crédito es OBLIGATORIO seleccionar un cliente
3. **Caja**: Se debe tener al menos una caja activa (se crea automáticamente)
4. **Número de Venta**: Se genera automáticamente y es único por día
5. **Factura**: Se puede ver inmediatamente después de completar la venta
6. **PDF**: Se genera al momento de hacer clic en "Descargar PDF"

## 🚀 Próximas Mejoras (Opcional)

- [ ] Envío de factura por email
- [ ] Envío de factura por WhatsApp
- [ ] Histórico de ventas con filtros
- [ ] Anulación de ventas
- [ ] Devoluciones
- [ ] Notas de crédito
- [ ] Reportes de ventas

## ✅ Sistema Listo para Producción

El sistema de ventas está completamente funcional y listo para uso en producción. Todas las pruebas han sido exitosas.

**¡El sistema está listo para procesar ventas! 🎉**
