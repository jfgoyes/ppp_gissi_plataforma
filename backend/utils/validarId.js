// backend/utils/validarId.js
const ApiError = require('./ApiError');

const validarId = (id) => {
  const idNum = parseInt(id, 10);
  if (isNaN(idNum) || idNum <= 0) {
    throw new ApiError(400, `ID inválido: '${id}'. Debe ser un número entero positivo.`);
  }
  return idNum;
};

module.exports = validarId;