# Convención de Nombres del Proyecto Gissi

**Proyecto:** Plataforma Web para la Asociación de Economía Solidaria Los Pastos  
**Versión:** 1.1  
**Fecha:** Diciembre de 2026  

---

## 1. Objetivo

Establecer reglas simples y consistentes para nombrar archivos, carpetas, variables, funciones, tablas, columnas y demás elementos del proyecto, facilitando el desarrollo individual, la lectura del código y el mantenimiento futuro.

---

## 2. Estructura del Proyecto

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
│   ├── arquitectura.md
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

## 3. Reglas Generales

1. **Sin tildes ni caracteres especiales** en nombres de archivos y carpetas (`conexion-bd.md`, no `conexión-bd.md`).
2. Nombres **descriptivos y consistentes** en todo el proyecto.
3. Mantener la **separación por capas** (rutas, controladores, modelos, configuración, middlewares, utilidades).
4. Uso de **minúsculas** en carpetas y archivos (excepto `PascalCase` en clases).
5. Comentarios y documentación en **español**.
6. El archivo `.env` **nunca** se versiona; el `.env.example` sirve como plantilla.
7. Los **logs** van a `backend/logs/` y no se versionan.

---

## 4. Nomenclatura de Carpetas

| Carpeta | Convención | Ejemplo |
|---|---|---|
| Backend | Minúsculas, singular o plural según propósito | `config`, `controllers`, `models`, `routes`, `utils`, `middlewares` |
| Archivos subidos | Minúsculas | `uploads` |
| Logs | Minúsculas | `logs` |
| Base de datos | Minúsculas | `database` |
| Documentación | Minúsculas | `docs` |
| Frontend scripts | Minúsculas | `script` |
| Frontend estilos | Minúsculas | `style` |

**Regla:** cada carpeta agrupa archivos de la misma capa o naturaleza. No se mezclan controladores con modelos, ni scripts con estilos.

---

## 5. Nomenclatura de Archivos

### 5.1 Backend

| Tipo | Convención | Ejemplo |
|---|---|---|
| Controladores | `camelCase` + sufijo `Controller` | `productoController.js` |
| Modelos | `camelCase` + sufijo `Model` | `productoModel.js`, `productoImagenModel.js` |
| Rutas | `camelCase` + sufijo `Routes` | `productoRoutes.js` |
| Configuración | `camelCase` descriptivo | `database.js`, `imagenOptimizer.js`, `multer.js` |
| Middlewares | `camelCase` descriptivo | `cache.js`, `errorHandler.js` |
| Utilidades | `camelCase` descriptivo | `ApiError.js`, `validarId.js`, `validarTexto.js`, `sanitizar.js` |
| Scripts de prueba | `kebab-case` descriptivo | `test-connection.js` |
| Entrada del servidor | `app.js` | `app.js` |

### 5.2 Base de datos

| Tipo | Convención | Ejemplo |
|---|---|---|
| Script de inicialización | `snake_case` | `init.sql` |
| Respaldos | `init_backup_AAAA_MM_DD.sql` | `init_backup_21_09_2026.sql` |

### 5.3 Frontend

| Tipo | Convención | Ejemplo |
|---|---|---|
| Páginas HTML | `camelCase` o minúsculas | `inicio.html`, `catalogo.html`, `producto.html`, `proceso.html`, `nosotros.html` |
| Scripts JS | `camelCase` descriptivo | `app.js`, `producto.js`, `carrito.js`, `script.js`, `temas.js`, `toast.js` |
| Estilos CSS (base) | `styles.css` | `styles.css` |
| Estilos CSS (por página) | `camelCase` | `inicio.css`, `catalogo.css`, `producto.css`, `proceso.css`, `nosotros.css` |
| Estilos CSS (global) | `carrito.css` | `carrito.css` |

### 5.4 Documentación

