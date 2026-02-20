# 📊 Sistema de Reportes Contables

Este documento describe el sistema completo de reportes contables implementado para Valva Boutique POS.

## 📁 Estructura del Sistema

```
/app/api/reportes/
├── financieros/          # Reportes contables y financieros
│   ├── estado-resultados/  # Estado de resultados (ingresos vs egresos)
│   ├── flujo-caja/         # Flujo de caja detallado
│   ├── ganancias/          # Análisis de utilidades
│   ├── gastos/             # Reporte de gastos
│   └── diario/             # Reporte diario de caja
├── ventas/               # Reportes de ventas
│   └── general/            # Reporte general de ventas
├── clientes/             # Reportes de clientes
│   ├── creditos/           # Cartera y créditos
│   └── estado-cuenta/      # Estado de cuenta por cliente
├── inventario/           # Reportes de inventario
│   ├── estado/             # Estado actual de inventario
│   └── movimientos/        # Movimientos de inventario
└── administrativos/      # Reportes administrativos
    └── diferencias/        # Diferencias de caja
```

## 📋 Reportes Disponibles

### 1. Reportes Financieros

#### 📊 Estado de Resultados
Muestra ingresos, egresos y utilidad del negocio.

**Endpoint:** `GET /api/reportes/financieros/estado-resultados`

**Parámetros:**
- `fechaInicio` (requerido): Fecha de inicio (YYYY-MM-DD)
- `fechaFin` (requerido): Fecha de fin (YYYY-MM-DD)

**Respuesta:**
```json
{
  "periodo": "2026-01-01 a 2026-01-31",
  "ingresos": {
    "ventasContado": 5000000,
    "abonosCredito": 1000000,
    "total": 6000000
  },
  "egresos": {
    "costoVentas": 3000000,
    "gastos": 500000,
    "total": 3500000
  },
  "utilidadBruta": 3000000,
  "utilidadNeta": 2500000,
  "margenUtilidad": 41.67
}
```

#### 💰 Flujo de Caja
Muestra todos los movimientos de dinero con saldo acumulado.

**Endpoint:** `GET /api/reportes/financieros/flujo-caja`

**Parámetros:**
- `fechaInicio` (requerido)
- `fechaFin` (requerido)

#### 📈 Ganancias
Análisis detallado de rentabilidad por producto.

**Endpoint:** `GET /api/reportes/financieros/ganancias`

#### 💸 Gastos
Análisis de gastos por categoría y período.

**Endpoint:** `GET /api/reportes/financieros/gastos`

#### 📅 Diario de Caja
Reporte detallado de una sesión de caja específica.

**Endpoint:** `GET /api/reportes/financieros/diario`

**Parámetros:**
- `fecha` (opcional): Fecha específica
- `sesionId` (opcional): ID de sesión específica

### 2. Reportes de Ventas

#### 🛒 Ventas Generales
Análisis completo de ventas del período.

**Endpoint:** `GET /api/reportes/ventas/general`

**Incluye:**
- Total de ventas y transacciones
- Ticket promedio
- Ventas por día
- Ventas por forma de pago
- Top 10 productos más vendidos

### 3. Reportes de Clientes

#### 💳 Cartera de Créditos
Resumen de cuentas por cobrar.

**Endpoint:** `GET /api/reportes/clientes/creditos`

**Parámetros:**
- `incluirPagadas` (opcional): true/false

**Muestra:**
- Total de cartera
- Créditos vigentes y vencidos
- Detalle por cliente con estado

#### 📄 Estado de Cuenta
Estado de cuenta detallado de un cliente.

**Endpoint:** `GET /api/reportes/clientes/estado-cuenta`

**Parámetros:**
- `clienteId` (requerido)
- `fechaInicio` (opcional)
- `fechaFin` (opcional)

### 4. Reportes de Inventario

#### 📦 Estado de Inventario
Inventario actual con valorización.

**Endpoint:** `GET /api/reportes/inventario/estado`

**Parámetros:**
- `categoriaId` (opcional)
- `bajoStock` (opcional): true/false
- `sinMovimiento` (opcional): true/false

