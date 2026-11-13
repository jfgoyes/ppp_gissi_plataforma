# Arquitectura del Proyecto Gissi

**Proyecto:** Plataforma Web para la Asociación de Economía Solidaria Los Pastos  
**Versión:** 1.1  
**Fecha:** Diciembre de 2026  

---

## 1. Objetivo

Definir la arquitectura cliente-servidor de la plataforma web de Gissi, estableciendo las tres capas del sistema (Frontend, Backend y Base de Datos), el flujo de comunicación entre ellas, la configuración de variables de entorno, los puertos utilizados y los mecanismos transversales (caché, compresión, validación, sanitización, manejo de errores y optimización de imágenes). Sirve como referencia para el desarrollo y mantenimiento del proyecto.

---

## 2. Diagrama de Arquitectura Cliente-Servidor

La plataforma sigue el modelo de tres capas:

```text
┌──────────────────────────┐
│        NAVEGADOR         │
│        (Usuario)         │
└────────────┬─────────────┘
             │ HTTP
             ▼
┌──────────────────────────┐
│        FRONTEND          │  HTML + CSS + JavaScript (Vanilla)
│      (Puerto 5500)       │  Live Server (desarrollo)
│                          │  5 páginas + carrito + temas
└────────────┬─────────────┘
             │ Fetch API → JSON (GET / POST / PUT / DELETE)
             ▼
┌──────────────────────────┐
│         BACKEND          │  Node.js + Express 5
│      (Puerto 3000)       │  Rutas → Controladores → Modelos
│                          │  + caché, compresión, validación,
│                          │    sanitización y manejo de errores
└────────────┬─────────────┘
             │ Consultas SQL parametrizadas (?)
             ▼
┌──────────────────────────┐
│       BASE DE DATOS      │  MySQL
│      (Puerto 3306)       │  Persistencia + índices
└──────────────────────────┘
```

**Captura:** Diagrama de arquitectura cliente-servidor actualizado.

---

## 3. Descripción de las Capas

| Capa | Tecnología | Función | Puerto |
|---|---|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) | Presentar el catálogo, detalle, carrito y contenido informativo | 5500 (Live Server) |
| Backend | Node.js + Express 5 | Procesar peticiones, ejecutar lógica de negocio y exponer la API REST | 3000 |
| Base de Datos | MySQL (`mysql2`) | Almacenar productos, imágenes, inventario, clientes, etc. | 3306 |

### 3.1 Frontend

- **Páginas:** `inicio.html`, `catalogo.html`, `producto.html`, `proceso.html`, `nosotros.html`.
- **Scripts:**
  - `app.js` — catálogo, filtros, búsqueda y renderizado.
  - `producto.js` — detalle, carrusel y acciones.
  - `carrito.js` — carrito de cotización + checkout por WhatsApp.
  - `script.js` — interacciones comunes (menú, scroll, back-to-top, contadores).
  - `temas.js` — selector de tema con `localStorage`.
  - `toast.js` — notificaciones flotantes.
- **Estilos:** `styles.css` (base) + un CSS por página + `carrito.css` (global).
- **Persistencia local:** carrito (`gissi_deportivo_carrito_v1`) y tema (`gissi_theme_v1`) en `localStorage`.

### 3.2 Backend

- **Punto de entrada:** `app.js`.
- **Capas internas:**
  - `routes/` — definición de endpoints.
  - `controllers/` — lógica de negocio y validación.
  - `models/` — acceso a datos con consultas parametrizadas.
- **Configuración:**
  - `config/database.js` — pool de conexiones MySQL.
  - `config/multer.js` — subida de imágenes (multipart/form-data).
  - `config/imagenOptimizer.js` — generación de variantes WebP con `sharp`.
- **Middlewares transversales:**
  - `middlewares/cache.js` — caché en memoria con TTL.
  - `middlewares/errorHandler.js` — manejo global de errores + log a archivo.
- **Utilidades:**
  - `utils/ApiError.js` — clase de error personalizada.
  - `utils/validarId.js` — validación de IDs numéricos positivos.
  - `utils/validarTexto.js` — validación de campos de texto.
  - `utils/sanitizar.js` — sanitización de strings y objetos.

### 3.3 Base de Datos

- **Nombre:** `gissi_plataforma_db`.
- **Cotejamiento:** `utf8mb4_unicode_ci`.
- **Tablas:** `categoria`, `producto`, `producto_imagen`, `talla`, `color`, `inventario`, `inventario_imagen`, `cliente`, `pedido`, `detalle_pedido`, `usuario`, `proveedor`.
- **Índices de rendimiento:** ver `database/init.sql` (sección *Paso 2.1*). Se crean de forma idempotente verificando `information_schema.statistics`.

