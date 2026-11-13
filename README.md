# Plataforma Web Gissi

Plataforma web para la **Asociación de Economía Solidaria Los Pastos**, dedicada a la confección y distribución de prendas textiles escolares, de trabajo, deportivas y personalizadas.

---

## 📋 Descripción general

Gissi es una plataforma cliente-servidor de tres capas que permite consultar el catálogo de productos textiles de la asociación, ver el detalle de cada producto, armar una cotización (carrito) y enviarla por WhatsApp.

El sistema está diseñado para escalar progresivamente. Actualmente incluye:

- Endpoints de consulta (`GET`) para productos, categorías, tallas, colores y clientes.
- Endpoints de escritura para productos (`POST`, `PUT`) y para sus imágenes (`POST`, `DELETE`, `PUT`).
- Validación y sanitización de entradas en el backend.
- Manejo centralizado de errores con registro en archivo.
- Caché en memoria con TTL para endpoints de lectura frecuente.
- Compresión gzip/brotli de respuestas.
- Frontend responsivo con catálogo, detalle, carrito y checkout por WhatsApp.
- Selector de tema (12 paletas de color).

---

## 🛠️ Tecnologías

| Capa | Tecnología | Puerto |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) | 5500 (Live Server) |
| **Backend** | Node.js + Express 5 | 3000 |
| **Base de datos** | MySQL (`mysql2`) | 3306 |

### Dependencias del backend

- **Producción:** `express`, `cors`, `dotenv`, `mysql2`, `multer`, `sharp`, `compression`.
- **Desarrollo:** `nodemon`.

### Tecnologías del frontend

- **Google Fonts:** DM Mono, Manrope, Oswald.
- **Font Awesome 6.5:** iconografía.
- **Fetch API:** consumo de la API del backend.
- **localStorage:** persistencia del carrito y del tema seleccionado.

---

## 📁 Estructura del proyecto

```text
ppp_gissi_plataforma-main/
├── README.md
├── backend/
│   ├── app.js                      # Punto de entrada del servidor
│   ├── nodemon.json
│   ├── package.json
│   ├── package-lock.json
│   ├── test-connection.js          # Prueba de conexión a MySQL y EXPLAIN
│   ├── config/
│   │   ├── database.js             # Pool de conexiones MySQL
│   │   ├── imagenOptimizer.js      # Generación de variantes WebP con sharp
│   │   └── multer.js               # Configuración de subida de imágenes
│   ├── controllers/                # Lógica de negocio
│   │   ├── categoriaController.js
│   │   ├── clienteController.js
│   │   ├── colorController.js
│   │   ├── productoController.js
│   │   └── tallaController.js
│   ├── middlewares/
│   │   ├── cache.js                # Caché en memoria con TTL
│   │   └── errorHandler.js         # Manejo global de errores + log a archivo
│   ├── models/                     # Acceso a datos
│   │   ├── categoriaModel.js
│   │   ├── clienteModel.js
│   │   ├── colorModel.js
│   │   ├── productoImagenModel.js
│   │   ├── productoModel.js
│   │   └── tallaModel.js
│   ├── routes/                     # Endpoints de la API
│   │   ├── categoriaRoutes.js
│   │   ├── clienteRoutes.js
│   │   ├── colorRoutes.js
│   │   ├── productoRoutes.js
│   │   └── tallaRoutes.js
│   ├── uploads/                    # Imágenes subidas (variantes WebP)
│   └── utils/
│       ├── ApiError.js             # Clase de error personalizada
│       ├── sanitizar.js            # Sanitización de strings y objetos
│       ├── validarId.js            # Validación de IDs numéricos
│       └── validarTexto.js         # Validación de campos de texto
├── database/
│   └── init.sql                    # Script principal de BD, índices y datos
├── docs/
│   ├── arquitectura.md
│   ├── conexion-bd.md
│   ├── convencion-nombres.md
│   └── postman/
│       └── Gissi API - Endpoints GET.postman_collection.json
└── frontend/
    ├── inicio.html
    ├── catalogo.html
    ├── producto.html
    ├── proceso.html
    ├── nosotros.html
    └── public/
        ├── script/
        │   ├── app.js              # Catálogo + filtros + búsqueda
        │   ├── producto.js         # Detalle con carrusel
        │   ├── carrito.js          # Carrito + checkout WhatsApp
        │   ├── script.js           # Interacciones comunes
        │   ├── temas.js            # Selector de tema
        │   └── toast.js            # Notificaciones flotantes
        └── style/
            ├── styles.css          # Base común
            ├── inicio.css
            ├── catalogo.css
            ├── producto.css
            ├── carrito.css
            ├── proceso.css
            └── nosotros.css
```

