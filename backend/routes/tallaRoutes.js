const express = require('express');
const router = express.Router();
const TallaController = require('../controllers/tallaController');
const cacheMiddleware = require('../middlewares/cache');

router.get('/', cacheMiddleware(300), TallaController.listar);
router.get('/:id', TallaController.obtenerPorId);

module.exports = router;