const pool = require('../config/database');

const ClienteModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query(
      `SELECT cliente_id, cliente_nombre, cliente_cedula,
              cliente_telefono, cliente_correo
       FROM cliente
       ORDER BY cliente_id ASC`
    );
    return rows;
  },
  obtenerPorId: async (id) => {
    const [rows] = await pool.query(
      `SELECT cliente_id, cliente_nombre, cliente_cedula,
              cliente_telefono, cliente_correo
       FROM cliente
       WHERE cliente_id = ?`,
      [id]
    );
    return rows[0] || null;
  }
};

module.exports = ClienteModel;