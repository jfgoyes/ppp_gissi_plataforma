// backend/middlewares/errorHandler.js
const fs = require('fs');
const path = require('path');
const ApiError = require('../utils/ApiError');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'errores.log');

// Crear carpeta logs si no existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const registrarError = (err, req, statusCode) => {
  const linea = JSON.stringify({
    fecha: new Date().toISOString(),
    status: statusCode,
    metodo: req.method,
    ruta: req.originalUrl,
    mensaje: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
  // Consola
  console.error(`[ERROR ${statusCode}] ${req.method} ${req.originalUrl} → ${err.message}`);
  // Archivo (append, no bloquea respuesta)
  fs.appendFile(LOG_FILE, linea + '\n', (e) => {
    if (e) console.error('No se pudo escribir log de error:', e.message);
  });
};

// Middleware para rutas no encontradas (404)
const notFound = (req, res, next) => {
  next(new ApiError(404, `Ruta no encontrada: ${req.originalUrl}`));
};

// Middleware global de manejo de errores
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  registrarError(err, req, statusCode);

  res.status(statusCode).json({
    ok: false,
    error: message,
    status: statusCode,
    path: req.originalUrl
  });
};

module.exports = { notFound, errorHandler };