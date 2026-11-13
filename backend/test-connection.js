// ============================================
// Prueba de conexión y consultas al pool
// Plataforma Gissi
// ============================================

const pool = require('./config/database');

async function probarConexion() {
  console.log('========================================');
  console.log('Prueba de conexión a MySQL - Gissi');
  console.log('========================================');

  try {
    // Prueba 1: consulta simple
    const [resultado] = await pool.query('SELECT 1 + 1 AS resultado');
    console.log('Prueba 1 - Consulta simple:', resultado[0].resultado === 2 ? 'OK' : 'FALLO');

    // Prueba 2: contar productos
    const [productos] = await pool.query('SELECT COUNT(*) AS total FROM producto');
    console.log('Prueba 2 - Total de productos:', productos[0].total);

    // Prueba 3: contar categorías
    const [categorias] = await pool.query('SELECT COUNT(*) AS total FROM categoria');
    console.log('Prueba 3 - Total de categorías:', categorias[0].total);

    // Prueba 4: consulta con JOIN
    const [detalle] = await pool.query(`
      SELECT p.producto_nombre, c.categoria_nombre, p.producto_precio
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      LIMIT 3
    `);
    console.log('Prueba 4 - Primeros 3 productos con su categoría:');
    detalle.forEach((fila) => {
      console.log(`  - ${fila.producto_nombre} (${fila.categoria_nombre}): $${fila.producto_precio}`);
    });

    // Prueba 5: EXPLAIN de la consulta principal de productos
    const [explain] = await pool.query(`
      EXPLAIN SELECT p.producto_id, p.producto_nombre, p.producto_precio
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      ORDER BY p.producto_id ASC
    `);
    console.log('Prueba 5 - Plan de ejecución (EXPLAIN):');
    explain.forEach(fila => {
      console.log(`  - tabla=${fila.table} tipo=${fila.type} key=${fila.key || 'NULL'} filas=${fila.rows}`);
    });

    console.log('========================================');
    console.log('Todas las pruebas fueron exitosas');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('========================================');
    console.error('Error en la prueba de conexión');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code || 'N/A');
    console.error('========================================');
    process.exit(1);
  }
}

probarConexion();