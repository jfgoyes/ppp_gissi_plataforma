const TallaModel = require('../models/tallaModel');

const TallaController = {
  listar: async (req, res) => {
    try {
      const tallas = await TallaModel.obtenerTodas();
      res.json({ ok: true, total: tallas.length, data: tallas });
    } catch (error) {
      console.error('Error al listar tallas:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener las tallas',
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
      const talla = await TallaModel.obtenerPorId(id);
      if (!talla) {
        return res.status(404).json({
          ok: false,
          error: `No se encontró una talla con ID ${id}`
        });
      }
      res.json({ ok: true, data: talla });
    } catch (error) {
      console.error('Error al obtener talla por ID:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener la talla',
        detalle: error.message
      });
    }
  }
};

module.exports = TallaController;