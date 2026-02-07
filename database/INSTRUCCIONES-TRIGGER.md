# 📋 Instrucciones para Ejecutar el Trigger (Paso a Paso)

El trigger está comentado en el archivo `update-sistema-pagos-creditos.sql` para evitar errores durante la ejecución automática. Aquí están las instrucciones para ejecutarlo **manualmente**:

---

## ✅ Opción 1: Usando DBeaver (RECOMENDADO)

**IMPORTANTE**: DBeaver NO usa DELIMITER. Usa el archivo especial para DBeaver.

### PASO 1: Abrir el archivo para DBeaver
Abre el archivo: `database/trigger-saldo-cliente-dbeaver.sql`

### PASO 2: Eliminar trigger existente
Selecciona SOLO esta línea y ejecuta (Ctrl+Enter):
```sql
DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono;
```

### PASO 3: Crear el trigger
Selecciona TODO el bloque (desde CREATE hasta END;) y ejecuta:
```sql
CREATE TRIGGER actualizar_saldo_cliente_abono
AFTER INSERT ON abonos
FOR EACH ROW
BEGIN
  DECLARE cliente_id_var INT UNSIGNED;
  
  SELECT cliente_id INTO cliente_id_var
  FROM cuentas_por_cobrar
  WHERE id = NEW.cuenta_por_cobrar_id;
  
  UPDATE cuentas_por_cobrar
  SET saldo_pendiente = saldo_pendiente - NEW.monto,
      estado = CASE 
        WHEN (saldo_pendiente - NEW.monto) <= 0 THEN 'pagada'
        ELSE estado
      END
  WHERE id = NEW.cuenta_por_cobrar_id;
  
  UPDATE clientes
  SET saldo_pendiente = saldo_pendiente - NEW.monto,
      saldo_actual = saldo_pendiente - NEW.monto
  WHERE id = cliente_id_var;
END;
```

### PASO 4: Verificar
```sql
SHOW TRIGGERS LIKE 'abonos';
```

---

## ✅ Opción 2: Usando MySQL Workbench o HeidiSQL

### PASO 1: Abrir el archivo
Abre: `database/ejecutar-trigger-paso-a-paso.sql`

### PASO 2: Ejecutar cada BLOQUE
Sigue las instrucciones del archivo, ejecutando cada bloque por separado

### PASO 3: Verificar que se creó
```sql
SHOW TRIGGERS LIKE 'abonos';
```

Deberías ver el trigger `actualizar_saldo_cliente_abono` en la lista.

---

## ✅ Opción 2: Desde Línea de Comandos (cmd o PowerShell)

Ejecuta el archivo que ya contiene el trigger formateado correctamente:

```bash
mysql -u root -p valva_boutique < database/trigger-saldo-cliente.sql
```

Te pedirá la contraseña de MySQL y luego ejecutará el trigger.

---

## ✅ Opción 3: Desde PowerShell (recomendado)

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Cambia 'root' por tu usuario de MySQL si es diferente
$password = Read-Host "Ingresa la contraseña de MySQL" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Get-Content "database\trigger-saldo-cliente.sql" | mysql -u root -p$plainPassword valva_boutique
```

---

## 🤔 ¿Es Obligatorio el Trigger?

**NO, es OPCIONAL.**

La API ya actualiza los saldos automáticamente cuando se registran abonos a través de la aplicación. El trigger solo es útil si:

1. Quieres hacer abonos directamente en la base de datos (sin usar la app)
2. Quieres tener redundancia en la actualización de saldos
3. Vas a integrar con otras aplicaciones que escriban directamente en la tabla `abonos`

---

## ✅ Verificación Final

Una vez creado el trigger, verifica que funciona:

```sql
-- Ver el trigger
SHOW CREATE TRIGGER actualizar_saldo_cliente_abono;

-- Ver todos los triggers de la tabla abonos
SHOW TRIGGERS WHERE `Table` = 'abonos';
```

---

## 🔧 Solución de Problemas

### Error: "DELIMITER command not supported"
- **Causa**: Estás usando un cliente que no soporta DELIMITER
- **Solución**: Usa la Opción 2 (línea de comandos) o el archivo `trigger-saldo-cliente.sql`

### Error: "Trigger already exists"
- **Causa**: Ya existe un trigger con ese nombre
- **Solución**: Ejecuta primero `DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono;`

### Error: "Access denied"
- **Causa**: Tu usuario no tiene permisos para crear triggers
- **Solución**: Usa el usuario `root` o un usuario con privilegio `TRIGGER`

---

**Listo para continuar con el resto de la configuración? Ejecuta el script principal:**

```bash
node scripts/actualizar-sistema-pagos.js
```
