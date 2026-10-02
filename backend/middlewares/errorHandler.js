// backend/middlewares/errorHandler.js
const ApiError = require('../utils/ApiError');

// Middleware para rutas no encontradas (404)
const notFound = (req, res, next) => {
  next(new ApiError(404, `Ruta no encontrada: ${req.originalUrl}`));
};

// Middleware global de manejo de errores
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  // Log del error en consola para depuración
  console.error(`[ERROR ${statusCode}] ${message}`);

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    path: req.originalUrl
  });
};

module.exports = { notFound, errorHandler };