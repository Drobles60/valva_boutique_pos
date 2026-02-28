# Script para crear la base de datos usando MySQL
# Asegurate de cambiar la ruta de MySQL si esta en otro lugar

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

# Verificar si MySQL existe
if (-not (Test-Path $mysqlPath)) {
    Write-Host "ERROR: MySQL no encontrado en: $mysqlPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "OPCIONES:" -ForegroundColor Yellow
    Write-Host "   1. Abre MySQL Workbench y ejecuta manualmente los archivos:" -ForegroundColor Cyan
    Write-Host "      - database\schema.sql" -ForegroundColor White
    Write-Host "      - database\seed.sql" -ForegroundColor White
    Write-Host ""
    Write-Host "   2. O encuentra donde esta instalado MySQL y actualiza este script" -ForegroundColor Cyan
    Write-Host "      Rutas comunes:" -ForegroundColor White
    Write-Host "      - C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -ForegroundColor Gray
    Write-Host "      - C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" -ForegroundColor Gray
    Write-Host "      - C:\xampp\mysql\bin\mysql.exe" -ForegroundColor Gray
    Write-Host "      - C:\wamp64\bin\mysql\mysql8.0.X\bin\mysql.exe" -ForegroundColor Gray
    exit 1
}

Write-Host "Creando base de datos..." -ForegroundColor Cyan
Write-Host ""

# Pedir contrasena
$password = Read-Host "Ingresa la contrasena de MySQL (root)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Host "Ejecutando schema.sql..." -ForegroundColor Yellow

try {
    $schemaPath = Join-Path $PSScriptRoot "..\database\schema.sql"
    & $mysqlPath -u root "-p$plainPassword" -e "source $schemaPath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Esquema creado exitosamente" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "Ejecutando seed.sql..." -ForegroundColor Yellow
        
        $seedPath = Join-Path $PSScriptRoot "..\database\seed.sql"
        & $mysqlPath -u root "-p$plainPassword" -e "source $seedPath"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "OK: Datos iniciales insertados exitosamente" -ForegroundColor Green
            Write-Host ""
            Write-Host "EXITO: Base de datos creada correctamente!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Proximo paso:" -ForegroundColor Yellow
            Write-Host "   node scripts\create-admin.js" -ForegroundColor Cyan
        } else {
            Write-Host "ERROR: al insertar datos iniciales" -ForegroundColor Red
        }
    } else {
        Write-Host "ERROR: al crear el esquema" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}
