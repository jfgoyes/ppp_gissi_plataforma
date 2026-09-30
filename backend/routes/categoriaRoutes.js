const express = require('express');
const router = express.Router();
const CategoriaController = require('../controllers/categoriaController');

router.get('/', CategoriaController.listar);
router.get('/:id', CategoriaController.obtenerPorId);

module.exports = router;