**Muestra:**
- Valor total del inventario
- Productos bajo stock
- Productos sin movimiento (>90 días)

#### 🔄 Movimientos de Inventario
Historial de movimientos.

**Endpoint:** `GET /api/reportes/inventario/movimientos`

**Parámetros:**
- `fechaInicio` (requerido)
- `fechaFin` (requerido)
- `productoId` (opcional)
- `tipo` (opcional): entrada/salida/ajuste

### 5. Reportes Administrativos

#### ⚖️ Diferencias de Caja
Análisis de cuadre de caja.

**Endpoint:** `GET /api/reportes/administrativos/diferencias`

**Parámetros:**
- `fechaInicio` (requerido)
- `fechaFin` (requerido)

**Muestra:**
- Diferencias por sesión
- Faltantes y sobrantes
- Porcentaje de exactitud

## 🎯 Casos de Uso Contables

### Contabilidad Diaria
```javascript
// 1. Reporte diario de caja
GET /api/reportes/financieros/diario?fecha=2026-02-18

// 2. Ventas del día
GET /api/reportes/ventas/general?fechaInicio=2026-02-18&fechaFin=2026-02-18
```

### Cierre Mensual
```javascript
// 1. Estado de resultados del mes
GET /api/reportes/financieros/estado-resultados?fechaInicio=2026-02-01&fechaFin=2026-02-28

// 2. Análisis de ganancias
GET /api/reportes/financieros/ganancias?fechaInicio=2026-02-01&fechaFin=2026-02-28

// 3. Gastos del mes
GET /api/reportes/financieros/gastos?fechaInicio=2026-02-01&fechaFin=2026-02-28

// 4. Estado de cartera
GET /api/reportes/clientes/creditos
```

### Control de Inventario
```javascript
// 1. Estado actual
GET /api/reportes/inventario/estado

// 2. Productos bajo stock
GET /api/reportes/inventario/estado?bajoStock=true

// 3. Movimientos del mes
GET /api/reportes/inventario/movimientos?fechaInicio=2026-02-01&fechaFin=2026-02-28
```

### Auditoría
```javascript
// 1. Diferencias de caja del mes
GET /api/reportes/administrativos/diferencias?fechaInicio=2026-02-01&fechaFin=2026-02-28

// 2. Flujo de caja completo
GET /api/reportes/financieros/flujo-caja?fechaInicio=2026-02-01&fechaFin=2026-02-28
```

## 📊 Indicadores Clave (KPIs)

El sistema calcula automáticamente:

1. **Margen de Utilidad** = (Utilidad Neta / Ventas Totales) × 100
2. **Ticket Promedio** = Ventas Totales / Número de Transacciones
3. **Rotación de Inventario** = Costo de Ventas / Inventario Promedio
4. **Días Promedio de Cobranza** = Promedio de días desde vencimiento
5. **Porcentaje de Exactitud en Caja** = Sesiones exactas / Total sesiones × 100

## 🔐 Permisos

- **Administrador**: Acceso completo a todos los reportes incluyendo costos y utilidades
- **Vendedor**: Acceso limitado sin información de costos
- **Gerente**: Acceso completo excepto diferencias de caja

## 💡 Mejores Prácticas

1. **Generar reportes financieros** al final de cada día
2. **Revisar diferencias de caja** inmediatamente después del cierre
3. **Analizar productos sin movimiento** mensualmente
4. **Hacer seguimiento a créditos vencidos** semanalmente
5. **Revisar gastos por categoría** mensualmente para control de costos

## 🚀 Próximas Mejoras Sugeridas

- [ ] Exportación a PDF y Excel
- [ ] Gráficas interactivas
- [ ] Comparativos período actual vs anterior
- [ ] Proyecciones y tendencias
- [ ] Alertas automáticas
- [ ] Programación de reportes automáticos por email

## 📞 Soporte

Para más información o reportar problemas con los reportes, revisar la documentación del código o consultar con el equipo de desarrollo.
