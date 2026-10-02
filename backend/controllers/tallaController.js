const TallaModel = require('../models/tallaModel');
const ApiError = require('../utils/ApiError');
const validarId = require('../utils/validarId');

const TallaController = {
  listar: async (req, res, next) => {
    try {
      const tallas = await TallaModel.obtenerTodas();
      res.json({ ok: true, total: tallas.length, data: tallas });
    } catch (error) {
      console.error('Error al listar tallas:', error.message);
      next(new ApiError(500, 'Error al obtener las tallas'));
    }
  },

  obtenerPorId: async (req, res, next) => {
    try {
      const id = validarId(req.params.id); // Lanza ApiError(400) si el ID es inválido
      const talla = await TallaModel.obtenerPorId(id);

      if (!talla) {
        throw new ApiError(404, `No se encontró una talla con ID ${id}`);
      }

      res.json({ ok: true, data: talla });
    } catch (error) {
      console.error('Error al obtener talla por ID:', error.message);
      next(error);
    }
  }
};

module.exports = TallaController;