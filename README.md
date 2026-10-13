# Plataforma Web Gissi

Plataforma web para la **Asociación de Economía Solidaria Los Pastos**, dedicada a la confección y distribución de prendas textiles escolares, de trabajo, deportivas y más.

---

## 📋 Descripción general

Gissi es una plataforma cliente-servidor de tres capas que permite consultar el catálogo de productos textiles de la asociación.

El sistema está diseñado para escalar progresivamente. Actualmente implementa endpoints de solo lectura (`GET`) para productos, categorías, tallas, colores y clientes, con una base sólida para futuras funcionalidades, como carrito de compras, pedidos y autenticación.

---

## 🛠️ Tecnologías

| Capa | Tecnología | Puerto |
|---|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) | 5500 (Live Server) |
| **Backend** | Node.js + Express 5 | 3000 |
| **Base de datos** | MySQL (`mysql2`) | 3306 |

### Dependencias del backend

- **Producción:** `express`, `cors`, `dotenv`, `mysql2`.
- **Desarrollo:** `nodemon`.

### Tecnologías del frontend

- **Google Fonts:** Inter y Playfair Display.
- **Font Awesome 6.5:** iconografía.
- **Fetch API:** consumo de la API del backend.

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
│   ├── test-connection.js          # Prueba de conexión a MySQL
│   ├── config/
│   │   └── database.js             # Pool de conexiones MySQL
│   ├── controllers/                # Lógica de negocio
│   │   ├── categoriaController.js
│   │   ├── clienteController.js
│   │   ├── colorController.js
│   │   ├── productoController.js
│   │   └── tallaController.js
│   ├── middlewares/
│   │   └── errorHandler.js         # Manejo global de errores
│   ├── models/                     # Acceso a datos
│   │   ├── categoriaModel.js
│   │   ├── clienteModel.js
│   │   ├── colorModel.js
│   │   ├── productoModel.js
│   │   └── tallaModel.js
│   ├── routes/                     # Endpoints de la API
│   │   ├── categoriaRoutes.js
│   │   ├── clienteRoutes.js
│   │   ├── colorRoutes.js
│   │   ├── productoRoutes.js
│   │   └── tallaRoutes.js
│   └── utils/
│       ├── ApiError.js             # Clase de error personalizada
│       └── validarId.js            # Validación de IDs numéricos
├── database/
│   ├── init.sql                    # Script principal de BD y datos
│   └── init_backup_21_09_2026.sql  # Respaldo del script
├── docs/
│   ├── arquitectura.md             # Arquitectura cliente-servidor
│   ├── conexion-bd.md              # Documentación del pool MySQL
│   ├── convencion-nombres.md       # Reglas de nomenclatura
│   └── postman/
│       └── Gissi_API_Endpoints_GET.postman_collection.json
└── frontend/
    ├── index.html                  # Página principal
    └── public/
        ├── script/
        │   ├── app.js              # Conexión con backend mediante Fetch API
        │   └── script.js           # Interacciones de la interfaz
        └── style/
            └── styles.css          # Estilos e identidad visual de Gissi
```

---

## 🗄️ Base de datos

**Nombre:** `gissi_plataforma_db`

**Motor:** MySQL

**Cotejamiento:** `utf8mb4_unicode_ci`

### Tablas implementadas

| Tabla | Descripción |
|---|---|
| `categoria` | Categorías de productos: escolar, trabajo y deportivo. |
| `producto` | Catálogo de productos con precio y categoría. |
| `talla` | Tallas disponibles: XS, S, M, L, XL y XXL. |
| `color` | Colores disponibles para los productos. |
| `inventario` | Variantes de producto, talla y color con su respectivo stock. |
| `cliente` | Clientes registrados, con cédula única. |
| `pedido` | Pedidos con estado y total. |
| `detalle_pedido` | Detalle de los pedidos asociado a `inventario`. |
| `usuario` | Usuarios con roles de administrador y vendedor. |
| `proveedor` | Proveedores de textiles. |

### Datos de prueba incluidos

- 3 categorías.
- 6 tallas.
- 6 colores.
- 20 productos textiles.
- 20 registros de inventario.
- 5 clientes.
- 2 usuarios.
- 3 proveedores.

### Inicialización de la base de datos

Desde la raíz del proyecto, ejecuta:

```bash
mysql -u root -p < database/init.sql
```

El comando solicitará la contraseña del usuario de MySQL. El script `database/init.sql` debe crear o inicializar la estructura y los datos necesarios para el proyecto.

---

## 🔌 API REST

**URL base:** `http://localhost:3000`

La API permite consultar los recursos principales de la plataforma mediante solicitudes HTTP `GET`.

