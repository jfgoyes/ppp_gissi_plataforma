const pool = require('../config/database');

const TallaModel = {
  obtenerTodas: async () => {
    const [rows] = await pool.query(
      'SELECT talla_id, talla_nombre FROM talla ORDER BY talla_id ASC'
    );
    return rows;
  },
  obtenerPorId: async (id) => {
    const [rows] = await pool.query(
      'SELECT talla_id, talla_nombre FROM talla WHERE talla_id = ?',
      [id]
    );
    return rows[0] || null;
  }
};

module.exports = TallaModel;