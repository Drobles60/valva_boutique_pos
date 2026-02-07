# 📦 Guía de Instalación - Valva Boutique POS

## 🎯 Sistema Listo para Instalar en Otro Equipo

Este documento te guiará paso a paso para instalar el sistema POS en un nuevo equipo.

## 📋 Requisitos Previos

### Software Necesario
- **Node.js** v18 o superior
- **MySQL** 8.0 o superior
- **pnpm** (gestor de paquetes)

### Verificar Instalaciones
```bash
node --version
mysql --version
pnpm --version
```

## 🚀 Pasos de Instalación

### 1. Clonar/Copiar el Proyecto
```bash
# Copiar toda la carpeta valva_boutique_pos al nuevo equipo
```

### 2. Configurar Variables de Entorno
Crear archivo `.env.local` en la raíz del proyecto:

```env
# Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_MYSQL
DB_NAME=valva_boutique

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=v8xK+jP4mD9QnR2wL5tA7yH1cN3fB6gE0sU4pI8oM2jX7kV9rT3qZ6nW5aC1dG4e
```

**⚠️ IMPORTANTE:** Cambia `TU_CONTRASEÑA_MYSQL` por tu contraseña real de MySQL.

### 3. Instalar Dependencias
```bash
cd valva_boutique_pos
pnpm install
```

### 4. Crear Base de Datos

#### Opción A: Usando MySQL desde línea de comandos
```bash
# Conectar a MySQL
mysql -u root -p

# Dentro de MySQL, ejecutar:
SOURCE database/schema.sql
```

#### Opción B: Usando script Node.js
```bash
# Asegúrate de que las variables de entorno estén configuradas
node scripts/setup-db-simple.js
```

### 5. Verificar la Instalación
```bash
# Verificar conexión a base de datos
node scripts/test-db-connection.js

# Verificar sistema de ventas
node scripts/verificar-sistema-ventas.js
```

### 6. Crear Usuario Administrador
```bash
node scripts/create-admin-simple.js
```

Esto creará:
- **Usuario:** admin
- **Contraseña:** 1234
- **Rol:** Administrador

### 7. Iniciar la Aplicación
```bash
# Modo desarrollo
pnpm dev

# Modo producción
pnpm build
pnpm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 📊 Estructura de la Base de Datos

### Tablas Principales
- ✅ **usuarios** - Usuarios del sistema
- ✅ **productos** - Inventario de productos
- ✅ **clientes** - Gestión de clientes
- ✅ **proveedores** - Gestión de proveedores
- ✅ **ventas** - Registro de ventas
- ✅ **detalle_ventas** - Detalles de cada venta
- ✅ **cuentas_por_cobrar** - Créditos a clientes
- ✅ **abonos** - Pagos de cuentas por cobrar
- ✅ **pedidos** - Pedidos a proveedores
- ✅ **cajas** - Control de cajas
- ✅ **movimientos_inventario** - Historial de movimientos
- ✅ **descuentos** - Gestión de descuentos

### Características Implementadas
- ✅ Sistema de ventas completo
- ✅ Control de inventario automático
- ✅ Generación de facturas PDF
- ✅ Gestión de roles y permisos
- ✅ Ventas a contado y crédito
- ✅ Múltiples métodos de pago
- ✅ Sistema de descuentos
- ✅ Gestión de proveedores y pedidos

## 🔐 Usuarios Predeterminados

### Administrador
- **Usuario:** admin
- **Contraseña:** 1234
- **Permisos:** Acceso completo

### Vendedor (Opcional)
Para crear un vendedor, ejecutar:
```bash
node scripts/create-vendedor.js
```

## 🧪 Pruebas Opcionales

### Prueba de Venta Completa
```bash
node scripts/prueba-venta-completa.js
```

### Verificar Sistema
```bash
node scripts/verificar-sistema-ventas.js
```

## 📝 Datos Iniciales Incluidos

El schema incluye datos predefinidos:
- ✅ 7 Categorías de productos (Pantalón, Blusa, Conjunto, Faldas, Shorts, Vestidos, Bolsos)
- ✅ 73 Tipos de prenda específicos
- ✅ 5 Sistemas de tallas
- ✅ 42 Tallas predefinidas
- ✅ Relaciones tipo_prenda ↔ sistema_talla

## 🔧 Solución de Problemas

### Error: "Cannot connect to MySQL"
- Verificar que MySQL esté corriendo
- Verificar credenciales en `.env.local`
- Verificar puerto 3306 disponible

### Error: "Database does not exist"
- Ejecutar `SOURCE database/schema.sql` en MySQL
- O ejecutar `node scripts/setup-db-simple.js`

### Error: "Table already exists"
- La base de datos ya fue creada
- Continuar con el paso siguiente

### Error: "Port 3000 already in use"
- Cambiar puerto en package.json
- O detener la aplicación que usa el puerto 3000

## 📱 Primer Login

1. Abrir navegador en `http://localhost:3000`
2. Usar credenciales:
   - Usuario: `admin`
   - Contraseña: `1234`
3. Cambiar contraseña en Usuarios y Roles

## 🎨 Personalización

### Logo de la Empresa
Reemplazar archivo: `/public/logo 1.jpeg`

### Información del Negocio
Editar en: `components/factura-dialog.tsx`
- Línea 127: Nombre del negocio
- Línea 129: Teléfono

### Configuración General
Usar módulo de "Configuración" en la aplicación

## 📚 Documentación Adicional

- `README.md` - Documentación general
- `README_DATABASE.md` - Estructura de base de datos
- `SISTEMA_VENTAS.md` - Sistema de ventas
- `PRUEBA_ROLES.md` - Sistema de roles

## 🆘 Soporte

Si encuentras problemas durante la instalación:
1. Verificar logs en consola
2. Revisar archivo `.env.local`
3. Verificar permisos de MySQL
4. Consultar documentación adicional

## ✅ Checklist de Instalación

- [ ] Node.js instalado
- [ ] MySQL instalado y corriendo
- [ ] pnpm instalado
- [ ] Proyecto copiado al nuevo equipo
- [ ] `.env.local` configurado
- [ ] `pnpm install` ejecutado
- [ ] Base de datos creada (`schema.sql`)
- [ ] Usuario admin creado
- [ ] Aplicación iniciada (`pnpm dev`)
- [ ] Acceso exitoso a `http://localhost:3000`

## 🎉 ¡Listo!

Tu sistema POS está instalado y funcionando. Ahora puedes:
- Crear usuarios adicionales
- Agregar productos
- Realizar ventas
- Generar reportes
- Gestionar inventario

---

**Versión del Schema:** Actualizado - Febrero 2026
**Sistema:** Valva Boutique POS v1.0
