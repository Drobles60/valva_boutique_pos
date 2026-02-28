# Sistema de Pagos y Créditos - Actualización

## 📋 Descripción

Esta actualización agrega las siguientes funcionalidades al sistema de ventas:

### ✨ Nuevas Funcionalidades

#### 1. **Venta de Contado con Cálculo de Cambio**
   - Métodos de pago: Efectivo, Transferencia, Tarjeta, **Mixto**
   - Al finalizar la venta, se abre un diálogo para:
     - Ingresar el monto recibido del cliente
     - Calcular automáticamente el cambio a devolver
     - Para pago mixto: registrar montos en efectivo y transferencia por separado
   - Validación: no permite confirmar si el monto recibido es menor al total

#### 2. **Venta a Crédito con Registro de Cliente**
   - Al finalizar una venta a crédito, se abre un diálogo para:
     - Seleccionar un cliente existente O registrar uno nuevo
     - Opción de realizar un **abono inicial** (opcional)
     - El abono puede ser en efectivo, transferencia o mixto
     - El saldo pendiente se actualiza automáticamente
   - Los datos del nuevo cliente incluyen:
     - Nombre completo (requerido)
     - Teléfono (requerido)
     - Cédula/RUC
     - Email
     - Dirección
     - Tipo de cliente (público/mayorista/especial)

#### 3. **Sistema de Pagos Mixtos**
   - Permite combinar efectivo + transferencia en una misma transacción
   - Se registra el desglose detallado en tablas específicas
   - Aplica tanto para ventas de contado como para abonos a crédito

#### 4. **Mejoras en el Sistema de Cuentas por Cobrar**
   - Registro automático de abonos iniciales
   - Actualización automática de saldos pendientes
   - Triggers que mantienen sincronizados los saldos de clientes

---

## 🗄️ Cambios en la Base de Datos

### Nuevas Columnas

#### Tabla `ventas`:
- `efectivo_recibido` (DECIMAL 10,2): Monto recibido del cliente
- `cambio` (DECIMAL 10,2): Cambio devuelto al cliente
- `metodo_pago`: Ahora incluye opción 'mixto'

#### Tabla `abonos`:
- `metodo_pago`: Ahora incluye opción 'mixto'

### Nuevas Tablas

#### `pagos_mixtos_ventas`:
```sql
- id (PRIMARY KEY)
- venta_id (FOREIGN KEY)
- monto_efectivo
- monto_transferencia
- monto_tarjeta (opcional, para futuro uso)
- created_at
```

#### `pagos_mixtos_abonos`:
```sql
- id (PRIMARY KEY)
- abono_id (FOREIGN KEY)
- monto_efectivo
- monto_transferencia
- monto_tarjeta (opcional, para futuro uso)
- created_at
```

### Nuevos Triggers
- `actualizar_saldo_cliente_abono`: Actualiza automáticamente los saldos cuando se registra un abono

---

## 🚀 Instrucciones de Instalación

### Opción 1: Usando el Script Automático (Recomendado)

1. **Ejecutar el script de actualización:**
   ```bash
   node scripts/actualizar-sistema-pagos.js
   ```

2. El script:
   - ✅ Conecta a la base de datos
   - ✅ Aplica todas las modificaciones necesarias
   - ✅ Verifica que los cambios se aplicaron correctamente
   - ✅ Muestra un resumen detallado

3. **Reiniciar la aplicación:**
   ```bash
   # Detener el servidor si está corriendo (Ctrl+C)
   # Luego reiniciar
   pnpm dev
   ```

### Opción 2: Ejecutar SQL Manualmente

1. **Ejecutar el script principal:**
   
   Abrir el archivo: `database/update-sistema-pagos-creditos.sql`

   Ejecutar en tu cliente MySQL favorito o desde la línea de comandos:
   ```bash
   mysql -u root -p valva_boutique < database/update-sistema-pagos-creditos.sql
   ```

2. **Ejecutar el trigger por separado (IMPORTANTE):**
   
   El trigger **NO** se incluye en el script principal porque algunos clientes MySQL tienen problemas con el comando `DELIMITER`.
   
   **Opción A - PowerShell (MÁS FÁCIL, RECOMENDADO):**
   ```powershell
   .\database\ejecutar-trigger.ps1
   ```
   
   **Opción B - Si usas DBeaver:** 
   Abre `database/trigger-saldo-cliente-dbeaver.sql` y sigue las instrucciones
   
   **Opción C - Línea de comandos:**
   ```bash
   mysql -u root -p valva_boutique < database/trigger-saldo-cliente.sql
   ```

---

## 🧪 Cómo Probar las Nuevas Funcionalidades

### Probar Venta de Contado con Cambio:

