# Módulo de Gastos - Sistema POS Valva Boutique

## Descripción
El módulo de gastos permite registrar, controlar y gestionar todos los gastos operativos del negocio, facilitando el seguimiento de las salidas de dinero y mejorando el control financiero.

## Características Principales

### 1. Registro de Gastos
- **Categorías predefinidas**:
  - Servicios (luz, agua, internet)
  - Arriendo/Alquiler
  - Transporte/Domicilios
  - Compras y Suministros
  - Nómina/Salarios
  - Publicidad y Marketing
  - Mantenimiento
  - Impuestos
  - Servicios Profesionales
  - Otros

### 2. Información del Gasto
Cada gasto registra:
- Categoría del gasto
- Descripción detallada
- Monto del gasto
- Fecha en que se realizó
- Método de pago (Efectivo, Transferencia, Tarjeta, Cheque)
- Referencia (número de factura o comprobante)
- Notas u observaciones adicionales
- Usuario que registró el gasto

### 3. Funcionalidades

#### Crear Nuevo Gasto
1. Clic en "Nuevo Gasto"
2. Seleccionar categoría
3. Ingresar descripción
4. Especificar monto
5. Seleccionar fecha del gasto
6. Elegir método de pago
7. (Opcional) Agregar referencia y notas
8. Guardar

#### Editar Gasto
- Clic en el ícono de editar en cualquier gasto
- Modificar los campos necesarios
- Guardar cambios

#### Eliminar Gasto
- Clic en el ícono de eliminar
- Confirmar la acción
- El gasto se elimina permanentemente

#### Búsqueda y Filtros
- **Búsqueda por texto**: Descripción, categoría, referencia, método de pago
- **Filtro por fechas**: Seleccionar rango de fechas específico
- **Sin tildes**: Las búsquedas ignoran tildes y mayúsculas

### 4. Estadísticas
El módulo muestra tarjetas con:
- **Total de Gastos**: Suma total de todos los gastos
- **Gastos en Efectivo**: Total pagado en efectivo
- **Gastos por Transferencia**: Total pagado por transferencia
- **Promedio por Gasto**: Promedio del monto de gastos

## Instalación

### 1. Crear la Tabla en la Base de Datos

Ejecuta el archivo SQL en DBeaver o MySQL Workbench:

```bash
database/crear-tabla-gastos.sql
```

O ejecuta directamente este SQL:

```sql
USE valva_boutique_pos;

CREATE TABLE IF NOT EXISTS gastos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria ENUM(
    'servicios',
    'arriendo',
    'transporte',
    'compras_suministros',
    'nomina',
    'publicidad',
    'mantenimiento',
    'impuestos',
    'servicios_profesionales',
    'otros'
  ) NOT NULL COMMENT 'Categoría del gasto',
  descripcion VARCHAR(255) NOT NULL COMMENT 'Descripción breve del gasto',
  monto DECIMAL(10,2) NOT NULL COMMENT 'Valor del gasto',
  fecha_gasto DATE NOT NULL COMMENT 'Fecha en que se realizó el gasto',
  metodo_pago ENUM('efectivo', 'transferencia', 'tarjeta') DEFAULT 'efectivo',
  referencia VARCHAR(100) COMMENT 'Número de factura, comprobante o referencia',
  notas TEXT COMMENT 'Observaciones adicionales',
  usuario_id INT UNSIGNED COMMENT 'Usuario que registró el gasto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  INDEX idx_fecha_gasto (fecha_gasto),
  INDEX idx_categoria (categoria),
  INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Verificar la Instalación

```sql
-- Verificar que la tabla existe
SHOW TABLES LIKE 'gastos';

-- Ver estructura de la tabla
DESCRIBE gastos;

