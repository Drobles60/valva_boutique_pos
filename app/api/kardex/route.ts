// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        // ── Opciones de filtros ─────────────────────────────────────────────────
        if (action === 'filtros') {
            const [categorias, tallas, colores, usuarios, proveedores] = await Promise.all([
                query<any[]>("SELECT id, nombre FROM categorias_padre WHERE estado='activo' ORDER BY nombre"),
                query<any[]>("SELECT DISTINCT t.id, t.valor FROM tallas t INNER JOIN productos p ON p.talla_id=t.id ORDER BY t.valor"),
                query<any[]>("SELECT DISTINCT color FROM productos WHERE color IS NOT NULL AND color<>'' ORDER BY color"),
                query<any[]>("SELECT id, nombre FROM usuarios WHERE estado='activo' ORDER BY nombre"),
                query<any[]>("SELECT id, razon_social FROM proveedores WHERE estado='activo' ORDER BY razon_social"),
            ]);
            return NextResponse.json({ success: true, categorias, tallas, colores, usuarios, proveedores });
        }

        // ── Datos del Kardex con filtros ────────────────────────────────────────
        const producto_id = searchParams.get('producto_id');
        const categoria_id = searchParams.get('categoria_id');
        const talla = searchParams.get('talla');
        const color = searchParams.get('color');
        const fecha_inicio = searchParams.get('fecha_inicio');
        const fecha_fin = searchParams.get('fecha_fin');
        const tercero = searchParams.get('tercero');       // texto libre
        const usuario_id = searchParams.get('usuario_id');
        const tipo_mov = searchParams.get('tipo_movimiento');
        const referencia = searchParams.get('referencia');

        let where = 'WHERE 1=1';
        const params: any[] = [];

        if (producto_id) { where += ' AND mi.producto_id = ?'; params.push(producto_id); }
        if (categoria_id) { where += ' AND p.categoria_padre_id = ?'; params.push(categoria_id); }
        if (talla) { where += ' AND t.valor = ?'; params.push(talla); }
        if (color) { where += ' AND LOWER(p.color) LIKE ?'; params.push(`%${color.toLowerCase()}%`); }
        if (fecha_inicio) { where += ' AND DATE(mi.fecha_movimiento) >= ?'; params.push(fecha_inicio); }
        if (fecha_fin) { where += ' AND DATE(mi.fecha_movimiento) <= ?'; params.push(fecha_fin); }
        if (usuario_id) { where += ' AND mi.usuario_id = ?'; params.push(usuario_id); }
        if (referencia) { where += ' AND (v.numero_venta LIKE ? OR CAST(mi.id AS CHAR) = ?)'; params.push(`%${referencia}%`, referencia); }
        if (tercero) { where += ' AND (pv.razon_social LIKE ? OR c.nombre LIKE ?)'; params.push(`%${tercero}%`, `%${tercero}%`); }
        if (tipo_mov) {
            const mapaTipo: Record<string, string[]> = {
                'Compra': ['entrada_inicial'],
                'Venta': ['salida_venta'],
                'Devolucion': ['entrada_devolucion'],
                'Ajuste': ['ajuste_manual'],
                'Merma': ['salida_merma'],
            };
            const tipos = mapaTipo[tipo_mov] || [tipo_mov];
            where += ` AND mi.tipo_movimiento IN (${tipos.map(() => '?').join(',')})`;
            params.push(...tipos);
        }

        const movimientos = await query<any[]>(
            `SELECT
        mi.id,
        mi.fecha_movimiento,
        mi.tipo_movimiento,
        mi.cantidad,
        mi.stock_anterior,
        mi.stock_nuevo,
        mi.motivo,
        mi.venta_id,
        mi.usuario_id,
        p.id          AS producto_id,
        p.nombre      AS producto_nombre,
        p.sku,
        p.color,
        p.precio_compra,
        p.precio_venta,
        p.stock_actual,
        cp.nombre     AS categoria_nombre,
        tp.nombre     AS tipo_prenda_nombre,
        t.valor       AS talla_valor,
        pv.razon_social AS proveedor_nombre,
        v.numero_venta,
        c.nombre      AS cliente_nombre,
        u.nombre      AS usuario_nombre
       FROM movimientos_inventario mi
       INNER JOIN productos p   ON mi.producto_id = p.id
       LEFT JOIN categorias_padre cp ON p.categoria_padre_id = cp.id
       LEFT JOIN tipos_prenda    tp ON p.tipo_prenda_id = tp.id
       LEFT JOIN tallas          t  ON p.talla_id = t.id
       LEFT JOIN proveedores     pv ON p.proveedor_id = pv.id
       LEFT JOIN ventas          v  ON mi.venta_id = v.id
       LEFT JOIN clientes        c  ON v.cliente_id = c.id
       LEFT JOIN usuarios        u  ON mi.usuario_id = u.id
       ${where}
       ORDER BY mi.fecha_movimiento ASC, mi.id ASC`,
            params
        );

        // ── Calcular saldo acumulado por variante (Promedio Ponderado) ──────────
        // clave: producto_id (ya que cada producto es una variante única en este sistema)
        const saldoPorVariante: Record<number, { cant: number; valor: number }> = {};

        const resultado = movimientos.map((mov) => {
            const key = mov.producto_id;
            if (!saldoPorVariante[key]) saldoPorVariante[key] = { cant: 0, valor: 0 };
            const saldo = saldoPorVariante[key];

            const cantidad = Math.abs(Number(mov.cantidad));
            const costoUnit = Number(mov.precio_compra) || 0;

            const tiposEntrada = ['entrada_inicial', 'entrada_devolucion', 'entrada_compra', 'entrada'];
            const tiposSalida = ['salida_venta', 'salida_merma', 'salida_compra', 'venta', 'salida'];
            const esEntrada = tiposEntrada.includes(mov.tipo_movimiento);
            const esSalida = tiposSalida.includes(mov.tipo_movimiento);
            const esAjuste = mov.tipo_movimiento === 'ajuste_manual';

            let entradaCant = 0, entradaValor = 0;
            let salidaCant = 0, salidaValor = 0;

            // Costo promedio ANTES del movimiento
            const costoPromedioPrev = saldo.cant > 0 ? saldo.valor / saldo.cant : costoUnit;

            if (esEntrada) {
                entradaCant = cantidad;
                entradaValor = cantidad * costoUnit;
                saldo.cant += cantidad;
                saldo.valor += entradaValor;
            } else if (esSalida) {
                salidaCant = cantidad;
                const costoSalida = saldo.cant > 0 ? saldo.valor / saldo.cant : costoUnit;
                salidaValor = cantidad * costoSalida;
                saldo.cant -= cantidad;
                saldo.valor -= salidaValor;
                if (saldo.cant < 0) saldo.cant = 0;
                if (saldo.valor < 0) saldo.valor = 0;
            }

            const costoPromedio = saldo.cant > 0 ? saldo.valor / saldo.cant : costoUnit;

            // Referencia / documento
            const referencia = mov.numero_venta || `MOV-${String(mov.id).padStart(6, '0')}`;

            // Tercero
            const terceroStr = mov.cliente_nombre || mov.proveedor_nombre || '—';

            // Tipo legible
            const tipoLegible = getTipoLegible(mov.tipo_movimiento);

            return {
                id: mov.id,
                fecha: mov.fecha_movimiento,
                referencia,
                descripcion: mov.motivo || tipoLegible,
                tercero: terceroStr,
                producto: mov.producto_nombre,
                sku: mov.sku,
                tipo_prenda: mov.tipo_prenda_nombre,
                talla: mov.talla_valor,
                color: mov.color,
                tipo_movimiento: tipoLegible,
                tipo_raw: mov.tipo_movimiento,
                entrada_cant: entradaCant,
                entrada_valor: entradaValor,
                salida_cant: salidaCant,
                salida_valor: salidaValor,
                saldo_cant: saldo.cant,
                saldo_valor: saldo.valor,
                costo_unitario: costoUnit,
                costo_promedio: costoPromedio,
                stock_actual: mov.stock_actual,
                usuario: mov.usuario_nombre,
            };
        });

        // ── Resumen del período ─────────────────────────────────────────────────
        const totalEntradas = resultado.reduce((s, r) => s + r.entrada_cant, 0);
        const totalSalidas = resultado.reduce((s, r) => s + r.salida_cant, 0);
        const totalEntradaValor = resultado.reduce((s, r) => s + r.entrada_valor, 0);
        const totalSalidaValor = resultado.reduce((s, r) => s + r.salida_valor, 0);
        const stockFinal = resultado.at(-1)?.saldo_cant ?? 0;
        const valorFinal = resultado.at(-1)?.saldo_valor ?? 0;
        // Alertas de stock bajo (sin stock_minimo en BD, se omite)
        const stockMinimos: any[] = [];

        return NextResponse.json({
            success: true,
            movimientos: resultado,
            resumen: {
                total_entradas: totalEntradas,
                total_salidas: totalSalidas,
                total_entrada_valor: totalEntradaValor,
                total_salida_valor: totalSalidaValor,
                stock_final: stockFinal,
                valor_final: valorFinal,
                stock_minimos: stockMinimos,
            }
        });
    } catch (error: any) {
        console.error('Error kardex:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST — Ajuste manual de inventario
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { producto_id, tipo_movimiento, cantidad, motivo } = body;
        if (!producto_id || !tipo_movimiento || !cantidad)
            return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 });

        const prod = await query<any[]>('SELECT id, stock_actual FROM productos WHERE id = ?', [producto_id]);
        if (!prod.length) return NextResponse.json({ success: false, error: 'Producto no encontrado' }, { status: 404 });

        const stockAnterior = Number(prod[0].stock_actual);
        const cantNum = Number(cantidad);
        const esEntrada = tipo_movimiento === 'ajuste_entrada' || tipo_movimiento === 'devolucion_entrada' || tipo_movimiento === 'traslado_entrada';
        const stockNuevo = esEntrada ? stockAnterior + cantNum : stockAnterior - cantNum;
        if (stockNuevo < 0) return NextResponse.json({ success: false, error: `Stock insuficiente. Actual: ${stockAnterior}` }, { status: 400 });

        await query(
            `INSERT INTO movimientos_inventario (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, motivo, fecha_movimiento)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [producto_id, tipo_movimiento, esEntrada ? cantNum : -cantNum, stockAnterior, stockNuevo, motivo || 'Ajuste manual']
        );
        await query('UPDATE productos SET stock_actual = ? WHERE id = ?', [stockNuevo, producto_id]);

        return NextResponse.json({ success: true, stock_nuevo: stockNuevo }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

function getTipoLegible(tipo: string): string {
    const m: Record<string, string> = {
        entrada_inicial: 'Compra',
        entrada_devolucion: 'Dev. Entrada',
        salida_venta: 'Venta',
        salida_merma: 'Merma',
        ajuste_manual: 'Ajuste',
        // legacy / otros
        entrada_compra: 'Compra',
        ajuste_entrada: 'Ajuste +',
        ajuste_salida: 'Ajuste -',
    };
    return m[tipo] || tipo;
}