---

## 4. Flujo de Datos

### 4.1 Flujo general de una petición

```text
1. El usuario abre el navegador y accede a una página del frontend.
2. El frontend realiza una petición HTTP al backend (por ejemplo, GET /api/productos).
3. Express recibe la petición y aplica los middlewares globales:
     CORS → Compression → JSON/URLEncoded → (log en dev) → ruta.
4. Según la ruta:
     - Si tiene caché (cacheMiddleware), se revisa el store en memoria:
         * HIT  → se responde de inmediato con X-Cache: HIT.
         * MISS → continúa al controlador.
5. El controlador valida y sanitiza las entradas.
6. El modelo consulta MySQL mediante el pool (consultas parametrizadas).
7. El controlador arma la respuesta JSON { ok, total, data }.
8. Si la ruta tiene caché, el middleware guarda la respuesta y añade X-Cache: MISS.
9. Compression aplica gzip/brotli si el payload supera 1 KB.
10. El frontend renderiza los datos.
```

### 4.2 Flujo de subida de imagen

```text
POST /api/productos  ó  POST /api/productos/:id/imagenes
   │ (multipart/form-data)
   ▼
multer (config/multer.js)
   │ valida tipo MIME (jpeg|jpg|png|webp|gif) y tamaño (≤ 8 MB)
   │ guarda en backend/uploads/ con nombre único
   ▼
productoController (crear / agregarImagen)
   │
   ▼
imagenOptimizer (config/imagenOptimizer.js)
   │ sharp genera 3 variantes WebP:
   │   -sm  (480 px)
   │   -md  (960 px)
   │   -lg  (1600 px)
   │ elimina el archivo original
   ▼
ProductoImagenModel.crear
   │ guarda la URL de la variante -md como principal
   ▼
Respuesta: { ok, producto_imagen_id, producto_imagen_url, es_principal }
```

El frontend consume las variantes mediante `srcset`/`sizes` (`construirSrcset` en `app.js`) para servir la imagen adecuada según el viewport.

### 4.3 Flujo del carrito y checkout

```text
Usuario agrega producto (btn-cart)
   │
   ▼
window.GissiCarrito.agregar() (carrito.js)
   │ sanitiza el ítem
   │ persiste en localStorage
   │ abre el drawer y actualiza el badge
   ▼
Usuario revisa el carrito y pulsa "Enviar por WhatsApp"
   │
   ▼
carrito.checkoutWhatsApp()
   │ formatea el mensaje con formatearPedidoCarrito()
   │ abre https://api.whatsapp.com/send?phone=...&text=...
   │ vacía el carrito y cierra el drawer
```

---

## 5. Variables de Entorno

### 5.1 Archivo `.env`

Ubicado en `backend/`, almacena credenciales y configuración sensible:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contrasena
DB_NAME=gissi_plataforma_db
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

**Captura:** Archivo `.env` creado en la carpeta `backend/`.

- `NODE_ENV=production` desactiva el middleware de log de peticiones en consola y el campo `stack` en `logs/errores.log`.

### 5.2 Archivo `.env.example`

Plantilla sin credenciales reales:

```env
DB_HOST=direccion_ip
DB_USER=nombre_usuario
DB_PASSWORD=contrasena_aqui
DB_NAME=nombre_base_datos
DB_PORT=numero_puerto_bd
PORT=3000
NODE_ENV=development
```

### 5.3 Archivo `.gitignore`

Debe excluir credenciales, dependencias y logs:

```text
node_modules/
.env
*.log
backend/logs/
```

**Captura:** Archivo `.gitignore` verificando la exclusión del `.env` y de `backend/logs/`.

---

## 6. Documentación de Puertos

| Capa | Puerto | Descripción |
|---|---|---|
| Frontend | 5500 (Live Server) | Puerto de desarrollo del frontend |
| Backend | 3000 | Puerto del servidor Node.js/Express |
| Base de Datos | 3306 | Puerto por defecto de MySQL |

---

## 7. Mecanismos Transversales del Backend

### 7.1 Caché en memoria (`middlewares/cache.js`)

- **Tipo:** caché simple en memoria basado en `Map`.
- **Clave:** `req.originalUrl`.
- **Valor:** `{ data, expira }`.
- **TTL por endpoint:**

| Endpoint | TTL |
|---|---|
| `GET /api/productos` | 60 s |
| `GET /api/productos/destacados` | 120 s |
| `GET /api/categorias` | 300 s |
| `GET /api/tallas` | 300 s |
| `GET /api/colores` | 300 s |

- **Header:** `X-Cache: HIT | MISS`.
- **Limitación conocida:** la caché expira por TTL; no se invalida explícitamente al crear/actualizar/eliminar productos.

