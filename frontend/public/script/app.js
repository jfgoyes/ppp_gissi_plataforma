/* ============================================================
   PLATAFORMA WEB GISSI — app.js
   Conexión con el backend mediante Fetch API
   ============================================================ */

// ============================================================
// 1. CONFIGURACIÓN
// ============================================================

const API_URL = 'http://localhost:3000/api';

// ============================================================
// 2. FUNCIÓN PARA OBTENER PRODUCTOS
// ============================================================

const obtenerProductos = async () => {
  try {
    const response = await fetch(`${API_URL}/productos`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Respuesta del backend:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    return null;
  }
};

// ============================================================
// 3. PRUEBA INICIAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('app.js cargado correctamente');
  obtenerProductos();
});