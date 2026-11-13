// backend/utils/validarTexto.js
const ApiError = require('./ApiError');

/**
 * Valida y sanitiza un campo de texto.
 * - Recorta espacios.
 * - Verifica longitud mínima/máxima.
 * - Opcionalmente verifica que no esté vacío.
 */
const validarTexto = (valor, { campo, min = 1, max = 300, requerido = true } = {}) => {
  if (valor === undefined || valor === null) {
    if (requerido) throw new ApiError(400, `El campo '${campo}' es obligatorio`);
    return null;
  }
  const texto = String(valor).trim();
  if (requerido && texto.length < min) {
    throw new ApiError(400, `El campo '${campo}' debe tener al menos ${min} caracteres`);
  }
  if (texto.length > max) {
    throw new ApiError(400, `El campo '${campo}' no puede exceder ${max} caracteres`);
  }
  return texto;
};

module.exports = validarTexto;