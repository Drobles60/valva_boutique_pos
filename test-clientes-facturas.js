// Script de prueba para verificar clientes y sus facturas
// Ejecutar con: node test-clientes-facturas.js

async function testClientesFacturas() {
  try {
// Cambiar localhost:3000 por el puerto que estÃ©s usando
    const response = await fetch('http://localhost:3000/api/clientes/cuentas-por-cobrar?debug=true');
    const data = await response.json();
    
    if (!data.success) {
      console.error('âŒ Error:', data.error);
      return;
    }
    
// Filtrar clientes que contengan "oscar" en el nombre
    const oscars = data.data.filter(c => 
      c.nombre.toLowerCase().includes('oscar')
    );
    
oscars.forEach((cliente, index) => {
if (cliente.facturas_detalle && cliente.facturas_detalle.length > 0) {
cliente.facturas_detalle.forEach((factura, i) => {
        });
      } else {
}
    });
    
// Verificar si hay discrepancias
    oscars.forEach(cliente => {
      if (cliente.facturas_detalle) {
        const facturasEnDetalle = cliente.facturas_detalle.length;
        const facturasEnQuery = Number(cliente.cuentas_pendientes);
        
        if (facturasEnDetalle !== facturasEnQuery) {
}
      }
    });
    
  } catch (error) {
    console.error('âŒ Error al hacer la prueba:', error.message);
  }
}

testClientesFacturas();


