const pool = require('../config/database');

const ColorModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query(
      'SELECT color_id, color_nombre FROM color ORDER BY color_id ASC'
    );
    return rows;
  },
  obtenerPorId: async (id) => {
    const [rows] = await pool.query(
      'SELECT color_id, color_nombre FROM color WHERE color_id = ?',
      [id]
    );
    return rows[0] || null;
  }
};

module.exports = ColorModel;