---

## 🗄️ Base de datos

**Nombre:** `gissi_plataforma_db`

**Motor:** MySQL (compatible con 5.7+, 8.0+ y MariaDB 10.x+)

**Cotejamiento:** `utf8mb4_unicode_ci`

### Tablas implementadas

| Tabla | Descripción |
|---|---|
| `categoria` | Categorías: Escolar, Trabajo, Deportivo y Personalizada. |
| `producto` | Catálogo de productos con precio, categoría y flag de destacado. |
| `producto_imagen` | Galería de imágenes de cada producto (principal + orden + origen). |
| `talla` | Tallas disponibles: XS, S, M, L, XL y XXL. |
| `color` | Colores disponibles para los productos. |
| `inventario` | Variantes de producto + talla + color con su stock. |
| `inventario_imagen` | Relación entre variantes de inventario e imágenes. |
| `cliente` | Clientes registrados, con cédula única. |
| `pedido` | Pedidos con estado y total. |
| `detalle_pedido` | Detalle de los pedidos asociado a `inventario`. |
| `usuario` | Usuarios con roles de administrador y vendedor. |
| `proveedor` | Proveedores de textiles. |

### Índices de rendimiento

El script `database/init.sql` crea los siguientes índices de forma idempotente (verificando su existencia en `information_schema`):

| Índice | Tabla | Columna | Propósito |
|---|---|---|---|
| `idx_producto_destacado` | `producto` | `producto_destacado` | Filtro de destacados |
| `idx_producto_categoria` | `producto` | `categoria_id` | JOIN con categoría |
| `idx_producto_nombre` | `producto` | `producto_nombre` | Búsquedas por nombre |
| `idx_inventario_producto` | `inventario` | `producto_id` | Detalle de producto |
| `idx_inventario_talla` | `inventario` | `talla_id` | JOIN con talla |
| `idx_inventario_color` | `inventario` | `color_id` | JOIN con color |
| `idx_producto_imagen` | `producto_imagen` | `(producto_id, producto_imagen_orden)` | Galería ordenada |

### Datos de prueba incluidos

- 4 categorías.
- 6 tallas.
- 1 color genérico ("Personalizado").
- 20 productos textiles.
- 20 registros de inventario.
- 5 clientes.
- 2 usuarios.
- 3 proveedores.
- 6 productos marcados como destacados.

### Inicialización de la base de datos

Desde la raíz del proyecto:

```bash
mysql -u root -p < database/init.sql
```

> ⚠️ **Importante:** el bloque de `DROP TABLE` está ubicado **antes** de las sentencias de prueba al final del script. Al ejecutar `init.sql` sobre una BD existente, las tablas se eliminan y recrean. Si solo quieres consultar los datos, no vuelvas a ejecutar el script.

---

## 🔌 API REST

**URL base:** `http://localhost:3000`

### Ruta raíz y salud

| Método | Endpoint | Descripción | Caché |
|---|---|---|---|
| `GET` | `/` | Información de la API y endpoints disponibles. | — |
| `GET` | `/api/health` | Estado del servicio y de la conexión a MySQL. | — |

### Endpoints de los recursos

| Recurso | Listar todos | Por ID |
|---|---|---|
| Productos | `GET /api/productos` | `GET /api/productos/:id` |
| Categorías | `GET /api/categorias` | `GET /api/categorias/:id` |
| Tallas | `GET /api/tallas` | `GET /api/tallas/:id` |
| Colores | `GET /api/colores` | `GET /api/colores/:id` |
| Clientes | `GET /api/clientes` | `GET /api/clientes/:id` |