### 7.2 Compresión (`compression`)

- Configuración en `app.js`:

```javascript
app.use(compression({ level: 6, threshold: 1024 }));
```

- Aplica gzip/brotli a respuestas ≥ 1 KB.
- Reduce ~70–85 % el peso de las respuestas JSON.

### 7.3 Cache HTTP de `/uploads`

- Configuración en `app.js` con `express.static`:

```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  immutable: true,
  etag: true,
  lastModified: true
}));
```

- Los nombres de archivo incluyen timestamp + random → seguros para cachear como `immutable`.

### 7.4 Validación

| Utilidad | Uso |
|---|---|
| `validarId(id)` | IDs numéricos positivos (`req.params`, `categoria_id`). |
| `validarTexto(valor, opts)` | Longitud mínima/máxima para campos de texto. |

### 7.5 Sanitización

| Utilidad | Uso |
|---|---|
| `sanitizarString(valor, maxLen)` | Limpia caracteres de control y trunca. |
| `sanitizarObjeto(obj, maxLen)` | Aplica `sanitizarString` a todos los strings del objeto. |
| `esUrlImagenSegura(url)` | En `productoController.js`: solo `http(s)://` o `/uploads/`. |

### 7.6 Manejo de errores (`middlewares/errorHandler.js`)

- **`notFound`**: convierte cualquier ruta desconocida en `ApiError(404)`.
- **`errorHandler`**:
  - Devuelve `{ ok: false, error, status, path }`.
  - Registra cada error en `backend/logs/errores.log` (JSON por línea).
  - Mantiene salida a consola con el código y la ruta.
  - `stack` solo se incluye cuando `NODE_ENV !== 'production'`.

### 7.7 SQL parametrizado

- Todos los modelos (`productoModel`, `productoImagenModel`, `categoriaModel`, `clienteModel`, `colorModel`, `tallaModel`) usan `pool.query(sql, [params])`.
- No hay concatenación de strings SQL.

---

## 8. Endpoints de la API

**URL base:** `http://localhost:3000`

| Método | Endpoint | Caché | Descripción |
|---|---|---|---|
| `GET` | `/` | — | Info de la API |
| `GET` | `/api/health` | — | Estado del sistema y BD |
| `GET` | `/api/productos` | 60 s | Listar productos |
| `GET` | `/api/productos/destacados` | 120 s | Solo destacados |
| `GET` | `/api/productos/:id` | — | Producto por ID |
| `GET` | `/api/productos/:id/detalle` | — | Producto + galería + variantes |
| `POST` | `/api/productos` | — | Crear producto (multipart) |
| `PUT` | `/api/productos/:id` | — | Actualizar producto |
| `GET` | `/api/productos/:id/imagenes` | — | Listar imágenes |
| `POST` | `/api/productos/:id/imagenes` | — | Agregar imagen (multipart) |
| `DELETE` | `/api/productos/:id/imagenes/:imagenId` | — | Eliminar imagen |
| `PUT` | `/api/productos/:id/imagenes/:imagenId/principal` | — | Marcar principal |
| `GET` | `/api/categorias` | 300 s | Listar categorías |
| `GET` | `/api/categorias/:id` | — | Categoría por ID |
| `GET` | `/api/tallas` | 300 s | Listar tallas |
| `GET` | `/api/tallas/:id` | — | Talla por ID |
| `GET` | `/api/colores` | 300 s | Listar colores |
| `GET` | `/api/colores/:id` | — | Color por ID |
| `GET` | `/api/clientes` | — | Listar clientes |
| `GET` | `/api/clientes/:id` | — | Cliente por ID |

---

## 9. Prueba de Conexión y Verificación

### 9.1 Script `backend/test-connection.js`

Ejecuta cinco pruebas usando el pool de conexiones:

1. `SELECT 1 + 1` — verifica conectividad.
2. `SELECT COUNT(*) FROM producto` — conteo de productos.
3. `SELECT COUNT(*) FROM categoria` — conteo de categorías.
4. `JOIN producto + categoria` — primeros 3 productos con su categoría.
5. `EXPLAIN` de la consulta principal de productos — verifica uso de índices.

### 9.2 Ejecución

Desde `backend/`:

```bash
npm run test-db
```

**Respuesta esperada:**

```text
========================================
Prueba de conexión a MySQL - Gissi
========================================
Prueba 1 - Consulta simple: OK
Prueba 2 - Total de productos: 20
Prueba 3 - Total de categorías: 4
Prueba 4 - Primeros 3 productos con su categoría:
  - Producto 1 (Personalizada): $10.00
  - ...
Prueba 5 - Plan de ejecución (EXPLAIN):
  - tabla=producto tipo=... key=... filas=...
========================================
Todas las pruebas fueron exitosas
========================================
```

