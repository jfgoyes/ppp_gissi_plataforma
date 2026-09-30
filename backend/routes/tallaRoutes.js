const express = require('express');
const router = express.Router();
const TallaController = require('../controllers/tallaController');

router.get('/', TallaController.listar);
router.get('/:id', TallaController.obtenerPorId);

module.exports = router;