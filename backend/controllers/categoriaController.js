const CategoriaModel = require('../models/categoriaModel');
const ApiError = require('../utils/ApiError');
const validarId = require('../utils/validarId');

const CategoriaController = {
  listar: async (req, res, next) => {
    try {
      const categorias = await CategoriaModel.obtenerTodas();
      res.json({ ok: true, total: categorias.length, data: categorias });
    } catch (error) {
      console.error('Error al listar categorías:', error.message);
      next(new ApiError(500, 'Error al obtener las categorías'));
    }
  },

  obtenerPorId: async (req, res, next) => {
    try {
      const id = validarId(req.params.id); // Lanza ApiError(400) si el ID es inválido
      const categoria = await CategoriaModel.obtenerPorId(id);

      if (!categoria) {
        throw new ApiError(404, `No se encontró una categoría con ID ${id}`);
      }

      res.json({ ok: true, data: categoria });
    } catch (error) {
      console.error('Error al obtener categoría por ID:', error.message);
      next(error);
    }
  }
};

module.exports = CategoriaController;