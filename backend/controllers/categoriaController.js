const CategoriaModel = require('../models/categoriaModel');

const CategoriaController = {
  listar: async (req, res) => {
    try {
      const categorias = await CategoriaModel.obtenerTodas();
      res.json({ ok: true, total: categorias.length, data: categorias });
    } catch (error) {
      console.error('Error al listar categorías:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener las categorías',
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
      const categoria = await CategoriaModel.obtenerPorId(id);
      if (!categoria) {
        return res.status(404).json({
          ok: false,
          error: `No se encontró una categoría con ID ${id}`
        });
      }
      res.json({ ok: true, data: categoria });
    } catch (error) {
      console.error('Error al obtener categoría por ID:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener la categoría',
        detalle: error.message
      });
    }
  }
};

module.exports = CategoriaController;