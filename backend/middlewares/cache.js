// backend/middlewares/cache.js

/**
 * Caché simple en memoria con TTL.
 * Uso: router.get('/', cacheMiddleware(60), controller.listar);
 * donde 60 = segundos de expiración.
 */
const cacheMiddleware = (ttlSegundos = 60) => {
  const store = new Map();

  return (req, res, next) => {
    const key = req.originalUrl;

    const entrada = store.get(key);
    const ahora = Date.now();

    if (entrada && entrada.expira > ahora) {
      res.set('X-Cache', 'HIT');
      return res.json(entrada.data);
    }

    // Interceptar res.json para guardar en caché
    const jsonOriginal = res.json.bind(res);
    res.json = (body) => {
      store.set(key, {
        data: body,
        expira: Date.now() + ttlSegundos * 1000
      });
      res.set('X-Cache', 'MISS');
      return jsonOriginal(body);
    };

    next();
  };
};

module.exports = cacheMiddleware;