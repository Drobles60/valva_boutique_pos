# Configuración de Base de Datos - Valva Boutique POS

## 📋 Prerrequisitos

- MySQL 8.0 o superior instalado
- Node.js 18+ con pnpm

## 🚀 Instalación

### 1. Instalar dependencias de MySQL

```bash
pnpm add mysql2
pnpm add -D @types/mysql2
```

### 2. Crear archivo .env.local

Copia el archivo `.env.example` a `.env.local` y configura tus credenciales:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=valva_boutique

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera_un_secret_seguro_aqui
```

Para generar el `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Crear la base de datos

**Opción A: Desde MySQL CLI**

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

**Opción B: Desde MySQL Workbench**

1. Abre MySQL Workbench
2. Conecta a tu servidor MySQL
3. Abre el archivo `database/schema.sql`
4. Ejecuta el script (⚡ icon o Ctrl+Shift+Enter)
5. Abre el archivo `database/seed.sql`
6. Ejecuta el script

### 4. Crear el usuario administrador

El usuario admin necesita una contraseña hasheada con bcrypt. Crea este archivo temporal:

**scripts/create-admin.js**
```javascript
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'tu_contraseña',
    database: 'valva_boutique_pos'
  });

  const password = 'Admin123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  await connection.execute(
    'UPDATE usuarios SET password_hash = ? WHERE username = ?',
    [hashedPassword, 'admin']
  );

  console.log('✅ Usuario admin creado exitosamente');
  console.log('Username: admin');
  console.log('Password: Admin123!');
  
  await connection.end();
}

createAdmin().catch(console.error);
```

Ejecuta el script:
```bash
node scripts/create-admin.js
```

### 5. Verificar la conexión

Crea este endpoint temporal: `app/api/test-db/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { checkConnection } from '@/lib/db';

export async function GET() {
  const isConnected = await checkConnection();
  
  if (isConnected) {
    return NextResponse.json({ 
      status: 'success', 
      message: 'Conexión a la base de datos exitosa' 
    });
  }
  
  return NextResponse.json({ 
    status: 'error', 
    message: 'Error al conectar con la base de datos' 
  }, { status: 500 });
}
```

Visita: `http://localhost:3000/api/test-db`

## 📊 Estructura de la Base de Datos

### Tabla Principal: usuarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT | ID único del usuario |
| username | VARCHAR(50) | Nombre de usuario único |
| email | VARCHAR(100) | Email único |
| password_hash | VARCHAR(255) | Contraseña hasheada con bcrypt |
| nombre | VARCHAR(100) | Nombre del usuario |
| apellido | VARCHAR(100) | Apellido del usuario |
| rol | ENUM | 'administrador' o 'vendedor' |
| estado | ENUM | 'activo', 'inactivo', 'suspendido' |

### Roles y Permisos

Los permisos están definidos en el código (`lib/auth/permissions.ts`), no en la base de datos.

**Rol: Administrador**
- Acceso total al sistema
- Todos los módulos y funcionalidades

**Rol: Vendedor**
- Abrir y cerrar caja
- Registrar ventas
- Ver clientes

## 🔐 Sistema de Autenticación

### Verificar permisos en componentes

```tsx
import { Can } from '@/components/auth/can';

export default function MyComponent() {
  return (
    <div>
      <Can permission="productos.crear">
        <Button>Crear Producto</Button>
      </Can>
    </div>
  );
}
```

### Verificar permisos en API Routes

```typescript
import { requirePermission } from '@/lib/auth/check-permission';

export async function POST(request: Request) {
  await requirePermission('productos.crear');
  // ... tu lógica aquí
}
```

### Usar hooks de permisos

```tsx
import { usePermission, useRole, useIsAdmin } from '@/hooks/use-permission';

export default function MyComponent() {
  const canCreate = usePermission('productos.crear');
  const role = useRole();
  const isAdmin = useIsAdmin();
  
  return <div>...</div>;
}
```

## 🛠️ Comandos Útiles

### Resetear la base de datos
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS valva_boutique_pos;"
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
node scripts/create-admin.js
```

### Backup de la base de datos
```bash
mysqldump -u root -p valva_boutique_pos > backup.sql
```

### Restaurar backup
```bash
mysql -u root -p valva_boutique_pos < backup.sql
```

## 📝 Credenciales por Defecto

**Usuario Administrador:**
- Username: `admin`
- Password: `Admin123!`
- Email: `admin@valvaboutique.com`

**⚠️ IMPORTANTE:** Cambia estas credenciales después del primer login.

## 🐛 Troubleshooting

### Error: "Client does not support authentication protocol"

```bash
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'tu_contraseña';
FLUSH PRIVILEGES;
```

### Error: "Access denied for user"

Verifica las credenciales en `.env.local`

### Error: "Unknown database"

Ejecuta primero `database/schema.sql`

## 📚 Recursos Adicionales

- [Documentación MySQL](https://dev.mysql.com/doc/)
- [MySQL2 NPM Package](https://www.npmjs.com/package/mysql2)
- [NextAuth.js](https://next-auth.js.org/)
