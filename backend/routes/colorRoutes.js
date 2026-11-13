const express = require('express');
const router = express.Router();
const ColorController = require('../controllers/colorController');
const cacheMiddleware = require('../middlewares/cache');

router.get('/', cacheMiddleware(300), ColorController.listar);
router.get('/:id', ColorController.obtenerPorId);

module.exports = router;