### Endpoints adicionales de productos

| Método | Endpoint | Descripción | Caché |
|---|---|---|---|
| `GET` | `/api/productos/destacados` | Solo productos con `producto_destacado = TRUE`. | 120 s |
| `GET` | `/api/productos/:id/detalle` | Producto + galería + variantes de inventario. | — |
| `POST` | `/api/productos` | Crear producto (multipart/form-data). | — |
| `PUT` | `/api/productos/:id` | Actualizar producto. | — |
| `GET` | `/api/productos/:id/imagenes` | Listar imágenes del producto. | — |
| `POST` | `/api/productos/:id/imagenes` | Agregar imagen (multipart/form-data). | — |
| `DELETE` | `/api/productos/:id/imagenes/:imagenId` | Eliminar imagen. | — |
| `PUT` | `/api/productos/:id/imagenes/:imagenId/principal` | Marcar imagen como principal. | — |

### Caché HTTP

Los endpoints de lectura frecuente usan el middleware `middlewares/cache.js`:

| Endpoint | TTL |
|---|---|
| `GET /api/productos` | 60 s |
| `GET /api/productos/destacados` | 120 s |
| `GET /api/categorias` | 300 s |
| `GET /api/tallas` | 300 s |
| `GET /api/colores` | 300 s |

La respuesta incluye el header `X-Cache: HIT | MISS`. Cuando expira el TTL, la siguiente petición vuelve a consultar la BD.

### Formato de las respuestas

**Consulta de una colección**

```json
{
  "ok": true,
  "total": 20,
  "data": []
}
```

**Consulta por ID**

```json
{
  "ok": true,
  "data": {}
}
```

**Respuesta de error**

```json
{
  "ok": false,
  "error": "Mensaje",
  "status": 404,
  "path": "/api/productos/999"
}
```

### Códigos HTTP

| Código | Situación |
|---|---|
| `201` | Recurso creado correctamente. |
| `200` | Consulta o actualización exitosa. |
| `400` | Parámetros inválidos: ID no numérico, precio no positivo, campos faltantes, URL de imagen no segura. |
| `404` | Recurso o ruta no encontrada. |
| `500` | Error interno del servidor. |

### Validaciones aplicadas

- **IDs** (`req.params.id`, `req.params.imagenId`, `categoria_id`): deben ser enteros positivos (`validarId`).
- **Texto** (`producto_nombre`, `producto_descripcion`): longitud mínima/máxima (`validarTexto`).
- **Precio**: debe ser numérico y mayor que 0.
- **URLs de imagen externas**: solo se aceptan `http(s)://` o rutas locales `/uploads/` (`esUrlImagenSegura`).
- **Sanitización**: caracteres de control eliminados; strings truncados a 500 caracteres (`sanitizarObjeto`, `sanitizarString`).
- **SQL**: todas las consultas usan parámetros `?` (consultas preparadas).

### Manejo de errores

El middleware `errorHandler`:

- Devuelve `{ ok: false, error, status, path }`.
- Registra cada error en `backend/logs/errores.log` (formato JSON por línea).
- Mantiene salida a consola con el código y la ruta.

### Pruebas con Postman

La colección está en:

`docs/postman/Gissi API - Endpoints GET.postman_collection.json`

Incluye:

- Endpoints `GET` de todos los recursos.
- Casos de validación (`GET` con IDs inválidos, `POST` con datos faltantes o inválidos).
- Casos de imágenes (`POST`, `DELETE`).
- Verificación de salud (`/api/health`).

---

## ⚙️ Configuración y ejecución

### 1. Requisitos previos

