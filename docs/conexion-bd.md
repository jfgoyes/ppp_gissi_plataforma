# Módulo de Conexión a MySQL - Gissi

**Proyecto:** Plataforma Web para la Asociación de Economía Solidaria Los Pastos  
**Archivo:** `backend/config/database.js`  
**Versión:** 1.1  

---

## 1. Objetivo

Documentar el módulo de conexión a MySQL de la plataforma Gissi: la configuración del pool de conexiones, los parámetros aplicados, los códigos de error esperados, el patrón de uso en los modelos, las pruebas de verificación (`test-connection.js`) y el endpoint de salud (`/api/health`).

---

## 2. Ubicación

```text
backend/
└── config/
    └── database.js
```

El módulo exporta un **pool promisificado** que se reutiliza en todos los modelos del backend.

---

## 3. Implementación

```javascript
// backend/config/database.js

const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

module.exports = pool.promise();
```

- `mysql2` se utiliza en modo **promesa**: `pool.promise()`.
- Las credenciales se leen desde `.env` (ver `README.md`, sección *Configuración y ejecución*).
- El pool se crea una sola vez al arrancar el backend y se reutiliza durante toda la vida del proceso.

---

## 4. Parámetros del Pool

| Parámetro | Valor | Descripción |
|---|---|---|
| `host` | `process.env.DB_HOST` | Dirección del servidor MySQL. |
| `user` | `process.env.DB_USER` | Usuario de la base de datos. |
| `password` | `process.env.DB_PASSWORD` | Contraseña del usuario. |
| `database` | `process.env.DB_NAME` | Nombre de la base de datos (`gissi_plataforma_db`). |
| `port` | `process.env.DB_PORT` | Puerto de MySQL (por defecto `3306`). |
| `waitForConnections` | `true` | Si no hay conexiones libres, la petición espera en cola. |
| `connectionLimit` | `10` | Máximo de conexiones simultáneas en el pool. |
| `queueLimit` | `0` | Sin límite de peticiones en cola. |
| `enableKeepAlive` | `true` | Envía paquetes de keep-alive para evitar conexiones cerradas por el servidor. |
| `keepAliveInitialDelay` | `0` | Sin retraso inicial para enviar el primer keep-alive. |

### 4.1 Justificación de los valores

- **`connectionLimit: 10`**: suficiente para el volumen de la plataforma (catálogo, detalle y carrito). Evita abrir conexiones innecesarias al servidor.
- **`waitForConnections: true` + `queueLimit: 0`**: si las 10 conexiones están ocupadas, las peticiones entrantes se encolan en lugar de fallar.
- **`enableKeepAlive: true`**: MySQL cierra conexiones inactivas por defecto (`wait_timeout`, típicamente 8 h). El keep-alive evita reconexiones y errores `ECONNRESET`.

---

## 5. Uso desde los Modelos

Todos los modelos importan el pool y ejecutan **consultas parametrizadas** (`?`), lo que previene inyección SQL:

```javascript
// backend/models/productoModel.js
const pool = require('../config/database');

const obtenerTodos = async () => {
  const [rows] = await pool.query(`
    SELECT p.producto_id, p.producto_nombre, ...
    FROM producto p
    INNER JOIN categoria c ON p.categoria_id = c.categoria_id
    ORDER BY p.producto_id ASC
  `);
  return rows;
};

const obtenerPorId = async (id) => {
  const [rows] = await pool.query(
    'SELECT ... FROM producto WHERE producto_id = ?',
    [id]
  );
  return rows[0] || null;
};
```

### 5.1 Modelos que usan el pool

| Modelo | Operaciones principales |
|---|---|
| `productoModel` | Listar, por ID, destacados, detalle completo, crear, actualizar. |
| `productoImagenModel` | Listar por producto, obtener principal, crear, eliminar, marcar principal, contar. |
| `categoriaModel` | Listar todas, por ID. |
| `clienteModel` | Listar todos, por ID. |
| `colorModel` | Listar todos, por ID. |
| `tallaModel` | Listar todas, por ID. |

