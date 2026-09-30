const pool = require('../config/database');

const ProductoModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.producto_nombre, p.producto_descripcion,
             p.producto_precio, p.categoria_id, c.categoria_nombre
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      ORDER BY p.producto_id ASC
    `);
    return rows;
  },
  obtenerPorId: async (id) => {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.producto_nombre, p.producto_descripcion,
             p.producto_precio, p.categoria_id, c.categoria_nombre
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      WHERE p.producto_id = ?
    `, [id]);
    return rows[0] || null;
  }
};

module.exports = ProductoModel;