-- Verificar que no hay registros duplicados
SELECT COUNT(*) FROM gastos;
```

## Acceso y Permisos

### Permisos Requeridos
- `gastos.ver`: Ver listado de gastos
- `gastos.crear`: Crear nuevos gastos
- `gastos.editar`: Modificar gastos existentes
- `gastos.eliminar`: Eliminar gastos

### Roles con Acceso
- **Administrador**: Acceso completo (crear, ver, editar, eliminar)
- **Vendedor**: Sin acceso por defecto

## API Endpoints

### GET /api/gastos
Obtener todos los gastos con filtros opcionales

**Query Parameters:**
- `fechaInicio`: Fecha inicio para filtrar (formato: YYYY-MM-DD)
- `fechaFin`: Fecha fin para filtrar (formato: YYYY-MM-DD)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoria": "servicios",
      "descripcion": "Pago servicio de luz",
      "monto": 50000,
      "fecha_gasto": "2026-02-15",
      "metodo_pago": "transferencia",
      "referencia": "FAC-001",
      "notas": "Mes de febrero",
      "usuario_id": 1,
      "usuario_nombre": "Admin",
      "created_at": "2026-02-15T10:00:00Z",
      "updated_at": "2026-02-15T10:00:00Z"
    }
  ]
}
```

### POST /api/gastos
Crear un nuevo gasto

**Body:**
```json
{
  "categoria": "servicios",
  "descripcion": "Pago servicio de luz",
  "monto": 50000,
  "fecha_gasto": "2026-02-15",
  "metodo_pago": "transferencia",
  "referencia": "FAC-001",
  "notas": "Mes de febrero"
}
```

### GET /api/gastos/[id]
Obtener un gasto específico

### PUT /api/gastos/[id]
Actualizar un gasto existente

### DELETE /api/gastos/[id]
Eliminar un gasto

## Ejemplos de Uso

### Ejemplo 1: Pago de Servicios
```
Categoría: Servicios
Descripción: Pago servicio de internet mes de febrero
Monto: 45.000
Fecha: 2026-02-01
Método: Transferencia
Referencia: FAC-INT-202602
```

### Ejemplo 2: Arriendo
```
Categoría: Arriendo
Descripción: Arriendo local comercial febrero 2026
Monto: 800.000
Fecha: 2026-02-05
Método: Transferencia
Referencia: RECIBO-0215
```

### Ejemplo 3: Transporte
```
Categoría: Transporte
Descripción: Domicilio de productos a cliente
Monto: 8.000
Fecha: 2026-02-17
Método: Efectivo
Referencia: -
```

## Consejos de Uso

1. **Registra inmediatamente**: Registra los gastos apenas ocurren para no olvidarlos
2. **Sé específico**: Usa descripciones claras y específicas
3. **Guarda comprobantes**: Usa el campo "Referencia" para el número de factura
4. **Usa notas**: Agrega detalles adicionales que puedan ser útiles después
5. **Revisa periódicamente**: Usa los filtros de fecha para revisar gastos mensuales
6. **Categoriza correctamente**: Usa la categoría correcta para facilitar reportes

## Mantenimiento

### Respaldo de Datos
```sql
-- Exportar gastos
SELECT * FROM gastos 
INTO OUTFILE '/ruta/gastos_backup.csv'
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

### Consultas Útiles

```sql
-- Gastos del mes actual
SELECT * FROM gastos 
WHERE MONTH(fecha_gasto) = MONTH(CURRENT_DATE())
AND YEAR(fecha_gasto) = YEAR(CURRENT_DATE());

-- Total de gastos por categoría
SELECT 
  categoria,
  COUNT(*) as cantidad,
  SUM(monto) as total
FROM gastos
GROUP BY categoria
ORDER BY total DESC;

-- Gastos por método de pago
SELECT 
  metodo_pago,
  COUNT(*) as cantidad,
  SUM(monto) as total
FROM gastos
GROUP BY metodo_pago;

-- Top 10 gastos más altos
SELECT * FROM gastos
ORDER BY monto DESC
LIMIT 10;
```

## Soporte

Para reportar problemas o sugerencias sobre el módulo de gastos, contacta al administrador del sistema.