### 5.2 Patrón de consulta

```javascript
// SELECT
const [rows] = await pool.query('SELECT ... WHERE col = ?', [valor]);

// INSERT
const [result] = await pool.query(
  'INSERT INTO tabla (col1, col2) VALUES (?, ?)',
  [valor1, valor2]
);
const nuevoId = result.insertId;

// UPDATE
const [result] = await pool.query(
  'UPDATE tabla SET col = ? WHERE id = ?',
  [valor, id]
);
const filasAfectadas = result.affectedRows;

// DELETE
const [result] = await pool.query(
  'DELETE FROM tabla WHERE id = ?',
  [id]
);
const filasBorradas = result.affectedRows;
```

### 5.3 Sin transacciones explícitas

El pool expone `pool.getConnection()` para transacciones manuales, pero el proyecto actual **no las utiliza**: cada operación es independiente. Esto es suficiente para el estado actual (sin pedidos ni operaciones multi-tabla críticas). Si en el futuro se implementan pedidos con `detalle_pedido`, conviene introducir transacciones:

```javascript
// Ejemplo futuro (no implementado aún)
const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  await conn.query('INSERT INTO pedido ...', [...]);
  await conn.query('INSERT INTO detalle_pedido ...', [...]);
  await conn.commit();
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  conn.release();
}
```

---

## 6. Relación con la Caché

El pool solo se consulta cuando el middleware de caché **no** tiene una respuesta vigente:

```text
GET /api/productos
   │
   ▼
cacheMiddleware(60)
   ├── HIT  → responde desde memoria (no toca MySQL)
   └── MISS → controller → model → pool.query(...)
```

- Los endpoints con caché (`/productos`, `/productos/destacados`, `/categorias`, `/tallas`, `/colores`) reducen la presión sobre el pool.
- Los endpoints sin caché (`/:id`, `/detalle`, `/clientes`, escrituras) consultan MySQL en cada petición.

---

## 7. Manejo de Errores de Conexión

El pool propaga los errores de `mysql2` a los controladores. Los códigos más comunes:

| Código | Causa | Solución |
|---|---|---|
| `ER_ACCESS_DENIED_ERROR` | Usuario/contraseña incorrectos. | Revisar `DB_USER` y `DB_PASSWORD` en `.env`. |
| `ER_BAD_DB_ERROR` | La base de datos no existe. | Ejecutar `database/init.sql`. |
| `ECONNREFUSED` | El servidor MySQL no está en ejecución. | Iniciar el servicio MySQL. |
| `ETIMEDOUT` | Host/puerto inaccesible. | Verificar `DB_HOST` y `DB_PORT`. |
| `ECONNRESET` | Conexión cerrada por el servidor. | Verificar `enableKeepAlive` (ya está activo). |
| `ER_NO_SUCH_TABLE` | Tabla faltante. | Ejecutar `database/init.sql`. |

### 7.1 Flujo de errores en el backend

```text
pool.query(...) → error
   │
   ▼
modelo (propaga)
   │
   ▼
controlador (catch)
   │ console.error(...)
   │ next(new ApiError(500, '...')) o next(error)
   ▼
errorHandler
   │ registrarError(...)
   │ respuesta { ok:false, error, status, path }
   ▼
logs/errores.log (JSON por línea)
```

---

## 8. Verificación de la Conexión

### 8.1 Script `test-connection.js`

El script `backend/test-connection.js` valida la conexión y las consultas principales:

| # | Prueba | Consulta |
|---|---|---|
| 1 | Consulta simple | `SELECT 1 + 1 AS resultado` |
| 2 | Conteo de productos | `SELECT COUNT(*) FROM producto` |
| 3 | Conteo de categorías | `SELECT COUNT(*) FROM categoria` |
| 4 | JOIN producto + categoría | `INNER JOIN ... LIMIT 3` |
| 5 | Plan de ejecución | `EXPLAIN SELECT ... FROM producto INNER JOIN categoria ...` |

