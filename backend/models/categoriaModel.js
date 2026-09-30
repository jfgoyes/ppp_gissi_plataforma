const pool = require('../config/database');

const CategoriaModel = {
  obtenerTodas: async () => {
    const [rows] = await pool.query(
      'SELECT categoria_id, categoria_nombre, categoria_descripcion FROM categoria ORDER BY categoria_id ASC'
    );
    return rows;
  },
  obtenerPorId: async (id) => {
    const [rows] = await pool.query(
      'SELECT categoria_id, categoria_nombre, categoria_descripcion FROM categoria WHERE categoria_id = ?',
      [id]
    );
    return rows[0] || null;
  }
};

module.exports = CategoriaModel;