const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Middleware de log (desarrollo)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
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

// Manejo global de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('========================================');
  console.log(`Servidor Gissi corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
});