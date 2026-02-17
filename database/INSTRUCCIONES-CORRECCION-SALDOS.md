# Instrucciones para Corregir Saldos Negativos en Base de Datos

## Archivos Disponibles

### 1. `fix-saldos-negativos.sql` (Recomendado)
**Archivo completo con verificaciones antes y después**

✅ Incluye consultas de verificación
✅ Muestra el estado antes y después
✅ Valida que todo quedó correcto
✅ Ideal para ejecutar por primera vez

### 2. `fix-saldos-negativos-simple.sql`
**Versión rápida solo con las correcciones**

⚡ Solo ejecuta los UPDATE necesarios
⚡ Sin consultas de verificación
⚡ Ideal para re-ejecución o producción

## Cómo Ejecutar en DBeaver

1. Abrir DBeaver y conectar a tu base de datos
2. Hacer clic derecho en tu conexión → `SQL Editor` → `New SQL Script`
3. Abrir el archivo SQL que quieras usar:
   - `database/fix-saldos-negativos.sql` (completo) o
   - `database/fix-saldos-negativos-simple.sql` (rápido)
4. Copiar todo el contenido del archivo y pegarlo en el editor SQL
5. Hacer clic en el botón de ejecutar (▶️) o presionar `Ctrl+Enter`
6. Revisar los resultados en la pestaña de resultados

## Cómo Ejecutar en MySQL Workbench

1. Abrir MySQL Workbench y conectar a tu servidor
2. Ir a `File` → `Open SQL Script`
3. Seleccionar el archivo:
   - `database/fix-saldos-negativos.sql` (completo) o
   - `database/fix-saldos-negativos-simple.sql` (rápido)
4. Seleccionar tu base de datos en el dropdown superior
5. Hacer clic en el botón de rayo (⚡) para ejecutar todo el script
6. Revisar los resultados en la parte inferior

## Cómo Ejecutar desde Terminal MySQL

```bash
# Opción 1: Archivo completo con verificaciones
mysql -u tu_usuario -p tu_base_de_datos < database/fix-saldos-negativos.sql

# Opción 2: Versión rápida
mysql -u tu_usuario -p tu_base_de_datos < database/fix-saldos-negativos-simple.sql
```

## Qué hace el script

### 1️⃣ **Corrige saldos negativos**
Convierte todos los saldos negativos en `cuentas_por_cobrar` a positivos:
```sql
UPDATE cuentas_por_cobrar
SET saldo_pendiente = ABS(saldo_pendiente)
WHERE saldo_pendiente < 0;
```

### 2️⃣ **Actualiza estados**
Cambia a 'pendiente' las facturas que ahora tienen saldo > 0:
```sql
UPDATE cuentas_por_cobrar
SET estado = 'pendiente'
WHERE saldo_pendiente > 0 AND estado = 'pagada';
```

### 3️⃣ **Recalcula saldos de clientes**
Actualiza el saldo de cada cliente sumando sus facturas:
```sql
UPDATE clientes c
SET saldo_pendiente = (
    SELECT COALESCE(SUM(cpc.saldo_pendiente), 0)
    FROM cuentas_por_cobrar cpc
    WHERE cpc.cliente_id = c.id
)
WHERE c.estado = 'activo';
```

## Resultado Esperado

Después de ejecutar el script, deberías ver:

✅ **0 facturas con saldo negativo**
✅ **oscar (000000000): 3 facturas pendientes**
✅ **oscar (21845454): 2 facturas pendientes**
✅ **Todos los saldos coinciden**

## Verificación Manual

Puedes verificar manualmente con esta consulta:

```sql
-- Ver clientes oscar después de la corrección
SELECT 
    c.nombre,
    c.identificacion,
    c.saldo_pendiente as saldo_cliente,
    COUNT(cpc.id) as total_facturas,
    COUNT(CASE WHEN cpc.saldo_pendiente > 0 THEN 1 END) as facturas_pendientes,
    SUM(cpc.saldo_pendiente) as suma_saldos_facturas
FROM clientes c
LEFT JOIN cuentas_por_cobrar cpc ON c.id = cpc.cliente_id
WHERE LOWER(c.nombre) LIKE '%oscar%'
GROUP BY c.id, c.nombre, c.identificacion, c.saldo_pendiente;
```

## ⚠️ IMPORTANTE

- ✅ El script es seguro de ejecutar múltiples veces
- ✅ Solo modifica facturas con saldo negativo
- ✅ Hace un backup manual antes si estás inseguro
- ✅ Ya fue probado con el script Node.js exitosamente

## Soporte

Si tienes problemas al ejecutar el script, verifica:
- Que tengas permisos de UPDATE en la base de datos
- Que estés conectado a la base de datos correcta
- Que las tablas `clientes`, `cuentas_por_cobrar` y `ventas` existan
