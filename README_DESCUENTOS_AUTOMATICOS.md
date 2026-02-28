# Sistema Automático de Desactivación de Descuentos Vencidos

## 📋 Descripción

El sistema ahora desactiva automáticamente los descuentos cuya fecha de fin (`fecha_fin`) ha pasado, cambiando su estado de `activo` a `inactivo`.

---

## ✅ Implementación Actual

### 1. **Verificación en API** (Automática) ✨ RECOMENDADO

La forma más confiable y que ya está funcionando:

- **Cuándo:** Cada vez que se consultan descuentos o productos
- **Dónde:** 
  - `app/api/descuentos/route.ts` (GET)
  - `lib/descuentos.ts` (getDescuentosForProduct)
- **Ventaja:** No requiere configuración adicional, funciona siempre que la aplicación esté en uso
- **Desventaja:** Solo se actualiza cuando hay consultas

**Ya implementado y funcionando** ✅

---

## 🔧 Opciones Adicionales (Opcional)

### 2. **Evento de MySQL** (Automático en Base de Datos)

Un evento que se ejecuta automáticamente cada día a medianoche.

#### Instalación:
```sql
-- En DBeaver o MySQL Workbench, ejecutar:
SOURCE database/evento-desactivar-descuentos-vencidos.sql
```

O copiar y pegar el contenido del archivo.

#### Verificar que está activo:
```sql
SHOW EVENTS WHERE Name = 'desactivar_descuentos_vencidos';
SHOW VARIABLES LIKE 'event_scheduler';
```

#### Ventajas:
- ✅ Se ejecuta automáticamente en el servidor de base de datos
- ✅ No depende de que la aplicación esté corriendo
- ✅ Precisión horaria (medianoche todos los días)

#### Desventajas:
- ⚠️ Requiere que `event_scheduler` esté habilitado en MySQL
- ⚠️ No todos los hosting permiten eventos

---

### 3. **Script Manual/Programado** (Tarea del Sistema)

Script Node.js que puedes ejecutar manualmente o programar con el sistema operativo.

#### Uso Manual:
```bash
node scripts/desactivar-descuentos-vencidos.js
```

#### Programar con Task Scheduler (Windows):

1. Abrir "Programador de tareas"
2. Crear tarea básica:
   - **Nombre:** Desactivar Descuentos Vencidos
   - **Desencadenador:** Diariamente a las 00:00
   - **Acción:** Iniciar programa
   - **Programa:** `node`
   - **Argumentos:** `"D:\Documents\NOD\valva_boutique_pos\scripts\desactivar-descuentos-vencidos.js"`
   - **Directorio:** `D:\Documents\NOD\valva_boutique_pos`

#### Programar con Cron (Linux/Mac):
```bash
# Editar crontab
crontab -e

# Agregar línea (ejecutar diariamente a medianoche)
0 0 * * * cd /ruta/al/proyecto && node scripts/desactivar-descuentos-vencidos.js
```

#### Ventajas:
- ✅ Control total sobre cuándo se ejecuta
- ✅ Genera logs detallados
- ✅ Funciona en cualquier sistema operativo

#### Desventajas:
- ⚠️ Requiere configuración del sistema operativo
- ⚠️ La computadora debe estar encendida a la hora programada

---

## 🎯 Recomendación

### Para tu caso (desarrollo local):

**Usar la Opción 1 (Verificación en API)** - Ya está funcionando ✅

La verificación automática en la API es suficiente porque:
- Se ejecuta cada vez que consultas productos o descuentos
- No requiere configuración adicional
- Es la más confiable para desarrollo

### Para producción:

**Combinar Opción 1 + Opción 2** (API + Evento MySQL)

- La API maneja la verificación en tiempo real
- El evento de MySQL mantiene la base de datos limpia incluso sin consultas

---

## 🧪 Cómo Probar

### Probar que funciona:

1. **Crear descuento de prueba:**
   ```sql
   INSERT INTO descuentos (nombre, descripcion, tipo, valor, fecha_inicio, fecha_fin, estado, aplicable_a)
   VALUES ('TEST VENCIDO', 'Prueba de descuento vencido', 'porcentaje', 10, '2026-02-01', '2026-02-12', 'activo', 'productos');
   ```

2. **Verificar el descuento:**
   ```sql
   SELECT id, nombre, estado, fecha_fin FROM descuentos WHERE nombre = 'TEST VENCIDO';
   ```

3. **Consultar productos o descuentos en la aplicación**
   - O ejecutar: `node scripts/desactivar-descuentos-vencidos.js`

4. **Verificar que cambió a inactivo:**
   ```sql
   SELECT id, nombre, estado, fecha_fin FROM descuentos WHERE nombre = 'TEST VENCIDO';
   -- Debe mostrar estado = 'inactivo'
   ```

5. **Limpiar:**
   ```sql
   DELETE FROM descuentos WHERE nombre = 'TEST VENCIDO';
   ```

---

## 📝 Notas Importantes

- ✅ Los descuentos sin `fecha_fin` (NULL) permanecen activos indefinidamente
- ✅ Los descuentos se comparan con la fecha actual del servidor
- ✅ Solo se desactivan si `estado = 'activo'`, no se modifican los que ya están inactivos
- ✅ La desactivación NO elimina el descuento, solo cambia su estado
- ✅ Puedes reactivar manualmente un descuento si lo necesitas

---

## 🔍 Consultas Útiles

```sql
-- Ver descuentos vencidos pero aún activos
SELECT id, nombre, fecha_fin, estado 
FROM descuentos 
WHERE fecha_fin < CURDATE() AND estado = 'activo';

-- Ver descuentos activos con fecha de vencimiento próxima
SELECT id, nombre, fecha_fin, DATEDIFF(fecha_fin, CURDATE()) as dias_restantes
FROM descuentos 
WHERE estado = 'activo' 
  AND fecha_fin IS NOT NULL 
  AND fecha_fin >= CURDATE()
ORDER BY fecha_fin ASC;

-- Estadísticas de descuentos
SELECT 
  estado,
  COUNT(*) as cantidad,
  COUNT(CASE WHEN fecha_fin IS NOT NULL AND fecha_fin < CURDATE() THEN 1 END) as vencidos
FROM descuentos
GROUP BY estado;
```

---

## ✅ Resumen

Con la implementación actual, los descuentos vencidos se desactivan automáticamente cuando:

1. ✅ Se consultan los descuentos (GET /api/descuentos)
2. ✅ Se obtienen productos con sus descuentos (GET /api/productos)
3. ✅ Se calcula el precio de un producto específico

**No necesitas hacer nada adicional**, el sistema ya está funcionando correctamente. Las opciones 2 y 3 son complementarias para casos especiales.
