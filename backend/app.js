// ============================================
// Servidor Express - Plataforma Gissi
// ============================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Crear instancia de Express
const app = express();

// ============================================
// Middlewares globales
// ============================================
app.use(cors());              // Permite peticiones desde el frontend
app.use(express.json());      // Parsea el body en formato JSON

// Middleware de log (opcional para desarrollo)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// Ruta raíz de prueba
// ============================================
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Gissi v1.0',
    estado: 'activo',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Manejo de rutas no encontradas (404)
// ============================================
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ============================================
// Arranque del servidor
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('========================================');
  console.log(`Servidor Gissi corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
});