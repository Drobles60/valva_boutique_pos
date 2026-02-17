// Script de prueba para verificar clientes y sus facturas
// Ejecutar con: node test-clientes-facturas.js

async function testClientesFacturas() {
  try {
    console.log('🔍 Probando endpoint de clientes con debug...\n');
    
    // Cambiar localhost:3000 por el puerto que estés usando
    const response = await fetch('http://localhost:3000/api/clientes/cuentas-por-cobrar?debug=true');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ Error:', data.error);
      return;
    }
    
    console.log(`✅ Total de clientes con deuda: ${data.data.length}\n`);
    
    // Filtrar clientes que contengan "oscar" en el nombre
    const oscars = data.data.filter(c => 
      c.nombre.toLowerCase().includes('oscar')
    );
    
    console.log(`🔎 Clientes con "oscar" en el nombre: ${oscars.length}\n`);
    
    oscars.forEach((cliente, index) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Cliente #${index + 1}: ${cliente.nombre}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`ID Cliente: ${cliente.id}`);
      console.log(`Identificación: ${cliente.identificacion}`);
      console.log(`Teléfono: ${cliente.telefono || 'N/A'}`);
      console.log(`Saldo Cliente: $${Number(cliente.saldo_pendiente).toLocaleString('es-CO', {minimumFractionDigits: 0})}`);
      console.log(`\nFacturas en la query agrupada:`);
      console.log(`  - Total cuentas: ${cliente.total_cuentas}`);
      console.log(`  - Cuentas pendientes: ${cliente.cuentas_pendientes}`);
      console.log(`  - Cuentas vencidas: ${cliente.cuentas_vencidas}`);
      
      if (cliente.facturas_detalle && cliente.facturas_detalle.length > 0) {
        console.log(`\n📋 Detalle de facturas (${cliente.facturas_detalle.length}):`);
        cliente.facturas_detalle.forEach((factura, i) => {
          console.log(`\n  Factura ${i + 1}:`);
          console.log(`    - Número: ${factura.numero_venta}`);
          console.log(`    - Monto Total: $${Number(factura.monto_total).toLocaleString('es-CO', {minimumFractionDigits: 0})}`);
          console.log(`    - Saldo Pendiente: $${Number(factura.saldo_pendiente).toLocaleString('es-CO', {minimumFractionDigits: 0})}`);
          console.log(`    - Estado: ${factura.estado}`);
          console.log(`    - Fecha Vencimiento: ${factura.fecha_vencimiento}`);
        });
      } else {
        console.log(`\n⚠️  No hay detalle de facturas`);
      }
    });
    
    console.log(`\n${'='.repeat(60)}\n`);
    
    // Verificar si hay discrepancias
    oscars.forEach(cliente => {
      if (cliente.facturas_detalle) {
        const facturasEnDetalle = cliente.facturas_detalle.length;
        const facturasEnQuery = Number(cliente.cuentas_pendientes);
        
        if (facturasEnDetalle !== facturasEnQuery) {
          console.log(`⚠️  DISCREPANCIA en ${cliente.nombre} (${cliente.identificacion})`);
          console.log(`   Query dice: ${facturasEnQuery} facturas`);
          console.log(`   Detalle tiene: ${facturasEnDetalle} facturas`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error al hacer la prueba:', error.message);
  }
}

testClientesFacturas();
