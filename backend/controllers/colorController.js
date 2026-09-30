const ColorModel = require('../models/colorModel');

const ColorController = {
  listar: async (req, res) => {
    try {
      const colores = await ColorModel.obtenerTodos();
      res.json({ ok: true, total: colores.length, data: colores });
    } catch (error) {
      console.error('Error al listar colores:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener los colores',
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
      const color = await ColorModel.obtenerPorId(id);
      if (!color) {
        return res.status(404).json({
          ok: false,
          error: `No se encontró un color con ID ${id}`
        });
      }
      res.json({ ok: true, data: color });
    } catch (error) {
      console.error('Error al obtener color por ID:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener el color',
        detalle: error.message
      });
    }
  }
};

module.exports = ColorController;