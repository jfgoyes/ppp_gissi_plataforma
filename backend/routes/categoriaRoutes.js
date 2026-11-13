const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/categoriaController');
const cacheMiddleware = require('../middlewares/cache');

router.get('/', cacheMiddleware(300), CategoriaController.listar);
router.get('/:id', CategoriaController.obtenerPorId);

module.exports = router;