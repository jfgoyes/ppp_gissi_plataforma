const mysql = require('mysql2');
require('dotenv').config();

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

conexion.connect((error) => {
  if (error) {
    console.error('Error de conexión:', error.message);
    return;
  }
  console.log('Conexión inicial a MySQL establecida');
});

conexion.query('SELECT COUNT(*) AS total FROM producto', (error, resultados) => {
  if (error) {
    console.error('Error en la consulta:', error.message);
    return;
  }
  console.log('Total de productos:', resultados[0].total);
  conexion.end();
});