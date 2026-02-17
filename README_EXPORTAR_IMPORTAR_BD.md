# Guía: Exportar e Importar Base de Datos MySQL

Esta guía explica cómo exportar tu base de datos MySQL completa (estructura + datos) y cómo instalarla en otro equipo.

---

## 📦 Opción 1: Usando `mysqldump` (Línea de Comandos)

### Exportar la Base de Datos

```powershell
# Exportar una base de datos específica
mysqldump -u tu_usuario -p nombre_base_datos > backup.sql

# Exportar TODAS las bases de datos
mysqldump -u tu_usuario -p --all-databases > backup_completo.sql

# Con más opciones (RECOMENDADO para este proyecto)
mysqldump -u root -p --databases valva_boutique_pos --routines --triggers --events --single-transaction > valva_backup.sql
```

**Explicación de opciones:**
- `--databases`: Incluye la sentencia CREATE DATABASE
- `--routines`: Exporta stored procedures y funciones
- `--triggers`: Exporta triggers
- `--events`: Exporta eventos programados
- `--single-transaction`: Para bases de datos InnoDB, hace backup consistente sin bloquear tablas

### Importar en Otro Equipo

```powershell
# Si el archivo NO incluye CREATE DATABASE
mysql -u tu_usuario -p nombre_base_datos < backup.sql

# Si el archivo incluye CREATE DATABASE (con --databases)
mysql -u tu_usuario -p < valva_backup.sql
```

---

## 🖥️ Opción 2: Usando DBeaver (Interfaz Gráfica)

### Exportar

1. Abre **DBeaver**
2. Conecta a tu base de datos
3. Click derecho en la base de datos → **Tools** → **Dump Database**
4. Configura las opciones:
   - ✅ Tables
   - ✅ Views
   - ✅ Procedures
   - ✅ Functions
   - ✅ Triggers
   - ✅ **Data** (importante para incluir datos)
5. Selecciona la ruta y nombre del archivo
6. Click en **Start**
7. Guarda el archivo `.sql` generado

### Importar en Otro Equipo

1. Instala MySQL en el nuevo equipo (misma versión o compatible)
2. Abre **DBeaver** y crea una nueva conexión al servidor MySQL
3. Click derecho en la conexión → **SQL Editor** → **Load SQL Script**
4. Selecciona tu archivo `backup.sql`
5. Ejecuta el script completo (presiona **F5** o click en **Execute SQL Script**)
6. Espera a que termine la ejecución

---

## 🔧 Opción 3: Usando MySQL Workbench

### Exportar

1. Abre **MySQL Workbench**
2. Conecta a tu servidor MySQL
3. Menú: **Server** → **Data Export**
4. En el panel izquierdo, selecciona la(s) base(s) de datos a exportar
5. Configura opciones:
   - ✅ **Include Create Schema**
   - Selecciona **Export to Self-Contained File**
   - Elige la ruta donde guardar el `.sql`
6. En "Objects to Export", marca:
   - ✅ Dump Stored Procedures and Functions
   - ✅ Dump Events
   - ✅ Dump Triggers
7. Click en **Start Export**

### Importar

1. En el nuevo equipo, abre **MySQL Workbench**
2. Conecta al servidor MySQL
3. Menú: **Server** → **Data Import**
4. Selecciona **Import from Self-Contained File**
5. Click en **...** y selecciona tu archivo `.sql`
6. En "Default Target Schema", selecciona o crea la base de datos destino
7. Click en **Start Import**
8. Revisa el log de importación para verificar que no haya errores

---

## ⚙️ Pasos Adicionales en el Nuevo Equipo

### 1. Verificar la Instalación de MySQL

```powershell
# Verificar versión de MySQL instalada
mysql --version
```

### 2. Crear Usuario si es Necesario

```sql
-- Conectar como root
mysql -u root -p

-- Crear usuario
CREATE USER 'tu_usuario'@'localhost' IDENTIFIED BY 'tu_contraseña';

-- Dar permisos a la base de datos
GRANT ALL PRIVILEGES ON valva_boutique_pos.* TO 'tu_usuario'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Salir
EXIT;
```

### 3. Actualizar Variables de Entorno en el Proyecto

Después de importar la base de datos, actualiza el archivo `.env.local`:

```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=valva_boutique_pos
DB_PORT=3306
```

### 4. Verificar la Importación

```powershell
# Conectar a MySQL
mysql -u tu_usuario -p valva_boutique_pos

# Ver las tablas
SHOW TABLES;

# Verificar algunos datos
SELECT COUNT(*) FROM productos;
SELECT COUNT(*) FROM clientes;
SELECT COUNT(*) FROM ventas;

# Salir
EXIT;
```

---

## 📝 Notas Importantes

- **Versión de MySQL**: Asegúrate de que el servidor de destino tenga una versión igual o superior de MySQL
- **Tamaño del archivo**: Si tu base de datos es muy grande (>500MB), considera comprimirla:
  ```powershell
  # Comprimir el backup
  mysqldump -u root -p valva_boutique_pos | gzip > valva_backup.sql.gz
  
  # Descomprimir e importar
  gunzip < valva_backup.sql.gz | mysql -u root -p valva_boutique_pos
  ```
- **Caracteres especiales**: Si tienes problemas con caracteres especiales (ñ, tildes), agrega `--default-character-set=utf8mb4` al exportar
- **Permisos**: Asegúrate de tener permisos suficientes en ambos servidores

---

## 🚀 Comando Rápido Recomendado para Este Proyecto

```powershell
# EXPORTAR (en el equipo actual)
mysqldump -u root -p ^
  --databases valva_boutique_pos ^
  --routines ^
  --triggers ^
  --events ^
  --single-transaction ^
  --default-character-set=utf8mb4 > valva_boutique_backup.sql

# IMPORTAR (en el nuevo equipo)
mysql -u root -p < valva_boutique_backup.sql
```

---

## ❓ Solución de Problemas Comunes

### Error: "Access denied"
```sql
-- Verificar y actualizar permisos
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### Error: "Unknown database"
```sql
-- Crear la base de datos manualmente primero
CREATE DATABASE valva_boutique_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Table already exists"
```powershell
# Opción 1: Eliminar la base de datos existente antes de importar
mysql -u root -p -e "DROP DATABASE IF EXISTS valva_boutique_pos;"

# Opción 2: Agregar --force al importar
mysql -u root -p --force < valva_backup.sql
```

---

## 📞 Soporte

Si tienes problemas durante el proceso:
1. Verifica los logs de MySQL: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\` (Windows)
2. Revisa el archivo de error generado durante la importación
3. Asegúrate de que ambos servidores tengan configuraciones compatibles
