# Script de PowerShell para ejecutar el trigger
# Ejecuta este archivo con: .\database\ejecutar-trigger.ps1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "CREAR TRIGGER DE SALDOS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar credenciales
$user = Read-Host "Usuario MySQL (default: root)"
if ([string]::IsNullOrWhiteSpace($user)) {
    $user = "root"
}

$password = Read-Host "Contraseña MySQL" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$database = Read-Host "Nombre de la base de datos (default: valva_boutique)"
if ([string]::IsNullOrWhiteSpace($database)) {
    $database = "valva_boutique"
}

Write-Host ""
Write-Host "Conectando a MySQL..." -ForegroundColor Yellow

# Script SQL en una sola línea para evitar problemas de delimitador
$sql = @"
DROP TRIGGER IF EXISTS actualizar_saldo_cliente_abono;
CREATE TRIGGER actualizar_saldo_cliente_abono AFTER INSERT ON abonos FOR EACH ROW BEGIN DECLARE cliente_id_var INT UNSIGNED; SELECT cliente_id INTO cliente_id_var FROM cuentas_por_cobrar WHERE id = NEW.cuenta_por_cobrar_id; UPDATE cuentas_por_cobrar SET saldo_pendiente = saldo_pendiente - NEW.monto, estado = CASE WHEN (saldo_pendiente - NEW.monto) <= 0 THEN 'pagada' ELSE estado END WHERE id = NEW.cuenta_por_cobrar_id; UPDATE clientes SET saldo_pendiente = saldo_pendiente - NEW.monto, saldo_actual = saldo_pendiente - NEW.monto WHERE id = cliente_id_var; END;
"@

try {
    # Ejecutar SQL
    $sql | mysql -u $user -p$plainPassword $database 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Trigger creado exitosamente!" -ForegroundColor Green
        Write-Host ""
        
        # Verificar
        Write-Host "Verificando trigger..." -ForegroundColor Yellow
        $verify = "SHOW TRIGGERS LIKE 'abonos';" | mysql -u $user -p$plainPassword $database 2>&1
        
        if ($verify -match "actualizar_saldo_cliente_abono") {
            Write-Host "✅ Verificación exitosa: El trigger está funcionando" -ForegroundColor Green
        } else {
            Write-Host "⚠️  No se pudo verificar el trigger" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Error al crear el trigger" -ForegroundColor Red
        Write-Host "Verifica las credenciales y que MySQL esté corriendo" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Presiona Enter para continuar..." -ForegroundColor Cyan
Read-Host
