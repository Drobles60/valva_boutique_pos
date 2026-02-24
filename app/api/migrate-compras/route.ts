// @ts-nocheck
/**
 * POST /api/migrate-compras
 * Crea las tablas compras y compra_detalle si no existen
 */
import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS compras (
        id               INT AUTO_INCREMENT PRIMARY KEY,
        numero_compra    VARCHAR(30) UNIQUE,
        proveedor_id     INT,
        factura_numero   VARCHAR(100),
        fecha            DATE NOT NULL,
        fecha_vencimiento DATE,
        tipo_pago        ENUM('contado','credito','mixto') DEFAULT 'contado',
        subtotal         DECIMAL(12,2) DEFAULT 0,
        descuento_total  DECIMAL(12,2) DEFAULT 0,
        iva_total        DECIMAL(12,2) DEFAULT 0,
        otros_costos     DECIMAL(12,2) DEFAULT 0,
        total            DECIMAL(12,2) DEFAULT 0,
        abono_inicial    DECIMAL(12,2) DEFAULT 0,
        estado           ENUM('borrador','confirmada','anulada') DEFAULT 'borrador',
        usuario_id       INT,
        observaciones    TEXT,
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_proveedor (proveedor_id),
        INDEX idx_estado (estado),
        INDEX idx_fecha (fecha)
      )
    `)

    await query(`
      CREATE TABLE IF NOT EXISTS compra_detalle (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        compra_id      INT NOT NULL,
        producto_id    INT NOT NULL,
        cantidad       INT NOT NULL DEFAULT 1,
        costo_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
        descuento_pct  DECIMAL(5,2) DEFAULT 0,
        iva_pct        DECIMAL(5,2) DEFAULT 0,
        subtotal       DECIMAL(12,2) DEFAULT 0,
        total          DECIMAL(12,2) DEFAULT 0,
        INDEX idx_compra (compra_id),
        INDEX idx_producto (producto_id)
      )
    `)

    return NextResponse.json({ success: true, message: 'Tablas compras y compra_detalle creadas/verificadas correctamente.' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
