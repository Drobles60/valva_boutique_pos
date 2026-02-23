// Script de prueba para abonar a un proveedor
// Este script demuestra cÃ³mo el abono se distribuye entre los pedidos del proveedor

const proveedorId = 2; // ID del proveedor "ropa"
const montoAbono = 2500000; // $2,500,000 COP

====================================
PRUEBA DE ABONO A PROVEEDOR
====================================

Proveedor ID: ${proveedorId}
Monto a Abonar: $${montoAbono.toLocaleString('es-CO')}

`);

// Para probar, ejecuta:
// curl -X POST http://localhost:3000/api/proveedores/2/abonos \
//   -H "Content-Type: application/json" \
//   -d '{"monto": 2500000, "metodoPago": "transferencia", "referencia": "TRANS-001", "notas": "Abono parcial"}'

COMANDO DE PRUEBA (ejecuta en PowerShell):
------------------------------------------

$body = @{
    monto = ${montoAbono}
    metodoPago = "transferencia"
    referencia = "TRANS-001"
    notas = "Abono parcial a proveedor"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/proveedores/${proveedorId}/abonos" \`
  -Method POST \`
  -ContentType "application/json" \`
  -Body $body

------------------------------------------

CÃ“MO FUNCIONA LA DISTRIBUCIÃ“N:
1. Se obtienen todos los pedidos con saldo pendiente del proveedor (ordenados por fecha)
2. El monto se aplica primero al pedido mÃ¡s antiguo
3. Si sobra dinero despuÃ©s de pagar un pedido, se pasa al siguiente
4. El proceso continÃºa hasta que se acabe el monto o se paguen todos los pedidos

EJEMPLO CON EL PROVEEDOR "ropa":
- PED-001: Saldo $1,000,000 â†’ Se abona $1,000,000 (PAGADO)
- PED-002: Saldo $1,000,000 â†’ Se abona $1,000,000 (PAGADO)  
- PED-003: Saldo $45,222,222 â†’ Se abona $500,000 (quedan $44,722,222)

Total abonado: $2,500,000
`);

