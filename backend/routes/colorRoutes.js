const express = require('express');
const router = express.Router();
const ColorController = require('../controllers/colorController');

router.get('/', ColorController.listar);
router.get('/:id', ColorController.obtenerPorId);

module.exports = router;