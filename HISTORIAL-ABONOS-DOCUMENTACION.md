# Historial de Abonos - Nueva Funcionalidad

## 🎯 Funcionalidades Implementadas

### 1️⃣ **Historial General de Abonos por Cliente**
Permite ver TODOS los abonos que ha realizado un cliente en TODAS sus facturas.

**Características:**
- ✅ Muestra todos los abonos del cliente ordenados por fecha (más recientes primero)
- ✅ Incluye resumen con:
  - Total abonado (suma de todos los abonos)
  - Cantidad total de abonos
  - Saldo pendiente actual del cliente
- ✅ Cada abono muestra:
  - Fecha y hora del abono
  - Número de factura asociada
  - Monto del abono
  - Método de pago
  - Referencia (si es transferencia)
  - Notas (si hay)
  - Usuario que registró el abono
- ✅ Vista responsive (desktop y mobile)
- ✅ Botón de acceso rápido con ícono de historial (History) en la búsqueda de clientes

**Cómo acceder:**
1. Ir a "Abonar a Cliente con Distribución Automática"
2. Buscar un cliente
3. Hacer clic en el ícono de historial (⏱️) al lado del cliente
4. Se abre el diálogo con todo el historial del cliente

### 2️⃣ **Historial de Abonos por Factura Individual**
Permite ver solo los abonos de UNA factura específica.

**Características:**
- ✅ Muestra solo los abonos de la factura seleccionada
- ✅ Incluye información de la factura en el encabezado:
  - Número de factura
  - Monto total de la factura
  - Total abonado
  - Saldo pendiente
  - Cliente asociado
- ✅ Cada abono muestra:
  - Fecha y hora del abono
  - Monto del abono
  - Método de pago
  - Referencia
  - Usuario
- ✅ Vista responsive (desktop y mobile)
- ✅ Botón de acceso con ícono de historial en cada factura de la tabla principal

**Cómo acceder:**
1. En la tabla principal de "Cuentas por Cobrar"
2. Localizar la factura que deseas consultar
3. Hacer clic en el botón de historial (⏱️) en la columna "Acciones"
4. Se abre el diálogo con el historial de esa factura específica

## 📁 Archivos Creados/Modificados

### Nuevos Archivos:
1. **`app/api/clientes/[clienteId]/abonos/route.ts`**
   - Endpoint API para obtener el historial general de un cliente
   - Consulta SQL optimizada con JOIN a todas las tablas necesarias
   - Incluye cálculo de resumen (total abonado, cantidad, saldo)

### Archivos Modificados:
1. **`components/clientes-content.tsx`**
   - Agregado estado `historialClienteDialogOpen` para el nuevo diálogo
   - Agregado estado `historialResumen` para datos del resumen
   - Función `loadHistorialCliente()` para cargar datos del API
   - Función `handleOpenHistorialCliente()` para abrir el diálogo
   - Nuevo diálogo completo con diseño responsive
   - Botón de historial en la búsqueda de clientes
   - Mejoras en el diálogo de historial individual de factura

## 🔄 Flujo de Trabajo

### Historial General del Cliente:
```
Usuario busca cliente
  ↓
Click en ícono History
  ↓
API: GET /api/clientes/{id}/abonos
  ↓
Consulta: Todos los abonos + resumen
  ↓
Muestra diálogo con:
  - Tarjeta de resumen (3 columnas)
  - Tabla de abonos (desktop)
  - Cards de abonos (mobile)
```

### Historial Individual de Factura:
```
Usuario ve tabla de facturas
  ↓
Click en botón History de una factura
  ↓
API: GET /api/cuentas-por-cobrar/{id}/abonos
  ↓
Consulta: Abonos de esa factura
  ↓
Muestra diálogo con:
  - Info de la factura
  - Tabla de abonos
```

## 💾 Consulta SQL (Historial General)

```sql
SELECT 
  a.id,
  a.monto,
  a.fecha_abono as fecha,
  a.metodo_pago as metodoPago,
  a.referencia_transferencia as referencia,
  a.notas,
  v.numero_venta,
  cpc.monto_total as monto_factura,
  cpc.saldo_pendiente as saldo_actual_factura,
  u.nombre as usuario
FROM abonos a
INNER JOIN cuentas_por_cobrar cpc ON a.cuenta_por_cobrar_id = cpc.id
INNER JOIN ventas v ON cpc.venta_id = v.id
LEFT JOIN usuarios u ON a.usuario_id = u.id
WHERE cpc.cliente_id = ?
ORDER BY a.fecha_abono DESC
```

## 🎨 Diseño UI

### Historial General:
- **Desktop**: Tabla con 7 columnas (Fecha, Factura, Monto, Método, Referencia, Notas, Usuario)
- **Mobile**: Cards con toda la información organizada
- **Resumen**: Card superior con 3 métricas destacadas

### Historial Individual:
- **Desktop**: Tabla con 6 columnas (Fecha, Factura, Monto, Método, Referencia, Usuario)
- **Mobile**: Cards compactos
- **Encabezado**: Información completa de la factura

## 🔧 Componentes UI Utilizados

- `Dialog` - Ventanas modales
- `Table` - Tablas de datos (desktop)
- `Card` - Tarjetas (mobile + resumen)
- `Badge` - Etiquetas para facturas y métodos
- `ScrollArea` - Área scrolleable
- `Button` - Botones de acción
- Iconos: `History` de lucide-react

## ✅ Testing Recomendado

1. **Historial General:**
   - [ ] Abrir historial de cliente con múltiples abonos
   - [ ] Verificar que muestra todos los abonos
   - [ ] Verificar resumen (totales correctos)
   - [ ] Probar en mobile y desktop
   - [ ] Verificar cliente sin abonos

2. **Historial Individual:**
   - [ ] Abrir historial de factura con abonos
   - [ ] Verificar que solo muestra abonos de esa factura
   - [ ] Verificar información en encabezado
   - [ ] Probar en mobile y desktop
   - [ ] Verificar factura sin abonos

## 📝 Notas Importantes

- Los historiales se cargan en tiempo real desde la base de datos
- Los abonos se ordenan por fecha descendente (más recientes primero)
- Se incluye toda la información relevante para auditoría
- El diseño es completamente responsive
- Los diálogos son independientes y pueden coexistir
- Permisos requeridos: `clientes.ver`

## 🚀 Próximos Pasos Sugeridos

1. Agregar filtros por fecha en ambos historiales
2. Opción de exportar historial a PDF/Excel
3. Gráficos de evolución de abonos
4. Filtro por método de pago
5. Búsqueda dentro del historial