### Ruta raíz

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/` | Información de la API y endpoints disponibles. |

### Endpoints de los recursos

| Recurso | Listar todos | Consultar por ID |
|---|---|---|
| Productos | `GET /api/productos` | `GET /api/productos/:id` |
| Categorías | `GET /api/categorias` | `GET /api/categorias/:id` |
| Tallas | `GET /api/tallas` | `GET /api/tallas/:id` |
| Colores | `GET /api/colores` | `GET /api/colores/:id` |
| Clientes | `GET /api/clientes` | `GET /api/clientes/:id` |

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
  "error": "Mensaje",
  "status": 404,
  "path": "/api/productos/999"
}
```

Los valores de ejemplo son ilustrativos. La respuesta real depende de los datos consultados y de la implementación del backend.

### Códigos HTTP

| Código | Situación |
|---|---|
| `200` | Consulta exitosa. |
| `400` | ID inválido: no numérico, negativo o igual a cero. |
| `404` | Recurso o ruta no encontrada. |
| `500` | Error interno del servidor. |

### Pruebas con Postman

La colección de Postman contiene los endpoints `GET` y los casos de prueba definidos para la API.

**Ubicación:** `docs/postman/Gissi_API_Endpoints_GET.postman_collection.json`

Para utilizarla:

1. Abre Postman.
2. Importa el archivo JSON de la colección.
3. Verifica que el backend esté ejecutándose en el puerto `3000`.
4. Ejecuta las solicitudes disponibles.

---

## ⚙️ Configuración y ejecución

### 1. Requisitos previos

