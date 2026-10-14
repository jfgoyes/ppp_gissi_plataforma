const express = require('express');
const router  = express.Router();

const ProductoController = require('../controllers/productoController');
const upload             = require('../config/multer');

// ============================================================
// Productos
// ============================================================
router.get('/',              ProductoController.listar);
router.get('/destacados',    ProductoController.listarDestacados);
router.get('/:id',           ProductoController.obtenerPorId);
router.get('/:id/detalle',   ProductoController.obtenerConImagenes);   // con galería
router.post('/',             upload.single('imagen'), ProductoController.crear);
router.put('/:id',           ProductoController.actualizar);

// ============================================================
// Imágenes del producto
// ============================================================
router.get('/:id/imagenes',
  ProductoController.listarImagenes);

router.post('/:id/imagenes',
  upload.single('imagen'),
  ProductoController.agregarImagen);

router.delete('/:id/imagenes/:imagenId',
  ProductoController.eliminarImagen);

router.put('/:id/imagenes/:imagenId/principal',
  ProductoController.marcarImagenPrincipal);

module.exports = router;