**Ejecución** (desde `backend/`):

```bash
npm run test-db
```

**Salida esperada:**

```text
========================================
Prueba de conexión a MySQL - Gissi
========================================
Prueba 1 - Consulta simple: OK
Prueba 2 - Total de productos: 20
Prueba 3 - Total de categorías: 4
Prueba 4 - Primeros 3 productos con su categoría:
  - Producto 1 (Personalizada): $10.00
  - Producto 2 (Personalizada): $20.00
  - Producto 3 (Personalizada): $30.00
Prueba 5 - Plan de ejecución (EXPLAIN):
  - tabla=producto tipo=... key=... filas=...
  - tabla=categoria tipo=... key=PRIMARY filas=...
========================================
Todas las pruebas fueron exitosas
========================================
```

**En caso de error:**

```text
========================================
Error en la prueba de conexión
Mensaje: <mensaje del error>
Código: <código mysql2>
========================================
```

- `process.exit(0)` si todo va bien; `process.exit(1)` si falla.

### 8.2 Endpoint `/api/health`

```bash
curl http://localhost:3000/api/health
```

**Respuesta OK:**

```json
{
  "ok": true,
  "servicio": "Gissi API",
  "version": "1.0.0",
  "bd": "conectada",
  "timestamp": "2026-12-11T12:00:00.000Z"
}
```

**Respuesta con error de BD:**

```json
{
  "ok": false,
  "servicio": "Gissi API",
  "bd": "error",
  "error": "<mensaje>",
  "timestamp": "..."
}
```

El endpoint ejecuta `SELECT 1 AS ok` contra el pool:

- Si responde, la BD está conectada.
- Si falla, responde **500** con el mensaje de error.

---

## 9. Inicialización de la Base de Datos

### 9.1 Script `database/init.sql`

Estructura del script:

1. **Creación de la base de datos** (`CREATE DATABASE IF NOT EXISTS`).
2. **Creación de las tablas** (12 tablas).
3. **Creación idempotente de índices** (verifica `information_schema.statistics` y ejecuta `CREATE INDEX` con `PREPARE/EXECUTE`).
4. **Inserción de datos de prueba**:
   - 4 categorías.
   - 6 tallas.
   - 1 color genérico.
   - 20 productos.
   - 20 registros de inventario.
   - 5 clientes.
   - 2 usuarios.
   - 3 proveedores.
   - 6 productos marcados como destacados.
5. **Consultas de verificación** (conteos, integridad referencial, organización por categoría).
6. **`DROP TABLE`** (todas las tablas).
7. **Sentencias de prueba** (categorías, tallas, color e inserción parametrizada de un producto).

### 9.2 Ejecución

Desde la raíz del proyecto:

```bash
mysql -u root -p < database/init.sql
```

> ⚠️ **Importante:** el script contiene `DROP TABLE` **antes** de la sección *"Sentencias para realizar pruebas"* al final. Ejecutarlo sobre una BD existente **elimina todas las tablas**. Si solo quieres consultar, no vuelvas a ejecutar el script.

### 9.3 Índices creados

| Índice | Tabla | Columna(s) |
|---|---|---|
| `idx_producto_destacado` | `producto` | `producto_destacado` |
| `idx_producto_categoria` | `producto` | `categoria_id` |
| `idx_producto_nombre` | `producto` | `producto_nombre` |
| `idx_inventario_producto` | `inventario` | `producto_id` |
| `idx_inventario_talla` | `inventario` | `talla_id` |
| `idx_inventario_color` | `inventario` | `color_id` |
| `idx_producto_imagen` | `producto_imagen` | `(producto_id, producto_imagen_orden)` |

La creación es idempotente: si el índice ya existe, la sentencia no falla.

---

## 10. Resumen de Acciones en VS Code

