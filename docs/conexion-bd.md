# Módulo de Conexión a MySQL - Gissi

## Ubicación

`backend/config/database.js`

## Uso

```javascript
const pool = require('../config/database');

const [rows] = await pool.query('SELECT * FROM producto');
```

## Parámetros del pool

| **Parámetro**           | **Valor** | **Descripción**                  |
| :---------------------- | :-------- | :------------------------------- |
| `connectionLimit`       | `10`      | Máximo de conexiones simultáneas |
| `waitForConnections`    | `true`    | Espera conexiones disponibles    |
| `queueLimit`            | `0`       | Sin límite de peticiones en cola |
| `enableKeepAlive`       | `true`    | Mantiene las conexiones activas  |
| `keepAliveInitialDelay` | `0`       | Sin retraso inicial de keep-alive |

## Manejo de errores

El módulo captura errores de conexión y los reporta con mensajes claros:

- `ER_ACCESS_DENIED_ERROR`: credenciales incorrectas.
- `ER_BAD_DB_ERROR`: base de datos inexistente.
- `ECONNREFUSED`: servidor MySQL detenido.

## Ejemplo de uso en un modelo

```javascript
// backend/models/productoModel.js
const pool = require('../config/database');

const obtenerTodos = async () => {
  const [rows] = await pool.query('SELECT * FROM producto');
  return rows;
};

module.exports = { obtenerTodos };
```

## Resumen de acciones en VS Code

| # | Acción | Ubicación |
|---|--------|-----------|
| 1 | Verificar/crear `.env` | `backend/.env` |
| 2 | Crear carpeta `config/` | `backend/config/` |
| 3 | Crear archivo `database.js` | `backend/config/database.js` |
| 4 | Crear archivo `test-connection.js` | `backend/test-connection.js` |
| 5 | Actualizar script `test-db` | `backend/package.json` |
| 6 | Crear documentación | `docs/conexion-bd.md` |
| 7 | Ejecutar `npm run test-db` | Terminal integrada |
| 8 | Simular errores (opcional) | Modificando `.env` temporalmente |

## Verificación final

Una vez completado todo, tu proyecto debe:

1. Tener el módulo `config/database.js` con pool de conexiones.
2. Responder correctamente a `npm run test-db` con las 4 pruebas.
3. Manejar errores con mensajes claros (códigos `ER_*` y `ECONNREFUSED`).
4. Estar documentado en `docs/conexion-bd.md`.
5. Mantener el servidor Express funcionando (`npm run dev`).

## Integración con la actividad anterior

Este módulo será la base para los modelos del backend. En la siguiente actividad (probablemente rutas y controladores), podrás hacer:

```javascript
// backend/routes/productos.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM producto');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```