| Tipo | Convención | Ejemplo |
|---|---|---|
| Documentos técnicos | `kebab-case` | `arquitectura.md`, `conexion-bd.md`, `convencion-nombres.md` |
| Colección Postman | `kebab-case` o descriptivo | `Gissi API - Endpoints GET.postman_collection.json` |

> **Nota:** los documentos técnicos usan `kebab-case` (con guiones) porque son texto; el código usa `camelCase`. Esto evita confundir archivos de código con documentación.

---

## 6. Nomenclatura de Variables y Funciones

### 6.1 Variables

| Contexto | Convención | Ejemplo |
|---|---|---|
| Variables locales | `camelCase` | `productoId`, `nombreLimpio`, `precioNum`, `categoriaId` |
| Constantes de configuración | `UPPER_SNAKE_CASE` | `API_URL`, `API_BASE`, `MAX_LEN`, `MIN_LEN` |
| Variables de entorno | `UPPER_SNAKE_CASE` | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `PORT`, `NODE_ENV` |
| Claves de `localStorage` | `snake_case` con prefijo | `gissi_deportivo_carrito_v1`, `gissi_theme_v1` |
| Estado del frontend | `camelCase` | `estadoFiltros`, `carrusel`, `productoActual` |

### 6.2 Funciones

| Contexto | Convención | Ejemplo |
|---|---|---|
| Funciones generales | `camelCase` con verbo | `obtenerProductos()`, `renderizarCatalogo()`, `aplicarFiltros()` |
| Helpers de UI | `camelCase` con verbo | `mostrarCargando()`, `mostrarError()`, `limpiarEstados()` |
| Helpers de datos | `camelCase` con verbo | `crearTarjetaProducto()`, `construirSrcset()`, `escAttr()` |
| Handlers de eventos | `camelCase` con verbo | `configurarBuscador()`, `reengancharListenersTarjetas()` |
| Utilidades backend | `camelCase` con verbo | `validarId()`, `validarTexto()`, `sanitizarObjeto()`, `sanitizarString()` |
| Helpers internos | `camelCase` con prefijo descriptivo | `esUrlImagenSegura()`, `borrarVariantesDeImagen()` |
| Middlewares | `camelCase` con verbo | `cacheMiddleware()`, `notFound()`, `errorHandler()` |
| Formateadores de WhatsApp | `camelCase` con prefijo `formatear` | `formatearConsultaProducto()`, `formatearPedidoCarrito()` |

### 6.3 Clases y constructores

| Contexto | Convención | Ejemplo |
|---|---|---|
| Clases de error | `PascalCase` | `ApiError` |
| Modelos (objeto literal) | `PascalCase` | `ProductoModel`, `CategoriaModel` |
| Controllers (objeto literal) | `PascalCase` | `ProductoController`, `CategoriaController` |
| API pública global | `PascalCase` con prefijo `Gissi` | `GissiCarrito`, `GissiToast` |

---

## 7. Nomenclatura de la Base de Datos

### 7.1 Tablas

| Convención | Ejemplo |
|---|---|
| Minúsculas, **singular** | `producto`, `categoria`, `talla`, `color`, `cliente`, `pedido`, `usuario`, `proveedor`, `inventario` |
| Tablas de relación | `snake_case` descriptivo | `producto_imagen`, `inventario_imagen`, `detalle_pedido` |

> **Nota:** el proyecto usa **singular** para tablas principales (`producto`, no `productos`). Esto contrasta con la convención "plural" habitual, pero es la regla adoptada y debe respetarse en todo el código.

### 7.2 Columnas

| Convención | Ejemplo |
|---|---|
| `snake_case` con prefijo de tabla | `producto_id`, `producto_nombre`, `producto_precio`, `categoria_id`, `categoria_nombre` |
| Clave primaria | `<tabla>_id` | `producto_id`, `categoria_id`, `talla_id` |
| Clave foránea | `<tabla_referenciada>_id` | `categoria_id`, `producto_id` |
| Booleanos | Prefijo descriptivo | `producto_destacado`, `producto_imagen_principal` |
| Fechas | Sufijo `_fecha` o `_creada` | `pedido_fecha`, `producto_imagen_creada` |
| Enums | `_origen`, `_estado`, `_rol` | `producto_imagen_origen`, `pedido_estado`, `usuario_rol` |

