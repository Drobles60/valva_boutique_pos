# Scripts de Configuración

## 📋 Scripts disponibles

### 1. `test-db-connection.js`
Verifica la conexión a la base de datos y comprueba que todas las tablas existan.

```bash
node scripts/test-db-connection.js
```

**¿Qué verifica?**
- Conexión a MySQL
- Existencia de tablas principales
- Usuario admin en la base de datos

### 2. `create-admin.js`
Crea o actualiza la contraseña del usuario administrador.

```bash
node scripts/create-admin.js
```

**Credenciales creadas:**
- Username: `admin`
- Password: `Admin123!`
- Email: `admin@valvaboutique.com`
- Rol: `administrador`

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login.

## 🚀 Flujo de instalación completo

### Paso 1: Configurar variables de entorno
```bash
# Copia .env.example a .env.local
cp .env.example .env.local

# Edita .env.local con tus credenciales de MySQL
```

### Paso 2: Crear la base de datos
```bash
# Desde PowerShell o CMD (Windows)
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

# Desde Git Bash (Windows)
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

O desde MySQL Workbench:
1. Abre MySQL Workbench
2. Conecta a tu servidor
3. File → Open SQL Script → `database/schema.sql`
4. Ejecuta el script (⚡ o Ctrl+Shift+Enter)
5. Repite con `database/seed.sql`

### Paso 3: Verificar la conexión
```bash
node scripts/test-db-connection.js
```

### Paso 4: Crear el usuario admin
```bash
node scripts/create-admin.js
```

### Paso 5: Iniciar el servidor
```bash
pnpm dev
```

## 🔧 Solución de problemas

### Error: "Client does not support authentication protocol"
```bash
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';
FLUSH PRIVILEGES;
exit
```

### Error: "Unknown database"
```bash
# Crear la base de datos manualmente
mysql -u root -p
CREATE DATABASE valva_boutique_pos;
exit

# Luego ejecuta los scripts SQL
mysql -u root -p valva_boutique_pos < database/schema.sql
mysql -u root -p valva_boutique_pos < database/seed.sql
```

### Error: "Access denied"
Verifica las credenciales en `.env.local`:
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

### Base de datos existe pero está vacía
```bash
# Resetear la base de datos
mysql -u root -p
DROP DATABASE valva_boutique_pos;
CREATE DATABASE valva_boutique_pos;
exit

# Volver a crear las tablas
mysql -u root -p valva_boutique_pos < database/schema.sql
mysql -u root -p valva_boutique_pos < database/seed.sql
```

## 📝 Notas adicionales

### Instalar dotenv (si no está instalado)
```bash
pnpm add dotenv
```

### Backup de la base de datos
```bash
mysqldump -u root -p valva_boutique_pos > backup_$(date +%Y%m%d).sql
```

### Restaurar backup
```bash
mysql -u root -p valva_boutique_pos < backup_20260108.sql
```
