const ClienteModel = require('../models/clienteModel');
const ApiError = require('../utils/ApiError');
const validarId = require('../utils/validarId');

const ClienteController = {
  listar: async (req, res, next) => {
    try {
      const clientes = await ClienteModel.obtenerTodos();
      res.json({ ok: true, total: clientes.length, data: clientes });
    } catch (error) {
      console.error('Error al listar clientes:', error.message);
      next(new ApiError(500, 'Error al obtener los clientes'));
    }
  },

  obtenerPorId: async (req, res, next) => {
    try {
      const id = validarId(req.params.id); // Lanza ApiError(400) si el ID es inválido
      const cliente = await ClienteModel.obtenerPorId(id);

      if (!cliente) {
        throw new ApiError(404, `No se encontró un cliente con ID ${id}`);
      }

      res.json({ ok: true, data: cliente });
    } catch (error) {
      console.error('Error al obtener cliente por ID:', error.message);
      next(error);
    }
  }
};

module.exports = ClienteController;