### 7.3 Índices

| Convención | Ejemplo |
|---|---|
| Prefijo `idx_` + tabla + columna | `idx_producto_destacado`, `idx_producto_categoria`, `idx_producto_nombre` |
| Prefijo `idx_` + tabla + columna | `idx_inventario_producto`, `idx_inventario_talla`, `idx_inventario_color` |
| Compuestos | `idx_producto_imagen` sobre `(producto_id, producto_imagen_orden)` |

### 7.4 Restricciones

| Convención | Ejemplo |
|---|---|
| Clave foránea | `fk_<tabla>_<columna>` (implícito en MySQL) |
| Clave única | `uk_<tabla>_<columna>` | `uk_inventario_imagen` |

> En el proyecto actual, las FK se declaran inline (`FOREIGN KEY (categoria_id) REFERENCES categoria(categoria_id)`), sin nombre explícito. MySQL las nombra automáticamente. Si en el futuro se requiere control total, se añadirá el prefijo `fk_`.

---

## 8. Nomenclatura de la API REST

### 8.1 Rutas

| Convención | Ejemplo |
|---|---|
| Prefijo `/api/` | `/api/productos` |
| Recursos en **plural** | `/api/productos`, `/api/categorias`, `/api/tallas`, `/api/colores`, `/api/clientes` |
| Sub-recursos | `/<recurso>/:id/<subrecurso>` | `/api/productos/:id/imagenes` |
| Acciones sobre sub-recursos | `/<recurso>/:id/<subrecurso>/<accion>` | `/api/productos/:id/imagenes/:imagenId/principal` |
| Parámetros | `camelCase` en `:param` | `:id`, `:imagenId` |

### 8.2 Métodos HTTP

| Método | Uso |
|---|---|
| `GET` | Consultar recursos. |
| `POST` | Crear recursos. |
| `PUT` | Actualizar recursos completos o marcar principal. |
| `DELETE` | Eliminar recursos. |

### 8.3 Endpoints reales

```text
GET    /
GET    /api/health
GET    /api/productos
GET    /api/productos/destacados
GET    /api/productos/:id
GET    /api/productos/:id/detalle
POST   /api/productos
PUT    /api/productos/:id
GET    /api/productos/:id/imagenes
POST   /api/productos/:id/imagenes
DELETE /api/productos/:id/imagenes/:imagenId
PUT    /api/productos/:id/imagenes/:imagenId/principal
GET    /api/categorias
GET    /api/categorias/:id
GET    /api/tallas
GET    /api/tallas/:id
GET    /api/colores
GET    /api/colores/:id
GET    /api/clientes
GET    /api/clientes/:id
```

### 8.4 Formato de respuesta

| Tipo | Formato |
|---|---|
| Colección | `{ ok: true, total: N, data: [] }` |
| Recurso | `{ ok: true, data: {} }` |
| Creación | `{ ok: true, producto_id, imagenes_registradas: [] }` |
| Actualización | `{ ok: true, actualizados: N }` |
| Eliminación | `{ ok: true, eliminada: N }` |
| Error | `{ ok: false, error, status, path }` |

### 8.5 Headers personalizados

| Header | Valor | Significado |
|---|---|---|
| `X-Cache` | `HIT` | Respuesta desde caché en memoria. |
| `X-Cache` | `MISS` | Respuesta consultada a la BD (y guardada en caché). |

---

## 9. Nomenclatura del Frontend

### 9.1 Constantes globales

