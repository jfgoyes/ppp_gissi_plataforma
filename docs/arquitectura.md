# Arquitectura del Proyecto Gissi

**Proyecto:** Plataforma Web para la Asociación de Economía Solidaria Los Pastos  
**Versión:** 1.0  
**Fecha:** 25 de septiembre de 2026  

---

## 1. Objetivo

Definir la arquitectura cliente-servidor de la plataforma web de Gissi, estableciendo las tres capas del sistema (Frontend, Backend y Base de Datos), el flujo de comunicación entre ellas, la configuración de variables de entorno y los puertos utilizados, sirviendo como referencia para el desarrollo y mantenimiento del proyecto.

---

## 2. Diagrama de Arquitectura Cliente-Servidor

La plataforma sigue el modelo de tres capas:

```text
┌─────────────────┐
│   NAVEGADOR     │
│   (Usuario)     │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│   FRONTEND      │  HTML + CSS + JavaScript
│  (Puerto 5500)  │  Live Server (desarrollo)
└────────┬────────┘
         │ Petición HTTP (GET /api/productos)
         ▼
┌─────────────────┐
│   BACKEND       │  Node.js + Express
│  (Puerto 3000)  │  Lógica de negocio
└────────┬────────┘
         │ Consulta SQL
         ▼
┌─────────────────┐
│ BASE DE DATOS   │  MySQL
│  (Puerto 3306)  │  Persistencia
└─────────────────┘
```

**Captura:** Diagrama de arquitectura cliente-servidor para la plataforma web.

---

## 3. Descripción de las Capas

| Capa | Tecnología | Función | Puerto |
|---|---|---|---|
| Frontend | HTML, CSS, JavaScript | Mostrar el catálogo al usuario | 5500 (Live Server) |
| Backend | Node.js + Express | Procesar peticiones y consultar la BD | 3000 |
| Base de Datos | MySQL | Almacenar productos, categorías, pedidos | 3306 |

---

## 4. Flujo de Datos

Flujo típico de una petición en la plataforma:

1. El usuario abre el navegador y accede al frontend.
2. El frontend realiza una petición HTTP al backend (por ejemplo, `GET /api/productos`).
3. El backend recibe la petición en el puerto 3000 y consulta la base de datos MySQL.
4. MySQL procesa la consulta en el puerto 3306 y devuelve los resultados al backend.
5. El backend responde al frontend en formato JSON.
6. El frontend renderiza los datos y los muestra al usuario.

---

## 5. Variables de Entorno

### 5.1 Archivo `.env`

Ubicado en `backend/`, almacena las credenciales y configuración sensible:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mysqldb123
DB_NAME=gissi_plataforma_db
DB_PORT=3306
PORT=3000
```

**Captura:** Archivo `.env` creado en la carpeta `backend/`.

### 5.2 Archivo `.env.example`

Plantilla sin credenciales reales para otros entornos:

```env
DB_HOST=direccion_ip
DB_USER=nombre_usuario
DB_PASSWORD=contraseña_aqui
DB_NAME=nombre_base_datos
DB_PORT=numero_puerto_bd
PORT=3000
```

### 5.3 Archivo `.gitignore`

Excluye el archivo `.env` del repositorio para proteger las credenciales:

```text
node_modules/
.env
*.log
```

**Captura:** Archivo `.gitignore` verificando la exclusión del `.env`.

---

## 6. Documentación de Puertos

| Capa | Puerto | Descripción |
|---|---|---|
| Frontend | 5500 (Live Server) | Puerto de desarrollo del frontend |
| Backend | 3000 | Puerto del servidor Node.js/Express |
| Base de Datos | 3306 | Puerto por defecto de MySQL |

---

## 7. Prueba Mínima de Conexión

### 7.1 Script de prueba

Archivo `backend/test-conexion-inicial.js`:

```javascript
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
```

**Captura:** Archivo `test-conexion-inicial.js` creado.

### 7.2 Ejecución

Desde la terminal en `backend/`:

```bash
node test-conexion-inicial.js
```

**Respuesta esperada:**

```text
Conexión inicial a MySQL establecida
Total de productos: 20
```

**Captura:** Terminal mostrando la conexión inicial exitosa.

### 7.3 Verificación

Con esta prueba se confirma que:

- Las variables de entorno se leen correctamente.
- El backend puede comunicarse con MySQL.
- La base de datos `gissi_plataforma_db` está accesible.
- La arquitectura de tres capas está lista para ser implementada.

---

## 8. Estructura de Carpetas Relacionada

```text
gissi-plataforma/
├── frontend/                  # HTML, CSS y JS del cliente
├── backend/                   # Servidor Node.js/Express
│   ├── config/                # Configuración de BD
│   ├── controllers/           # Lógica de negocio
│   ├── models/                # Acceso a datos
│   ├── routes/                # Endpoints
│   ├── app.js                 # Punto de entrada
│   ├── .env                   # Variables de entorno (no versionado)
│   ├── .env.example           # Plantilla de variables
│   └── package.json
├── database/                  # Scripts SQL
│   └── init.sql
├── docs/                      # Documentación
│   └── arquitectura.md        # Este documento
├── .gitignore
└── README.md
```

---

## 9. Reglas Generales

1. Mantener el archivo `.env` fuera del repositorio Git y usar `.env.example` como plantilla.
2. Verificar que las credenciales del `.env` coincidan con las configuradas en MySQL Workbench.
3. Documentar cualquier cambio en la arquitectura o en los puertos.
4. Mantener la separación por capas (rutas, controladores, modelos, configuración).
5. Sin tildes ni caracteres especiales en nombres de archivos y carpetas.

---

## 10. Referencias

| Archivo | Contenido |
|---|---|
| `README.md` | Descripción general y estructura |
| `docs/convencion-nombres.md` | Convención de nombres del proyecto |
| `docs/arquitectura.md` | Este documento |
| `docs/diseno-base-datos.md` | Diagrama E/R y diccionario |

---

**Nota:** Esta arquitectura aplica para todo el proyecto y puede actualizarse según necesidades del desarrollo.