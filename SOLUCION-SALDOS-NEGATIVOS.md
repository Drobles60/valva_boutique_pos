# Corrección de Saldos Negativos y Conteo de Facturas Pendientes

## Problema Identificado

1. **Saldos negativos en la base de datos**: Había 5 facturas con saldos negativos registradas incorrectamente:
   - VEN-20260206-0007 (juan perez): -$50.000
   - VEN-20260206-0010 (juan perez): -$50.000
   - VEN-20260206-0011 (juan perez): -$50.000
   - VEN-20260206-0013 (oscar 21845454): -$50.000
   - VEN-20260214-0001 (oscar 000000000): -$65.000

2. **Conteo incorrecto de facturas pendientes**: 
   - El código usaba `Math.abs()` para contar facturas, lo que convertía los saldos negativos en positivos y los contaba incorrectamente
   - Las facturas con saldo negativo se mostraban como pendientes cuando en realidad eran errores de registro

## Solución Implementada

### 1. Corrección de Base de Datos (scripts/fix-saldos-negativos.js)

✅ **Ejecutado exitosamente**

- Identificó 5 facturas con saldo negativo
- Convirtió los saldos negativos a positivos usando `ABS(saldo_pendiente)`
- Actualizó el estado de 7 facturas de 'pagada' a 'pendiente' (las que ahora tienen saldo pendiente real)
- Recalculó los saldos de todos los clientes activos

**Resultado:**
- oscar (000000000): ahora tiene **3 facturas pendientes** (antes mostraba 1)
- oscar (21845454): ahora tiene **2 facturas pendientes** (antes mostraba 1)

### 2. Corrección del Código Frontend (components/clientes-content.tsx)

#### Cambios en el filtrado y conteo:
- ✅ Eliminado `Math.abs()` en el conteo de facturas pendientes
- ✅ Cambiado de `c.saldo_pendiente > 0` a verificación sin valor absoluto
- ✅ Filtros actualizados para contar solo facturas con saldo positivo real

#### Cambios en la visualización de facturas:
- ✅ Eliminada la conversión a valor absoluto al mostrar saldos
- ✅ Agregada detección de saldos negativos para mostrarlos en azul con prefijo "-"
- ✅ Actualizado el cálculo de estado real basado en `saldo_pendiente > 0`

#### Cambios en los diálogos de abono:
- ✅ Eliminado `Math.abs()` en validaciones de monto
- ✅ Eliminado `Math.abs()` en placeholders y mensajes
- ✅ Eliminado `Math.abs()` en cálculos de nuevo saldo
- ✅ Eliminado `Math.abs()` en la búsqueda de clientes

### 3. Corrección del API (app/api/clientes/cuentas-por-cobrar/route.ts)

- ✅ Actualizada la consulta SQL para contar solo facturas con `saldo_pendiente > 0`
- ✅ Agregado modo debug para verificar facturas detalladas
- ✅ Corregido el JOIN con la tabla `ventas` para obtener `numero_venta`

## Archivos Creados para Diagnóstico

1. **database/fix-saldos-negativos.sql**: Script SQL para corrección manual
2. **scripts/fix-saldos-negativos.js**: Script Node.js con confirmación y reportes
3. **scripts/verificar-facturas-oscar.js**: Verificación detallada de facturas de oscar
4. **scripts/ver-todas-facturas-oscar.js**: Ver todas las facturas sin filtros
5. **scripts/verificar-conteo-corregido.js**: Validar el conteo correcto
6. **scripts/check-discrepancias.js**: Verificar discrepancias de saldos
7. **database/diagnostico-facturas-pendientes.sql**: Consultas de diagnóstico

## Estado Final

✅ **Todos los saldos corregidos**
✅ **Conteo de facturas pendientes correcto**
✅ **Interfaz muestra información precisa**

### Verificación Final:

```
oscar (000000000)
  Total facturas:        4
  Facturas pendientes:   3 ✅
  Suma saldos facturas:  $235.000
  Saldo en tabla:        $235.000
  ✅ Saldos coinciden

oscar (21845454)
  Total facturas:        2
  Facturas pendientes:   2 ✅
  Suma saldos facturas:  $180.000
  Saldo en tabla:        $180.000
  ✅ Saldos coinciden
```

## Notas Importantes

- Los saldos ahora son todos positivos en la base de datos
- El código ya no usa `Math.abs()` para contar o validar facturas pendientes
- Si en el futuro aparecen saldos negativos, se mostrarán en azul con el prefijo "-" indicando que son saldos a favor del cliente
- El sistema ahora distingue correctamente entre:
  - `saldo > 0`: Pendiente (cliente debe dinero)
  - `saldo = 0`: Pagada (factura saldada)
  - `saldo < 0`: Crédito a favor del cliente (se abonó más de lo debido)