| Constante | Valor / propósito |
|---|---|
| `API_URL` | `http://localhost:3000/api` |
| `API_BASE` | `http://localhost:3000` |
| `CARRITO_KEY` | `gissi_deportivo_carrito_v1` |
| `WA_NUMERO` | `593993939058` |
| `MONEDA` | `'$'` |
| `THEME_KEY` | `gissi_theme_v1` |

### 9.2 Estado global

| Variable | Uso |
|---|---|
| `estadoFiltros` | `{ categoria, busqueda, productos }` |
| `carrusel` | Objeto con `imagenes`, `indice`, métodos `ir/siguiente/anterior/render` |
| `productoActual` | Producto cargado en `producto.html` |
| `paginaActual` | `'inicio' | 'catalogo' | 'producto' | 'proceso' | 'nosotros'` |

### 9.3 Clases CSS

| Convención | Ejemplo |
|---|---|
| Base + elemento (BEM) | `.catalog-item`, `.catalog-image`, `.catalog-info` |
| Modificadores | `.catalog-item.dark`, `.filter.active` |
| Estados | `.is-open`, `.is-active`, `.is-visible`, `.is-loaded`, `.is-hiding` |
| Utilidades | `.noise`, `.eyebrow`, `.centered`, `.sr-only` (si se añade) |
| Componentes | `.carrito-drawer`, `.carrito-item`, `.detalle__gallery`, `.detalle__info` |

### 9.4 Data attributes

| Atributo | Uso |
|---|---|
| `data-id` | ID del producto. |
| `data-category` | Categoría del producto (para filtros). |
| `data-nombre` | Nombre del producto (para WhatsApp). |
| `data-precio` | Precio referencial. |
| `data-imagen` | URL de imagen (para el carrito). |
| `data-accion` | Acción declarativa (`wsp-producto`, `wsp-proceso`, `wsp-nosotros`, `wsp-general`). |
| `data-action` | Acción interna del carrito (`mas`, `menos`, `eliminar`). |
| `data-theme` | Tema activo (`naranja`, `azul`, ...). |

### 9.5 Variables CSS

| Variable | Propósito |
|---|---|
| `--bg`, `--bg-2`, `--bg-3` | Fondos. |
| `--fg`, `--fg-2`, `--muted` | Textos. |
| `--line` | Bordes. |
| `--accent`, `--accent-2` | Colores de acento (cambian por tema). |
| `--font-display`, `--font-body`, `--font-mono` | Tipografías. |
| `--container`, `--radius`, `--transition` | Layout y transiciones. |

### 9.6 API pública global

| Objeto | Métodos |
|---|---|
| `GissiCarrito` | `agregar`, `abrir`, `cerrar`, `vaciar`, `total`, `cantidad`, `consultarProducto`, `mensajeProducto`, `mensajePedido`. |
| `GissiToast` | `exito(msg, dur)`, `error(msg, dur)`, `info(msg, dur)`. |

---

## 10. Nomenclatura de Documentación

| Archivo | Propósito |
|---|---|
| `README.md` | Descripción general y ejecución. |
| `docs/arquitectura.md` | Arquitectura de tres capas y mecanismos transversales. |
| `docs/conexion-bd.md` | Pool de conexiones y pruebas. |
| `docs/convencion-nombres.md` | Este documento. |
| `docs/postman/` | Colección de Postman. |

**Regla:** los documentos técnicos usan `kebab-case` (con guiones) y `.md`. Las capturas se referencian con el prefijo `**Captura:**` seguido de la descripción.

---

## 11. Convenciones Git

| Elemento | Convención | Ejemplo |
|---|---|---|
| Rama principal | `main` | `main` |
| Ramas de funcionalidad | `feature/<nombre>` | `feature/filtros-busqueda`, `feature/carrito` |
| Ramas de corrección | `fix/<nombre>` | `fix/cache-invalidation` |
| Ramas de documentación | `docs/<nombre>` | `docs/readme-update` |
| Mensajes de commit | Verbo presente + descripción | `Agrega endpoint de productos` |
| Commits con scope | `tipo(scope): descripción` | `feat(productos): agrega filtros` |

