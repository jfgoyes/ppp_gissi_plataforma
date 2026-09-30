const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/productoController');

router.get('/', ProductoController.listar);
router.get('/:id', ProductoController.obtenerPorId);

module.exports = router;