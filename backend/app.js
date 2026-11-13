const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
require('dotenv').config();

// Middlewares de error personalizados
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// ============================================================
// Middlewares globales
// ============================================================
app.use(cors());

// Compresión gzip/brotli → reduce ~70-85% el peso de las
// respuestas JSON de la API. No comprime < 1 KB (no vale la pena).
app.use(compression({
  level: 6,
  threshold: 1024
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// Servir imágenes subidas como archivos estáticos con cache HTTP
// maxAge 7 días + immutable: el navegador no vuelve a pedirlas.
// Los nombres de archivo incluyen timestamp+random, así que
// es seguro cachearlas "para siempre" en esa ventana.
// ============================================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  immutable: true,
  etag: true,
  lastModified: true,
  // Fallback de tipo MIME por si el sistema no reconoce .webp
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Middleware de log (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ============================================================
// Rutas de la API
// ============================================================
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/categorias', require('./routes/categoriaRoutes'));
app.use('/api/tallas', require('./routes/tallaRoutes'));
app.use('/api/colores', require('./routes/colorRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));

// Ruta raíz enriquecida
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Gissi v1.0',
    estado: 'activo',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      productos: '/api/productos',
      categorias: '/api/categorias',
      tallas: '/api/tallas',
      colores: '/api/colores',
      clientes: '/api/clientes'
    }
  });
});

// Endpoint de salud para verificar BD y estado del sistema
app.get('/api/health', async (req, res) => {
  const pool = require('./config/database');
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({
      ok: true,
      servicio: 'Gissi API',
      version: '1.0.0',
      bd: rows[0].ok === 1 ? 'conectada' : 'sin respuesta',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      servicio: 'Gissi API',
      bd: 'error',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// Manejo de errores
// ============================================================

// Middleware para rutas no encontradas (404)
app.use(notFound);

// Middleware global de manejo de errores (400, 404, 500)
app.use(errorHandler);

// ============================================================
// Arranque
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`Servidor Gissi corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Compresión: activada (gzip/brotli)`);
  console.log(`Cache de /uploads: 7 días (immutable)`);
  console.log('========================================');
});