Antes de iniciar el proyecto, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/).
- npm, incluido con Node.js.
- [MySQL](https://www.mysql.com/).
- [Visual Studio Code](https://code.visualstudio.com/) u otro editor de código.
- Live Server para ejecutar el frontend, si utilizas Visual Studio Code.
- Postman, opcional, para probar los endpoints.

### 2. Configurar las variables de entorno

Crea un archivo `.env` dentro de la carpeta `backend/`:

**Ruta:** `backend/.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contrasena
DB_NAME=gissi_plataforma_db
DB_PORT=3306
PORT=3000
```

Reemplaza `tu_contrasena` por la contraseña correspondiente a tu instalación de MySQL.

**Importante:** el archivo `.env` contiene credenciales y no debe versionarse en Git. Se recomienda mantener un archivo `.env.example` sin contraseñas reales como plantilla de configuración.

### 3. Instalar las dependencias

Desde la raíz del proyecto, ejecuta:

```bash
cd backend
npm install
```

Este comando instala las dependencias declaradas en `package.json`.

### 4. Inicializar la base de datos

Si todavía no has creado la base de datos, vuelve a la raíz del proyecto y ejecuta:

```bash
mysql -u root -p < database/init.sql
```

Si ya estás dentro de `backend/`, regresa primero al directorio raíz:

```bash
cd ..
mysql -u root -p < database/init.sql
```

Asegúrate de que MySQL esté iniciado y de que el usuario tenga los permisos necesarios.

### 5. Verificar la conexión a MySQL

Desde la carpeta `backend/`, ejecuta:

```bash
npm run test-db
```

Este comando utiliza el script configurado para comprobar la conexión a la base de datos.

Si se produce un error, revisa las credenciales de `.env`, el estado del servicio MySQL, el puerto y el nombre de la base de datos.

### 6. Iniciar el backend

En la carpeta `backend/`, ejecuta:

**Modo desarrollo**

```bash
npm run dev
```

**Modo de ejecución normal**

```bash
npm start
```

El comando `npm run dev` utiliza `nodemon` si así está configurado en `package.json`.

Cuando el servidor se inicie correctamente, la API estará disponible en:

`http://localhost:3000`

### 7. Ejecutar el frontend

Abre la carpeta `frontend/` en Visual Studio Code y ejecuta `index.html` mediante Live Server.

La dirección habitual será:

`http://127.0.0.1:5500`

El puerto puede variar según la configuración de Live Server.

El frontend consume los datos del backend mediante Fetch API, utilizando el archivo:

`frontend/public/script/app.js`

**Importante:** para visualizar los productos provenientes de MySQL, el backend debe estar iniciado y la conexión entre el frontend y la API debe estar correctamente configurada.

---

## 🎨 Frontend

La interfaz de Gissi está diseñada para presentar los productos textiles de la asociación mediante una experiencia visual moderna y adaptable a distintos dispositivos.

### Secciones de la interfaz

| Sección | Descripción |
|---|---|
| **Header / Navbar** | Navegación fija, menú desplegable de colecciones y menú hamburguesa para dispositivos móviles. |
| **Hero** | Banner principal con un llamado a la acción. |
| **USP Bar** | Presentación de beneficios relacionados con envíos, pagos, devoluciones y soporte. |
| **Nosotros** | Historia y estadísticas de la asociación. |
| **Categorías** | Secciones Gissi Escolar, Gissi Trabajo y Gissi Deportivo. |
| **Productos destacados** | Presentación de los productos más relevantes. |
| **Catálogo** | Cuadrícula de productos con filtros visuales. |
| **Reseñas** | Espacio destinado a testimonios de clientes. |
| **Contacto** | Formulario y datos de contacto. |
| **Footer** | Enlaces y redes sociales. |

### Diseño responsivo

La interfaz contempla los siguientes puntos de adaptación:

- `992px`
- `768px`
- `480px`

Los estilos están definidos en:

`frontend/public/style/styles.css`

### Archivos JavaScript

| Archivo | Responsabilidad |
|---|---|
| `frontend/public/script/app.js` | Comunicación con el backend mediante Fetch API y gestión de los datos de la aplicación. |
| `frontend/public/script/script.js` | Interacciones de la interfaz, navegación, desplazamiento y otros comportamientos visuales. |

---

## 📚 Documentación técnica

La carpeta `docs/` contiene la documentación complementaria del proyecto.

| Archivo | Contenido |
|---|---|
| `docs/arquitectura.md` | Arquitectura de tres capas, flujo de datos y puertos de comunicación. |
| `docs/conexion-bd.md` | Configuración del pool de conexiones MySQL y manejo de errores de base de datos. |
| `docs/convencion-nombres.md` | Reglas de nomenclatura utilizadas en el proyecto. |
| `docs/postman/` | Colección de endpoints `GET` para pruebas de la API. |

Se recomienda consultar estos documentos antes de modificar la arquitectura, la conexión a la base de datos o las convenciones de desarrollo.

---

## 🏗️ Arquitectura del sistema

El proyecto sigue una arquitectura cliente-servidor organizada en tres capas principales:

1. **Frontend:** presenta la interfaz y permite al usuario interactuar con el catálogo.
2. **Backend:** procesa las solicitudes HTTP, ejecuta la lógica de negocio y expone los endpoints de la API REST.
3. **Base de datos:** almacena los productos, categorías, tallas, colores, clientes y demás información del sistema.

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
Rutas y controladores
   |
   v
Modelos
   |
   v
Pool de conexiones MySQL
   |
   v
Base de datos (gissi_plataforma_db)
```

El backend recibe la solicitud del frontend, procesa la operación mediante las capas correspondientes, consulta MySQL y devuelve una respuesta en formato JSON.

---

## 📐 Convenciones del proyecto

Para mantener un código consistente, legible y fácil de mantener, se aplican las siguientes convenciones:

| Elemento | Convención | Ejemplo |
|---|---|---|
| Carpetas | Minúsculas y plural cuando corresponda. | `controllers`, `models` |
| Archivos JavaScript | Nombres descriptivos y consistentes. | `productoController.js` |
| Variables y funciones | `camelCase`. | `obtenerProductos()` |
| Clases | `PascalCase`. | `ProductoModel` |
| Tablas de la base de datos | Nombres en minúsculas. | `producto` |
| Columnas de la base de datos | Minúsculas y separación con guion bajo. | `categoria_id` |
| Rutas de la API | Minúsculas, nombres plurales y prefijo `/api/`. | `/api/productos` |
| Archivos y carpetas | Evitar tildes y caracteres especiales. | `conexion-bd.md` |

Estas reglas ayudan a mantener la uniformidad del código y facilitan la colaboración entre los integrantes del proyecto.

---

## 🚧 Estado del proyecto y próximos pasos

### ✅ Funcionalidades implementadas

- Arquitectura cliente-servidor de tres capas.
- Pool de conexiones MySQL con configuración de mantenimiento de conexiones.
- API REST con cinco recursos de consulta.
- Endpoints de lectura para productos, categorías, tallas, colores y clientes.
- Manejo centralizado de errores HTTP.
- Validación de identificadores numéricos.
- Frontend responsivo con identidad visual propia.
- Integración del frontend con el backend mediante Fetch API.
- Documentación técnica de arquitectura, conexión a la base de datos y convenciones.
- Colección de Postman para pruebas de endpoints.

### 🔜 Próximas implementaciones

- Incorporar endpoints `POST`, `PUT` y `DELETE` para completar las operaciones CRUD.
- Implementar autenticación y autorización por roles de usuario.
- Desarrollar el módulo de pedidos y detalles de pedidos.
- Implementar la gestión del inventario por producto, talla y color.
- Consolidar la integración del catálogo del frontend con los datos reales de la API.
- Desarrollar un carrito de compras funcional.
- Implementar búsqueda y filtros dinámicos de productos.
- Desarrollar el módulo de proveedores.
- Incorporar pruebas automatizadas para el backend y el frontend.

---

## 👥 Créditos

- **Proyecto:** Plataforma Web Gissi.
- **Organización:** Asociación de Economía Solidaria Los Pastos.
- **Ubicación:** Tulcán, Carchi, Ecuador.
- **Versión:** 1.0.
- **Año:** 2026.

---

## 📄 Licencia

Este proyecto utiliza la licencia **ISC**.