1. Ir a **Ventas** (POS)
2. Agregar productos al carrito
3. Seleccionar **Tipo de Venta: Contado**
4. Seleccionar método de pago:
   - **Efectivo**: Ingresar el monto que da el cliente
   - **Transferencia**: Solo confirmar
   - **Mixto**: Ingresar montos en efectivo y transferencia
5. Clic en **Finalizar Venta**
6. Se abre el diálogo de cálculo de cambio
7. Confirmar la venta

### Probar Venta a Crédito con Abono:

1. Ir a **Ventas** (POS)
2. Agregar productos al carrito
3. Seleccionar **Tipo de Venta: Crédito**
4. Clic en **Finalizar Venta**
5. Se abre el diálogo de crédito:
   - **Pestaña "Cliente Existente"**: Seleccionar de la lista
   - **Pestaña "Nuevo Cliente"**: Llenar el formulario
6. (Opcional) Ingresar un **Abono Inicial**:
   - Seleccionar método de pago
   - Para mixto: ingresar montos por separado
7. Ver el **Saldo Pendiente** actualizado
8. Confirmar la venta a crédito

### Verificar Registros:

1. **Ver la factura generada** con todos los datos
2. **Ir a Clientes** y verificar:
   - El nuevo cliente se registró (si lo creaste)
   - El saldo pendiente se actualizó
3. **Revisar en la base de datos**:
   ```sql
   -- Ver ventas con cambio
   SELECT numero_venta, total, efectivo_recibido, cambio, metodo_pago
   FROM ventas
   WHERE efectivo_recibido IS NOT NULL;

   -- Ver pagos mixtos en ventas
   SELECT v.numero_venta, pm.monto_efectivo, pm.monto_transferencia
   FROM ventas v
   JOIN pagos_mixtos_ventas pm ON v.id = pm.venta_id;

   -- Ver cuentas por cobrar con abonos
   SELECT 
     c.nombre,
     cpc.monto_total,
     cpc.saldo_pendiente,
     COUNT(a.id) as num_abonos
   FROM cuentas_por_cobrar cpc
   JOIN clientes c ON cpc.cliente_id = c.id
   LEFT JOIN abonos a ON a.cuenta_por_cobrar_id = cpc.id
   GROUP BY cpc.id;
   ```

---

## 📝 Notas Importantes

### ⚠️ Antes de Ejecutar
- **Hacer backup de la base de datos** antes de aplicar cualquier cambio
- Verificar que no hay ventas en proceso

### ✅ Después de Aplicar
- Las ventas anteriores NO se ven afectadas
- Las nuevas columnas tendrán valores NULL para registros antiguos (esto es normal)
- Los nuevos registros sí tendrán todos los datos correctos

### 🔄 Actualizar el Schema (Solo cuando lo solicites)
**NO ejecutar hasta que lo pidas explícitamente**. Una vez que hayas aplicado los cambios y verificado que todo funciona bien, me puedes pedir que actualice el archivo `schema.sql` para reflejar la nueva estructura.

---

## 🐛 Solución de Problemas

### Error: "ER_DUP_FIELDNAME"
- **Causa**: La columna ya existe
- **Solución**: Esto es normal, el script omite este error automáticamente

### Error: "ER_NO_SUCH_TABLE"
- **Causa**: Tabla no existe
- **Solución**: Verificar que estás usando la base de datos correcta

### Error: "Access denied"
- **Causa**: Permisos insuficientes
- **Solución**: Usar un usuario con permisos de ALTER TABLE y CREATE TABLE

### El diálogo no se abre al finalizar venta
- **Verificar**: Que reiniciaste la aplicación después de los cambios
- **Verificar**: Consola del navegador para ver errores
- **Verificar**: Que los componentes estén importados correctamente

---

## 📞 Soporte

Si encuentras algún problema o tienes dudas sobre la implementación, házmelo saber para ayudarte a resolverlo.

---

## 📊 Resumen de Archivos Modificados/Creados

### Nuevos Componentes:
- ✅ `components/cambio-dialog.tsx` - Diálogo de cálculo de cambio
- ✅ `components/credito-dialog.tsx` - Diálogo de registro de cliente y abono

### Archivos Modificados:
- ✅ `components/ventas-content.tsx` - Integración de nuevos diálogos
- ✅ `app/api/ventas/route.ts` - Soporte para nuevos campos y lógica

### Scripts SQL:
- ✅ `database/update-sistema-pagos-creditos.sql` - Script de actualización
- ✅ `scripts/actualizar-sistema-pagos.js` - Script Node.js para aplicar cambios

---

**¡Todo listo para usar el nuevo sistema de pagos y créditos! 🎉**