- [Node.js](https://nodejs.org/) (recomendado: versión LTS que soporte `sharp` ≥ 0.35, es decir Node ≥ 20.9).
- npm.
- [MySQL](https://www.mysql.com/).
- [Visual Studio Code](https://code.visualstudio.com/) u otro editor.
- Live Server para el frontend (si usas VS Code).
- Postman (opcional) para probar la API.

### 2. Configurar variables de entorno

Crea `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contrasena
DB_NAME=gissi_plataforma_db
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

> `NODE_ENV=production` desactiva el log de peticiones en consola y el `stack` en `errores.log`.

**Importante:** el archivo `.env` no debe versionarse en Git. Se recomienda mantener un `.env.example` como plantilla.

### 3. Instalar dependencias

```bash
cd backend
npm install
```

### 4. Inicializar la base de datos

Desde la raíz:

```bash
mysql -u root -p < database/init.sql
```

### 5. Verificar conexión a MySQL

Desde `backend/`:

```bash
npm run test-db
```

El script ejecuta:

1. Consulta simple (`SELECT 1+1`).
2. Conteo de productos.
3. Conteo de categorías.
4. JOIN de productos con su categoría.
5. `EXPLAIN` de la consulta principal de productos.

### 6. Iniciar el backend

```bash
# Desarrollo (nodemon)
npm run dev

# Producción
npm start
```

Al arrancar, la consola muestra:

```text
Servidor Gissi corriendo en http://localhost:3000
Entorno: development
Compresión: activada (gzip/brotli)
Cache de /uploads: 7 días (immutable)
```

### 7. Ejecutar el frontend

Abre `frontend/` en VS Code y ejecuta `inicio.html` con Live Server.

La dirección habitual será `http://127.0.0.1:5500`.

> El frontend consume `http://localhost:3000/api` (definido en `frontend/public/script/app.js` y `producto.js`). El backend debe estar corriendo.

---

## 🎨 Frontend

### Páginas

| Página | Descripción |
|---|---|
| `inicio.html` | Home con hero, destacados, proceso resumido, sectores, FAQ y CTA. |
| `catalogo.html` | Catálogo completo con buscador y filtros por categoría. |
| `producto.html` | Detalle con carrusel, tallas, colores, variantes y acciones. |
| `proceso.html` | Explicación del proceso de confección. |
| `nosotros.html` | Historia, misión, visión, valores y mapa. |

### Scripts

| Archivo | Responsabilidad |
|---|---|
| `app.js` | Catálogo: fetch, filtros, búsqueda, renderizado, estados UI. |
| `producto.js` | Detalle: carrusel, miniaturas, tallas, colores, variantes, WhatsApp. |
| `carrito.js` | Carrito de cotización + checkout WhatsApp + selector de mensajes. |
| `script.js` | Menú móvil, header al scroll, back-to-top, contadores animados. |
| `temas.js` | Selector de tema con persistencia en `localStorage`. |
| `toast.js` | Notificaciones flotantes (`GissiToast.exito/error/info`). |

### Estilos

- `styles.css`: base común (variables, header, footer, botones, marquee, temas, toasts, fallbacks).
- Un CSS por página (`inicio.css`, `catalogo.css`, `producto.css`, `proceso.css`, `nosotros.css`).
- `carrito.css`: se carga en todas las páginas.

### Diseño responsivo

Puntos de adaptación:

- `1100px`
- `900px`
- `560px`
- `480px`

### Carrito y WhatsApp

- El carrito se guarda en `localStorage` con la clave `gissi_deportivo_carrito_v1`.
- El checkout no usa pasarela de pago: genera un mensaje formateado y abre WhatsApp (`https://api.whatsapp.com/send?phone=...`).
- Los mensajes varían según el contexto (`producto`, `proceso`, `nosotros`, `general`) y se seleccionan por `data-accion="wsp-*"`.

### Selector de tema

- 12 paletas: naranja, rojo, amarillo, dorado, azul, celeste, turquesa, marrón, verde, lima, violeta, rosa.
- Se aplica en `<html data-theme="...">` y el CSS resuelve los hex mediante variables `--accent` y `--accent-2`.
- La elección persiste en `localStorage` (`gissi_theme_v1`).
- `temas.js` se carga en el `<head>` sin `defer`/`async` para evitar el "flash" de tema incorrecto.

---

## 📚 Documentación técnica

| Archivo | Contenido |
|---|---|
| `docs/arquitectura.md` | Arquitectura de tres capas, flujo de datos y puertos. |
| `docs/conexion-bd.md` | Pool de conexiones MySQL y manejo de errores. |
| `docs/convencion-nombres.md` | Reglas de nomenclatura. |
| `docs/postman/` | Colección de pruebas de la API. |

---

## 🏗️ Arquitectura del sistema

El proyecto sigue una arquitectura cliente-servidor de tres capas:

1. **Frontend:** presenta la interfaz y permite al usuario interactuar con el catálogo y el carrito.
2. **Backend:** procesa las solicitudes HTTP, ejecuta la lógica de negocio y expone la API REST.
3. **Base de datos:** almacena productos, imágenes, inventario, clientes y demás información.

### Flujo de datos

```text
Usuario
   |
   v
Frontend (HTML, CSS, JavaScript)
   |
   | Fetch API / HTTP
   v
Backend (Node.js + Express)
   |
   v
Rutas → Controladores → Modelos
   |
   v
Pool de conexiones MySQL
   |
   v
Base de datos (gissi_plataforma_db)
```

---

## 📐 Convenciones del proyecto

| Elemento | Convención | Ejemplo |
|---|---|---|
| Carpetas | Minúsculas y plural cuando corresponda. | `controllers`, `models` |
| Archivos JavaScript | Nombres descriptivos y consistentes. | `productoController.js` |
| Variables y funciones | `camelCase`. | `obtenerProductos()` |
| Clases | `PascalCase`. | `ProductoModel` |
| Tablas de la base de datos | Nombres en minúsculas. | `producto` |
| Columnas de la base de datos | Minúsculas con guion bajo. | `categoria_id` |
| Rutas de la API | Minúsculas, plurales y prefijo `/api/`. | `/api/productos` |
| Archivos y carpetas | Sin tildes ni caracteres especiales. | `conexion-bd.md` |

Reglas detalladas en `docs/convencion-nombres.md`.

---

## 🚧 Estado del proyecto y próximos pasos

### ✅ Funcionalidades implementadas

**Backend**

- Arquitectura cliente-servidor de tres capas.
- Pool de conexiones MySQL con `keepAlive`.
- API REST con cinco recursos de consulta y CRUD parcial de productos.
- Subida de imágenes con `multer`, optimización a WebP con `sharp` (3 variantes: `-sm`, `-md`, `-lg`).
- Validación de IDs, textos y precios.
- Sanitización de entradas (`sanitizarObjeto`, `sanitizarString`).
- Validación de URLs de imagen (`http(s)://` o `/uploads/`).
- Consultas 100% parametrizadas (`?`).
- Manejo centralizado de errores con log a `backend/logs/errores.log`.
- Caché en memoria con TTL y header `X-Cache`.
- Compresión gzip/brotli.
- Cache HTTP de `/uploads` (7 días, `immutable`).
- Endpoint de salud `/api/health`.
- Script SQL idempotente con 7 índices de rendimiento.

**Frontend**

- Interfaz responsiva con identidad visual propia.
- Catálogo dinámico con filtros por categoría y buscador en tiempo real.
- Detalle de producto con carrusel, miniaturas, tallas, colores y variantes.
- Carrito de cotización persistente (`localStorage`).
- Checkout por WhatsApp con mensajes formateados por contexto.
- Selector de tema (12 paletas).
- Notificaciones flotantes (`GissiToast`).
- Accesibilidad: `prefers-reduced-motion`, `focus-visible`, `aria-*`.

### 🔜 Próximas implementaciones

- Autenticación y autorización por roles de usuario.
- Módulo de pedidos y detalles de pedidos.
- Gestión del inventario por producto, talla y color desde la API.
- Módulo de proveedores.
- Invalidación explícita del caché al crear/actualizar/eliminar productos (hoy expira por TTL).
- Búsqueda de productos del lado del servidor (hoy es client-side).
- Pruebas automatizadas para el backend y el frontend.

---

## 👥 Créditos

- **Proyecto:** Plataforma Web Gissi.
- **Organización:** Asociación de Economía Solidaria Los Pastos.
- **Ubicación:** Tulcán, Carchi, Ecuador.
- **Versión:** 1.1.
- **Año:** 2026.

---

## 📄 Licencia

Este proyecto utiliza la licencia **ISC**.