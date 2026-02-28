@echo off
echo.
echo ======================================
echo   Instalador Base de Datos
echo   Valva Boutique POS
echo ======================================
echo.

REM Solicitar contraseña
set /p DB_PASSWORD="Ingresa la contrasena de MySQL (root): "

echo.
echo Creando base de datos...
echo.

REM Ruta de MySQL (ajusta si es necesario)
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

REM Verificar si existe
if not exist %MYSQL_PATH% (
    echo ERROR: MySQL no encontrado en %MYSQL_PATH%
    echo.
    echo Rutas comunes:
    echo   - C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
    echo   - C:\xampp\mysql\bin\mysql.exe
    echo   - C:\wamp64\bin\mysql\mysql8.0.x\bin\mysql.exe
    echo.
    echo Usa MySQL Workbench para ejecutar manualmente:
    echo   1. database\schema.sql
    echo   2. database\seed.sql
    echo.
    pause
    exit /b 1
)

echo Ejecutando schema.sql...
%MYSQL_PATH% -u root -p%DB_PASSWORD% < database\schema.sql

if %errorlevel% neq 0 (
    echo ERROR al crear el esquema
    pause
    exit /b 1
)

echo OK: Esquema creado
echo.

echo Ejecutando seed.sql...
%MYSQL_PATH% -u root -p%DB_PASSWORD% < database\seed.sql

if %errorlevel% neq 0 (
    echo ERROR al insertar datos
    pause
    exit /b 1
)

echo OK: Datos insertados
echo.
echo ======================================
echo   Base de datos creada exitosamente
echo ======================================
echo.
echo Proximo paso:
echo   node scripts\create-admin.js
echo.
pause
