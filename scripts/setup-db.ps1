# Script para configurar la base de datos
# Asegúrate de tener MySQL instalado y corriendo

Write-Host "=== Configuración de Base de Datos ===" -ForegroundColor Green
Write-Host ""

# Variables de conexión
$DB_HOST = "localhost"
$DB_USER = "root"
$DB_PASSWORD = "Luciana1510@"
$DB_NAME = "valva_boutique"

Write-Host "Conectando a MySQL..." -ForegroundColor Yellow

# Ejecutar schema.sql
Write-Host "Creando estructura de base de datos..." -ForegroundColor Yellow
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SOURCE database/schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Estructura creada exitosamente" -ForegroundColor Green
} else {
    Write-Host "✗ Error al crear la estructura" -ForegroundColor Red
    exit 1
}

# Ejecutar seed.sql
Write-Host "Insertando datos iniciales..." -ForegroundColor Yellow
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SOURCE database/seed.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Datos iniciales insertados" -ForegroundColor Green
} else {
    Write-Host "✗ Error al insertar datos iniciales" -ForegroundColor Red
    exit 1
}

# Ejecutar pruebas.sql
Write-Host "Creando usuario de prueba..." -ForegroundColor Yellow
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SOURCE database/pruebas.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Usuario admin creado (username: admin, password: 1234)" -ForegroundColor Green
} else {
    Write-Host "✗ Error al crear usuario admin" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Configuración Completa ===" -ForegroundColor Green
Write-Host "Puedes iniciar sesión con:" -ForegroundColor Cyan
Write-Host "  Usuario: admin" -ForegroundColor White
Write-Host "  Contraseña: 1234" -ForegroundColor White
