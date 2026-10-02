const ColorModel = require('../models/colorModel');
const ApiError = require('../utils/ApiError');
const validarId = require('../utils/validarId');

const ColorController = {
  listar: async (req, res, next) => {
    try {
      const colores = await ColorModel.obtenerTodos();
      res.json({ ok: true, total: colores.length, data: colores });
    } catch (error) {
      console.error('Error al listar colores:', error.message);
      next(new ApiError(500, 'Error al obtener los colores'));
    }
  },

  obtenerPorId: async (req, res, next) => {
    try {
      const id = validarId(req.params.id); // Lanza ApiError(400) si el ID es inválido
      const color = await ColorModel.obtenerPorId(id);

      if (!color) {
        throw new ApiError(404, `No se encontró un color con ID ${id}`);
      }

      res.json({ ok: true, data: color });
    } catch (error) {
      console.error('Error al obtener color por ID:', error.message);
      next(error);
    }
  }
};

module.exports = ColorController;