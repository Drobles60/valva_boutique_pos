// @ts-nocheck
/**
 * ENDPOINT TEMPORAL DE DATOS DE PRUEBA
 * GET /api/seed-demo → carga productos y movimientos de prueba
 * ENUM real: entrada_inicial | entrada_devolucion | salida_venta | salida_merma | ajuste_manual
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // 1. Categorías
        let cat = await query<any[]>("SELECT id FROM categorias_padre WHERE nombre='BLUSAS' LIMIT 1");
        let catId: number;
        if (cat.length) { catId = cat[0].id; } else {
            const r = await query<any>("INSERT INTO categorias_padre (nombre, descripcion, estado) VALUES ('BLUSAS','Demo','activo')");
            catId = r.insertId;
        }
        let cat2 = await query<any[]>("SELECT id FROM categorias_padre WHERE nombre='JEANS' LIMIT 1");
        let cat2Id: number;
        if (cat2.length) { cat2Id = cat2[0].id; } else {
            const r = await query<any>("INSERT INTO categorias_padre (nombre, descripcion, estado) VALUES ('JEANS','Demo','activo')");
            cat2Id = r.insertId;
        }

        // 2. Tipos de prenda
        let tipo1 = await query<any[]>("SELECT id FROM tipos_prenda WHERE nombre='BLUSA FLORAL' LIMIT 1");
        let tipo1Id: number;
        if (tipo1.length) { tipo1Id = tipo1[0].id; } else {
            const r = await query<any>("INSERT INTO tipos_prenda (nombre, categoria_padre_id, estado) VALUES ('BLUSA FLORAL',?,'activo')", [catId]);
            tipo1Id = r.insertId;
        }
        let tipo2 = await query<any[]>("SELECT id FROM tipos_prenda WHERE nombre='JEAN RECTO' LIMIT 1");
        let tipo2Id: number;
        if (tipo2.length) { tipo2Id = tipo2[0].id; } else {
            const r = await query<any>("INSERT INTO tipos_prenda (nombre, categoria_padre_id, estado) VALUES ('JEAN RECTO',?,'activo')", [cat2Id]);
            tipo2Id = r.insertId;
        }

        // 3. Tallas
        const tallaMap: Record<string, number> = {};
        for (const v of ['S', 'M', 'L', '28', '30']) {
            const ex = await query<any[]>("SELECT id FROM tallas WHERE valor=? LIMIT 1", [v]);
            if (ex.length) { tallaMap[v] = ex[0].id; } else {
                const r = await query<any>("INSERT INTO tallas (valor) VALUES (?)", [v]);
                tallaMap[v] = r.insertId;
            }
        }

        // 4. Proveedor
        let prov = await query<any[]>("SELECT id FROM proveedores WHERE ruc='1790001122001' LIMIT 1");
        let provId: number;
        if (prov.length) { provId = prov[0].id; } else {
            const r = await query<any>(
                "INSERT INTO proveedores (razon_social, ruc, telefono, estado) VALUES ('MODA DEMO SAS','1790001122001','0999000111','activo')"
            );
            provId = r.insertId;
        }

        // 5. Productos con movimientos usando ENUM correcto
        const prods = [
            { sku: 'DEMO-BLU-S-NEG', nombre: 'BLUSA FLORAL', cat: catId, tipo: tipo1Id, talla: tallaMap['S'], color: 'NEGRO', compra: 15, venta: 35, stock: 20 },
            { sku: 'DEMO-BLU-M-BLA', nombre: 'BLUSA FLORAL', cat: catId, tipo: tipo1Id, talla: tallaMap['M'], color: 'BLANCO', compra: 15, venta: 35, stock: 15 },
            { sku: 'DEMO-BLU-L-ROJ', nombre: 'BLUSA FLORAL', cat: catId, tipo: tipo1Id, talla: tallaMap['L'], color: 'ROJO', compra: 15, venta: 35, stock: 10 },
            { sku: 'DEMO-JEA-28-NAV', nombre: 'JEAN RECTO', cat: cat2Id, tipo: tipo2Id, talla: tallaMap['28'], color: 'NAVY', compra: 22, venta: 55, stock: 25 },
            { sku: 'DEMO-JEA-30-NAV', nombre: 'JEAN RECTO', cat: cat2Id, tipo: tipo2Id, talla: tallaMap['30'], color: 'NAVY', compra: 22, venta: 55, stock: 18 },
        ];

        const creados: any[] = [];
        for (const p of prods) {
            const ex = await query<any[]>("SELECT id, stock_actual FROM productos WHERE sku=? LIMIT 1", [p.sku]);
            let pid: number;
            let stockInicial = p.stock;
            if (ex.length) {
                pid = ex[0].id;
                stockInicial = Number(ex[0].stock_actual);
                creados.push({ sku: p.sku, id: pid, status: 'ya_existia' });
            } else {
                const r = await query<any>(
                    `INSERT INTO productos (sku,nombre,categoria_padre_id,tipo_prenda_id,talla_id,proveedor_id,color,precio_compra,precio_venta,precio_minimo,stock_actual,estado)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,'activo')`,
                    [p.sku, p.nombre, p.cat, p.tipo, p.talla, provId, p.color, p.compra, p.venta, p.venta, p.stock]
                );
                pid = r.insertId;
                // Movimiento de compra inicial (ENUM: entrada_inicial)
                await query(
                    `INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'entrada_inicial', ?, 0, ?, 'Compra inicial lote demo', DATE_SUB(NOW(), INTERVAL 30 DAY))`,
                    [pid, p.stock, p.stock]
                );
                creados.push({ sku: p.sku, id: pid, status: 'creado' });
            }

            // Agregar movimientos de ejemplo para el primer producto
            if (p.sku === 'DEMO-BLU-S-NEG') {
                const s1 = stockInicial;
                // Segunda compra
                await query(
                    `INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'entrada_inicial', 10, ?, ?, 'Segunda compra proveedor MODA DEMO', DATE_SUB(NOW(), INTERVAL 20 DAY))`,
                    [pid, s1, s1 + 10]
                );
                await query("UPDATE productos SET stock_actual = stock_actual + 10 WHERE id=?", [pid]);

                // Venta 1
                const s2 = s1 + 10;
                await query(
                    `INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'salida_venta', -4, ?, ?, 'Venta mostrador # 00012', DATE_SUB(NOW(), INTERVAL 15 DAY))`,
                    [pid, s2, s2 - 4]
                );
                await query("UPDATE productos SET stock_actual = stock_actual - 4 WHERE id=?", [pid]);

                // Devolución cliente
                const s3 = s2 - 4;
                await query(
                    `INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'entrada_devolucion', 1, ?, ?, 'Devolución cliente: talla incorrecta', DATE_SUB(NOW(), INTERVAL 10 DAY))`,
                    [pid, s3, s3 + 1]
                );
                await query("UPDATE productos SET stock_actual = stock_actual + 1 WHERE id=?", [pid]);

                // Venta 2
                const s4 = s3 + 1;
                await query(
                    `INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'salida_venta', -2, ?, ?, 'Venta mostrador # 00025', DATE_SUB(NOW(), INTERVAL 5 DAY))`,
                    [pid, s4, s4 - 2]
                );
                await query("UPDATE productos SET stock_actual = stock_actual - 2 WHERE id=?", [pid]);

                // Ajuste manual
                const s5 = s4 - 2;
                await query(
                    `INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
           VALUES (?, 'ajuste_manual', 3, ?, ?, 'Ajuste físico conteo inventario', NOW())`,
                    [pid, s5, s5 + 3]
                );
                await query("UPDATE productos SET stock_actual = stock_actual + 3 WHERE id=?", [pid]);
            }
        }

        return NextResponse.json({
            success: true,
            mensaje: `✅ ${creados.filter(c => c.status === 'creado').length} productos nuevos, ${creados.filter(c => c.status === 'ya_existia').length} ya existían. Abre el Kardex y presiona "Consultar".`,
            detalle: creados,
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
