const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/clienteController');

router.get('/', ClienteController.listar);
router.get('/:id', ClienteController.obtenerPorId);

module.exports = router;