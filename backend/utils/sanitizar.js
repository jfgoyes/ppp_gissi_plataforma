// backend/utils/sanitizar.js

/**
 * Sanitiza un string para uso seguro en logs/HTML.
 * NO reemplaza las consultas parametrizadas (esas ya son seguras).
 * Elimina caracteres de control y limita longitud.
 */
const sanitizarString = (valor, maxLen = 500) => {
  if (valor === undefined || valor === null) return valor;
  return String(valor)
    .replace(/[\u0000-\u001F\u007F]/g, '') // caracteres de control
    .trim()
    .slice(0, maxLen);
};

/**
 * Sanitiza un objeto completo (shallow).
 */
const sanitizarObjeto = (obj, maxLen = 500) => {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = typeof v === 'string' ? sanitizarString(v, maxLen) : v;
  }
  return out;
};

module.exports = { sanitizarString, sanitizarObjeto };