// ============================================
// Módulo de conexión a MySQL con pool
// Plataforma Gissi
// ============================================

const mysql = require('mysql2');
require('dotenv').config();

// ============================================
// Configuración del pool de conexiones
// ============================================
const pool = mysql.createPool({
  host: process.env.DB_HOST,           // Dirección del servidor MySQL
  user: process.env.DB_USER,           // Usuario de la base de datos
  password: process.env.DB_PASSWORD,   // Contraseña del usuario
  database: process.env.DB_NAME,       // Nombre de la base de datos
  port: process.env.DB_PORT,           // Puerto de MySQL (3306)
  waitForConnections: true,            // Espera si no hay conexiones disponibles
  connectionLimit: 10,                 // Máximo 10 conexiones simultáneas
  queueLimit: 0,                       // Sin límite de peticiones en cola
  enableKeepAlive: true,               // Mantiene las conexiones activas
  keepAliveInitialDelay: 0             // Sin retraso inicial de keep-alive
});

// Exportar el pool con soporte para promesas (async/await)
module.exports = pool.promise();