const ProductoModel = require('../models/productoModel');
const ApiError = require('../utils/ApiError');
const validarId = require('../utils/validarId');

const ProductoController = {
  listar: async (req, res, next) => {
    try {
      const productos = await ProductoModel.obtenerTodos();
      res.json({ ok: true, total: productos.length, data: productos });
    } catch (error) {
      console.error('Error al listar productos:', error.message);
      next(new ApiError(500, 'Error al obtener los productos'));
    }
  },

  obtenerPorId: async (req, res, next) => {
    try {
      const id = validarId(req.params.id); // Lanza 400 si el ID es inválido
      const producto = await ProductoModel.obtenerPorId(id);

      if (!producto) {
        throw new ApiError(404, `No se encontró un producto con ID ${id}`);
      }

      res.json({ ok: true, data: producto });
    } catch (error) {
      console.error('Error al obtener producto por ID:', error.message);
      next(error);
    }
  }
};

module.exports = ProductoController;