### 11.1 Archivos que no se versionan

```text
node_modules/
.env
*.log
backend/logs/
backend/uploads/       # solo .gitkeep se versiona
```

---

## 12. Ejemplos Reales del Proyecto

### 12.1 Backend — controlador

```javascript
// backend/controllers/productoController.js
const ProductoController = {
  listar: async (req, res, next) => { ... },
  obtenerPorId: async (req, res, next) => { ... },
  crear: async (req, res, next) => { ... }
};
```

### 12.2 Backend — modelo

```javascript
// backend/models/productoModel.js
const SUBQUERY_IMAGEN_PRINCIPAL = `...`;
const SUBQUERY_COLORES = `...`;
const SUBQUERY_TALLAS = `...`;

const ProductoModel = {
  obtenerTodos: async () => { ... },
  obtenerPorId: async (id) => { ... }
};
```

### 12.3 Backend — middleware

```javascript
// backend/middlewares/cache.js
const cacheMiddleware = (ttlSegundos = 60) => { ... };
module.exports = cacheMiddleware;
```

### 12.4 Frontend — app.js

```javascript
// frontend/public/script/app.js
const estadoFiltros = { categoria: 'all', busqueda: '', productos: [] };

function aplicarFiltros() { ... }
function generarFiltros(productos) { ... }
function crearTarjetaProducto(producto) { ... }
```

### 12.5 Frontend — carrito.js

```javascript
// frontend/public/script/carrito.js
const CARRITO_KEY = 'gissi_deportivo_carrito_v1';
const WA_NUMERO = '593993939058';

const formatearConsultaProducto = (producto) => { ... };
const formatearPedidoCarrito = (items, total) => { ... };

window.GissiCarrito = { agregar, abrir, cerrar, vaciar, ... };
```

### 12.6 Frontend — temas.js

```javascript
// frontend/public/script/temas.js
const THEME_KEY = 'gissi_theme_v1';
const DEFAULT_THEME = 'azul';

const TEMAS = {
  naranja:  { nombre: 'Naranja',  accent: '#ff5a1f', accent2: '#e63946' },
  azul:     { nombre: 'Azul',     accent: '#3b82f6', accent2: '#2563eb' },
  ...
};
```

---

## 13. Reglas de Consistencia

1. Si el backend usa `camelCase` para archivos, el frontend también.
2. Si las tablas son singulares (`producto`), todas las tablas lo son (`categoria`, `talla`, `color`, `cliente`, `pedido`, `usuario`, `proveedor`).
3. Si las columnas llevan prefijo de tabla (`producto_id`), todas las columnas de esa tabla también (`producto_nombre`, `producto_precio`, ...).
4. Los **índices** siempre empiezan con `idx_`.
5. Las **constantes de configuración** siempre en `UPPER_SNAKE_CASE`.
6. Las **claves de `localStorage`** siempre con prefijo `gissi_` y versión `_v1`.
7. Los **headers personalizados** siempre con prefijo `X-`.
8. Los **documentos** en `kebab-case`; el **código** en `camelCase` o `PascalCase`.
9. Los **archivos subidos** no se versionan; solo `uploads/.gitkeep`.
10. Los **logs** no se versionan; solo `logs/` como carpeta ignorada.

---

## 14. Referencias

| Archivo | Contenido |
|---|---|
| `README.md` | Descripción general y ejecución. |
| `docs/arquitectura.md` | Arquitectura de tres capas y mecanismos transversales. |
| `docs/conexion-bd.md` | Pool de conexiones y pruebas. |
| `docs/convencion-nombres.md` | Este documento. |
| `database/init.sql` | Esquema, índices y datos de prueba. |
| `docs/postman/` | Colección de pruebas de la API. |

---

**Nota:** Esta convención aplica para todo el proyecto y puede actualizarse según necesidades del desarrollo.