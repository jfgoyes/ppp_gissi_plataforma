const pool = require('../config/database');

// Subconsulta reutilizable para traer la imagen principal del producto.
// Prioriza: principal marcada > menor orden > menor id.
const SUBQUERY_IMAGEN_PRINCIPAL = `
  (SELECT pi.producto_imagen_url
   FROM producto_imagen pi
   WHERE pi.producto_id = p.producto_id
   ORDER BY pi.producto_imagen_principal DESC,
            pi.producto_imagen_orden ASC,
            pi.producto_imagen_id ASC
   LIMIT 1) AS producto_imagen
`;

const ProductoModel = {

  obtenerTodos: async () => {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.producto_nombre, p.producto_descripcion,
             p.producto_precio, p.categoria_id, c.categoria_nombre,
             p.producto_destacado,
             ${SUBQUERY_IMAGEN_PRINCIPAL}
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      ORDER BY p.producto_id ASC
    `);
    return rows;
  },

  obtenerPorId: async (id) => {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.producto_nombre, p.producto_descripcion,
             p.producto_precio, p.categoria_id, c.categoria_nombre,
             p.producto_destacado,
             ${SUBQUERY_IMAGEN_PRINCIPAL}
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      WHERE p.producto_id = ?
    `, [id]);
    return rows[0] || null;
  },

  obtenerDestacados: async () => {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.producto_nombre, p.producto_descripcion,
             p.producto_precio, p.categoria_id, c.categoria_nombre,
             p.producto_destacado,
             ${SUBQUERY_IMAGEN_PRINCIPAL}
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      WHERE p.producto_destacado = TRUE
      ORDER BY p.producto_id ASC
    `);
    return rows;
  },

  // Crear y actualizar (sin tocar imágenes)

  crear: async (datos) => {
    const {
      producto_nombre,
      producto_descripcion,
      producto_precio,
      categoria_id,
      producto_destacado
    } = datos;

    const [result] = await pool.query(`
      INSERT INTO producto
        (producto_nombre, producto_descripcion, producto_precio,
         categoria_id, producto_destacado)
      VALUES (?, ?, ?, ?, ?)
    `, [
      producto_nombre,
      producto_descripcion,
      producto_precio,
      categoria_id,
      producto_destacado ? 1 : 0
    ]);

    return result.insertId;
  },

  actualizar: async (id, datos) => {
    const {
      producto_nombre,
      producto_descripcion,
      producto_precio,
      categoria_id,
      producto_destacado
    } = datos;

    const [result] = await pool.query(`
      UPDATE producto SET
        producto_nombre = ?,
        producto_descripcion = ?,
        producto_precio = ?,
        categoria_id = ?,
        producto_destacado = ?
      WHERE producto_id = ?
    `, [
      producto_nombre,
      producto_descripcion,
      producto_precio,
      categoria_id,
      producto_destacado ? 1 : 0,
      id
    ]);

    return result.affectedRows;
  }
};

module.exports = ProductoModel;