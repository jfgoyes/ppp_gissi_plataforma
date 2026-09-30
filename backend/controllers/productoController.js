const ProductoModel = require('../models/productoModel');

const ProductoController = {
  listar: async (req, res) => {
    try {
      const productos = await ProductoModel.obtenerTodos();
      res.json({ ok: true, total: productos.length, data: productos });
    } catch (error) {
      console.error('Error al listar productos:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener los productos',
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
      const producto = await ProductoModel.obtenerPorId(id);
      if (!producto) {
        return res.status(404).json({
          ok: false,
          error: `No se encontró un producto con ID ${id}`
        });
      }
      res.json({ ok: true, data: producto });
    } catch (error) {
      console.error('Error al obtener producto por ID:', error.message);
      res.status(500).json({
        ok: false,
        error: 'Error al obtener el producto',
        detalle: error.message
      });
    }
  }
};

module.exports = ProductoController;