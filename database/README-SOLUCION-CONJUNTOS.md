# SOLUCIÓN PARA PROBLEMA DE CONJUNTOS

## Problema
Cuando seleccionas la categoría "Conjunto" no aparecen tipos específicos de prenda, mostrando "No hay tipos disponibles".

## Causa
Los tipos de prenda de la categoría Conjunto no existen en tu base de datos o no están correctamente configurados con:
- IDs correctos (27-34)
- categoria_padre_id = 3
- estado = 'activo'

## Scripts Creados

### 1. `diagnostico-conjuntos.sql`
Ejecuta este primero para ver qué hay en tu base de datos actual.

### 2. `solucion-definitiva-conjuntos.sql` ⭐ **USAR ESTE**
Este es el script completo que:
1. Diagnostica el estado actual
2. Limpia datos incorrectos
3. Inserta los 8 tipos de conjuntos con IDs correctos (27-34)
4. Crea las relaciones con sistemas de tallas
5. Verifica que todo quedó bien

## Paso a Paso para Solucionar

1. **Abrir DBeaver** y conectar a la base de datos `valva_boutique_pos`

2. **Ejecutar el script completo** `solucion-definitiva-conjuntos.sql`:
   - Abrir el archivo en DBeaver
   - Seleccionar todo (Ctrl+A)
   - Ejecutar (Alt+X o F5)
   - Revisar los resultados en cada paso

3. **Verificar en la aplicación**:
   - Recargar la página del navegador (F5)
   - Ir a Inventario → Agregar Producto
   - Seleccionar "Conjunto" en Categoría Principal
   - Deberías ver 8 tipos de conjunto disponibles

## Tipos de Conjunto que se Insertarán

1. Conjunto Deportivo (ID: 27)
2. Conjunto Casual (ID: 28)
3. Conjunto de Vestir (ID: 29)
4. Conjunto Crop Top + Falda (ID: 30)
5. Conjunto Blusa + Pantalón (ID: 31)
6. Conjunto Top + Short (ID: 32)
7. Conjunto Blazer + Pantalón (ID: 33)
8. Conjunto Playero (ID: 34)

## Sistemas de Tallas para Conjuntos

Cada conjunto tendrá acceso a:
- **Tallas de Letras** (XS, S, M, L, XL, U)
- **Tallas Numéricas** (4, 6, 8, 10, 12, 14, 16, U)
- **Talla Única** (ÚNICA)

Algunos conjuntos específicos también tendrán:
- Conjunto Playero: Tallas Jeans (24-34)

## Schema.sql Actualizado

El archivo `schema.sql` ya está actualizado con IDs explícitos para todos los tipos de prenda. Esto garantiza que cuando instales el sistema en otro equipo, los IDs serán siempre:
- Pantalones: 1-12
- Blusas: 13-26
- **Conjuntos: 27-34** ✅
- Faldas: 35-44
- Shorts: 45-52
- Vestidos: 53-63
- Bolsos: 64-73

## ¿Sigue sin funcionar?

Si después de ejecutar el script sigues viendo "No hay tipos disponibles":

1. Verifica en DBeaver que los datos se insertaron:
```sql
SELECT * FROM tipos_prenda WHERE categoria_padre_id = 3;
```

2. Revisa la consola del navegador (F12) para ver si hay errores en la llamada a la API

3. Intenta borrar caché del navegador (Ctrl+Shift+Del)

4. Verifica que el endpoint funciona visitando:
```
http://localhost:3000/api/tipos-prenda?categoria_padre_id=3
```

Deberías ver un JSON con los 8 tipos de conjunto.
