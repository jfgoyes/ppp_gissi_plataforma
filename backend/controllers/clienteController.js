const ClienteModel = require('../models/clienteModel');

const ClienteController = {
  listar: async (req, res) => {
    try {
      const clientes = await ClienteModel.obtenerTodos();
      res.json({ ok: true, total: clientes.length, data: clientes });
    } catch (error) {
      console.error('Error al listar clientes:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener los clientes',
        detalle: error.message
      });
    }
  },
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          ok: false,
          error: 'El ID debe ser un número entero positivo'
        });
      }
      const cliente = await ClienteModel.obtenerPorId(id);
      if (!cliente) {
        return res.status(404).json({
          ok: false,
          error: `No se encontró un cliente con ID ${id}`
        });
      }
      res.json({ ok: true, data: cliente });
    } catch (error) {
      console.error('Error al obtener cliente por ID:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener el cliente',
        detalle: error.message
      });
    }
  }
};

module.exports = ClienteController;