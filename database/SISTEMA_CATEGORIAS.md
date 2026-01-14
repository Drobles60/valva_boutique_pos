# Sistema de Categorías y Tallas - Valva Boutique POS

## 📋 Estructura Jerárquica

### 1️⃣ Categorías Padre (3 Preestablecidas)
Son las categorías principales del sistema, ya predefinidas:
- **Ropa de Mujer**
- **Ropa de Hombre**
- **Accesorios**

### 2️⃣ Tipos de Prenda (Subcategorías)
Cada categoría padre tiene sus propios tipos de prenda:

#### Ropa de Mujer:
- Blusas
- Pantalones
- Vestidos
- Faldas
- Chaquetas
- Jeans

#### Ropa de Hombre:
- Camisas
- Pantalones
- Polos
- Chaquetas
- Jeans

#### Accesorios:
- Carteras
- Cinturones
- Bufandas
- Gorros
- Bolsos

### 3️⃣ Sistemas de Tallas
Cada tipo de prenda tiene su propio sistema de tallas:

| Sistema | Tipo | Tallas Disponibles | Usado en |
|---------|------|-------------------|----------|
| Tallas Estándar | Letras | XS, S, M, L, XL, XXL | Blusas, Vestidos, Faldas, Camisas, Polos, Chaquetas |
| Tallas Pantalón Mujer | Números | 2, 4, 6, 8, 10, 12, 14 | Pantalones de Mujer |
| Tallas Pantalón Hombre | Números | 28, 30, 32, 34, 36, 38, 40 | Pantalones de Hombre |
| Tallas Jeans Mujer | Números | 24, 26, 28, 30, 32, 34 | Jeans de Mujer |
| Tallas Jeans Hombre | Números | 28, 30, 32, 34, 36, 38, 40 | Jeans de Hombre |
| Talla Única | Letras | ÚNICA | Todos los Accesorios |

## 🔄 Flujo de Registro de Producto

```
1. Seleccionar Categoría Padre
   ↓
   [Ropa de Mujer] [Ropa de Hombre] [Accesorios]
   
2. Seleccionar Tipo de Prenda (filtrado por categoría padre)
   ↓
   Si seleccionó "Ropa de Mujer":
   [Blusas] [Pantalones] [Vestidos] [Faldas] [Chaquetas] [Jeans]
   
3. Seleccionar Talla (filtrado por tipo de prenda)
   ↓
   Si seleccionó "Blusas":
   [XS] [S] [M] [L] [XL] [XXL]
   
   Si seleccionó "Pantalones":
   [2] [4] [6] [8] [10] [12] [14]
   
   Si seleccionó "Jeans":
   [24] [26] [28] [30] [32] [34]
```

## 📊 Estructura de Tablas

### Tabla: `categorias_padre`
```sql
- id (PK)
- nombre (único)
- descripcion
- orden
- estado (activo/inactivo)
```

### Tabla: `tipos_prenda`
```sql
- id (PK)
- categoria_padre_id (FK → categorias_padre)
- nombre
- descripcion
- orden
- estado (activo/inactivo)
```

### Tabla: `sistemas_tallas`
```sql
- id (PK)
- nombre
- descripcion
- tipo (letras/numeros/mixto)
```

### Tabla: `tallas`
```sql
- id (PK)
- sistema_talla_id (FK → sistemas_tallas)
- valor (ej: "S", "M", "32", "28")
- descripcion
- orden
- estado (activo/inactivo)
```

### Tabla: `tipo_prenda_sistema_talla`
Relaciona qué sistemas de tallas aplican a cada tipo de prenda:
```sql
- tipo_prenda_id (FK → tipos_prenda)
- sistema_talla_id (FK → sistemas_tallas)
```

### Tabla: `productos` (actualizada)
```sql
- id (PK)
- codigo_barras
- sku
- nombre
- descripcion
- categoria_padre_id (FK → categorias_padre) ← NUEVO
- tipo_prenda_id (FK → tipos_prenda) ← NUEVO
- marca_id (FK → marcas)
- talla_id (FK → tallas)
- color ← NUEVO
- precio_compra
- precio_venta
- precio_minimo
- stock_actual
- estado
```

## 🔍 Consultas SQL Útiles

### Obtener tipos de prenda por categoría padre:
```sql
SELECT * FROM tipos_prenda 
WHERE categoria_padre_id = ? AND estado = 'activo'
ORDER BY orden;
```

### Obtener sistemas de tallas por tipo de prenda:
```sql
SELECT st.* 
FROM sistemas_tallas st
INNER JOIN tipo_prenda_sistema_talla tpst ON st.id = tpst.sistema_talla_id
WHERE tpst.tipo_prenda_id = ?;
```

### Obtener tallas por sistema de tallas:
```sql
SELECT * FROM tallas 
WHERE sistema_talla_id = ? AND estado = 'activo'
ORDER BY orden;
```

### Obtener tallas disponibles para un tipo de prenda:
```sql
SELECT t.* 
FROM tallas t
INNER JOIN sistemas_tallas st ON t.sistema_talla_id = st.id
INNER JOIN tipo_prenda_sistema_talla tpst ON st.id = tpst.sistema_talla_id
WHERE tpst.tipo_prenda_id = ? AND t.estado = 'activo'
ORDER BY t.orden;
```

### Productos con información completa:
```sql
SELECT 
    p.*,
    cp.nombre AS categoria_padre_nombre,
    tp.nombre AS tipo_prenda_nombre,
    m.nombre AS marca_nombre,
    t.valor AS talla_valor
FROM productos p
LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
LEFT JOIN tipos_prenda tp ON p.tipo_prenda_id = tp.id
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN tallas t ON p.talla_id = t.id
WHERE p.estado = 'activo';
```

## ✨ Ventajas del Sistema

1. **Organización Clara**: Jerarquía de 3 niveles (Categoría → Tipo → Talla)
2. **Flexibilidad**: Diferentes sistemas de tallas para diferentes prendas
3. **Escalabilidad**: Fácil agregar nuevos tipos de prenda o sistemas de tallas
4. **Validación**: Solo se pueden seleccionar tallas válidas para cada tipo de prenda
5. **Consistencia**: Las categorías padre están preestablecidas para mantener uniformidad

## 🎯 Ejemplos de Productos

**Ejemplo 1: Blusa de Mujer**
- Categoría Padre: Ropa de Mujer
- Tipo de Prenda: Blusas
- Talla Disponible: XS, S, M, L, XL, XXL

**Ejemplo 2: Pantalón de Hombre**
- Categoría Padre: Ropa de Hombre
- Tipo de Prenda: Pantalones
- Talla Disponible: 28, 30, 32, 34, 36, 38, 40

**Ejemplo 3: Cartera**
- Categoría Padre: Accesorios
- Tipo de Prenda: Carteras
- Talla Disponible: ÚNICA