### 9.3 Endpoint de salud

```bash
curl http://localhost:3000/api/health
```

**Respuesta esperada:**

```json
{
  "ok": true,
  "servicio": "Gissi API",
  "version": "1.0.0",
  "bd": "conectada",
  "timestamp": "..."
}
```

### 9.4 Verificación de caché

```bash
curl -i http://localhost:3000/api/productos | grep X-Cache
# Primera llamada: X-Cache: MISS
curl -i http://localhost:3000/api/productos | grep X-Cache
# Segunda llamada (dentro del TTL): X-Cache: HIT
```

### 9.5 Verificación

Con estas pruebas se confirma que:

- Las variables de entorno se leen correctamente.
- El backend se comunica con MySQL.
- La BD `gissi_plataforma_db` está accesible.
- Los índices se aplican en las consultas principales.
- El caché responde con `X-Cache: HIT/MISS`.
- El endpoint `/api/health` confirma el estado del servicio y la BD.

---

## 10. Estructura de Carpetas

```text
ppp_gissi_plataforma-main/
├── backend/
│   ├── app.js
│   ├── nodemon.json
│   ├── package.json
│   ├── package-lock.json
│   ├── test-connection.js
│   ├── .env                    # no versionado
│   ├── .env.example
│   ├── config/
│   │   ├── database.js
│   │   ├── imagenOptimizer.js
│   │   └── multer.js
│   ├── controllers/
│   │   ├── categoriaController.js
│   │   ├── clienteController.js
│   │   ├── colorController.js
│   │   ├── productoController.js
│   │   └── tallaController.js
│   ├── middlewares/
│   │   ├── cache.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── categoriaModel.js
│   │   ├── clienteModel.js
│   │   ├── colorModel.js
│   │   ├── productoImagenModel.js
│   │   ├── productoModel.js
│   │   └── tallaModel.js
│   ├── routes/
│   │   ├── categoriaRoutes.js
│   │   ├── clienteRoutes.js
│   │   ├── colorRoutes.js
│   │   ├── productoRoutes.js
│   │   └── tallaRoutes.js
│   ├── uploads/                # variantes WebP generadas
│   ├── logs/                   # errores.log (no versionado)
│   └── utils/
│       ├── ApiError.js
│       ├── sanitizar.js
│       ├── validarId.js
│       └── validarTexto.js
├── database/
│   └── init.sql
├── docs/
│   ├── arquitectura.md         # este documento
│   ├── conexion-bd.md
│   ├── convencion-nombres.md
│   └── postman/
│       └── Gissi API - Endpoints GET.postman_collection.json
├── frontend/
│   ├── inicio.html
│   ├── catalogo.html
│   ├── producto.html
│   ├── proceso.html
│   ├── nosotros.html
│   └── public/
│       ├── script/
│       │   ├── app.js
│       │   ├── carrito.js
│       │   ├── producto.js
│       │   ├── script.js
│       │   ├── temas.js
│       │   └── toast.js
│       └── style/
│           ├── styles.css
│           ├── inicio.css
│           ├── catalogo.css
│           ├── producto.css
│           ├── carrito.css
│           ├── proceso.css
│           └── nosotros.css
├── .gitignore
└── README.md
```

---

## 11. Reglas Generales

1. Mantener el archivo `.env` fuera del repositorio Git y usar `.env.example` como plantilla.
2. Verificar que las credenciales del `.env` coincidan con las configuradas en MySQL Workbench.
3. Documentar cualquier cambio en la arquitectura, los puertos o los mecanismos transversales.
4. Mantener la separación por capas (rutas, controladores, modelos, configuración, middlewares, utilidades).
5. Sin tildes ni caracteres especiales en nombres de archivos y carpetas.
6. Toda consulta SQL debe ser parametrizada (`?`).
7. Toda entrada del usuario debe pasar por `validarId`, `validarTexto` o `sanitizarObjeto` según corresponda.
8. Registrar nuevos endpoints en este documento y en la colección de Postman.
9. Mantener la compatibilidad de los prefijos de caché (`X-Cache`) para facilitar pruebas.

---

## 12. Referencias

| Archivo | Contenido |
|---|---|
| `README.md` | Descripción general, estructura y ejecución. |
| `docs/convencion-nombres.md` | Convención de nombres del proyecto. |
| `docs/conexion-bd.md` | Configuración del pool y errores de conexión. |
| `docs/arquitectura.md` | Este documento. |
| `database/init.sql` | Esquema, índices y datos de prueba. |
| `docs/postman/` | Colección de pruebas de la API. |

---

**Nota:** Esta arquitectura aplica para todo el proyecto y puede actualizarse según necesidades del desarrollo.