USE valva_boutique;

ALTER TABLE movimientos_inventario 
MODIFY COLUMN tipo_movimiento ENUM('entrada_inicial', 'entrada_devolucion', 'salida_venta', 'salida_merma', 'ajuste_manual') NOT NULL;

SELECT 'Tabla movimientos_inventario actualizada' as mensaje;