| # | Acción | Ubicación |
|---|--------|-----------|
| 1 | Verificar/crear `.env` | `backend/.env` |
| 2 | Crear carpeta `config/` | `backend/config/` |
| 3 | Crear archivo `database.js` con el pool | `backend/config/database.js` |
| 4 | Crear archivo `test-connection.js` | `backend/test-connection.js` |
| 5 | Actualizar script `test-db` | `backend/package.json` |
| 6 | Crear documentación | `docs/conexion-bd.md` |
| 7 | Ejecutar `npm run test-db` | Terminal integrada |
| 8 | Ejecutar `curl /api/health` | Terminal integrada |
| 9 | Simular errores (opcional) | Modificando `.env` temporalmente |

---

## 11. Verificación Final

Una vez completado todo, el proyecto debe:

1. Tener el módulo `config/database.js` con pool de conexiones (`connectionLimit: 10`, `enableKeepAlive`).
2. Responder correctamente a `npm run test-db` con las **5 pruebas** (incluye `EXPLAIN`).
3. Responder `{ ok: true, bd: "conectada" }` en `GET /api/health`.
4. Manejar errores con mensajes claros (códigos `ER_*`, `ECONNREFUSED`, `ECONNRESET`) y registrarlos en `backend/logs/errores.log`.
5. Tener todos los modelos usando `pool.query(sql, [params])` con parámetros `?`.
6. Estar documentado en `docs/conexion-bd.md`.
7. Mantener el servidor Express funcionando (`npm run dev`).
8. Tener la BD inicializada con `database/init.sql` (tablas + índices + datos de prueba).

---

## 12. Integración con Otros Módulos

### 12.1 Con los modelos

Cada modelo importa el pool y ejecuta sus consultas. Ejemplo real:

```javascript
// backend/models/productoModel.js
const pool = require('../config/database');

const obtenerTodos = async () => {
  const [rows] = await pool.query(`SELECT ... FROM producto ...`);
  return rows;
};

module.exports = { obtenerTodos, obtenerPorId, obtenerDestacados, ... };
```

### 12.2 Con el middleware de caché

```javascript
// backend/routes/productoRoutes.js
const cacheMiddleware = require('../middlewares/cache');

router.get('/',           cacheMiddleware(60),  ProductoController.listar);
router.get('/destacados', cacheMiddleware(120), ProductoController.listarDestacados);
```

- El pool solo se consulta cuando `X-Cache: MISS`.
- Cuando `X-Cache: HIT`, la respuesta proviene de memoria.

### 12.3 Con el manejo de errores

```javascript
// backend/controllers/productoController.js
const pool = require('../config/database');

const listar = async (req, res, next) => {
  try {
    const productos = await ProductoModel.obtenerTodos();
    res.json({ ok: true, total: productos.length, data: productos });
  } catch (error) {
    console.error('Error al listar productos:', error.message);
    next(new ApiError(500, 'Error al obtener los productos'));
  }
};
```

- Los errores de BD se propagan al `errorHandler` y se registran en `backend/logs/errores.log`.

### 12.4 Con el script de inicialización

- `database/init.sql` crea la BD, las tablas, los índices y los datos de prueba.
- El pool asume que la BD ya existe y los índices están creados.

### 12.5 Con el endpoint de salud

- `/api/health` usa el mismo pool para verificar la conexión en tiempo real.
- No usa caché.

---

## 13. Referencias

| Archivo | Contenido |
|---|---|
| `README.md` | Descripción general y ejecución. |
| `docs/arquitectura.md` | Arquitectura de tres capas y mecanismos transversales. |
| `docs/convencion-nombres.md` | Convención de nombres. |
| `docs/conexion-bd.md` | Este documento. |
| `database/init.sql` | Esquema, índices y datos de prueba. |
| `backend/config/database.js` | Implementación del pool. |
| `backend/test-connection.js` | Pruebas de conexión y `EXPLAIN`. |

---

**Nota:** Este documento aplica al estado actual del módulo de conexión y puede actualizarse si se introducen transacciones explícitas o cambios en la configuración del pool.