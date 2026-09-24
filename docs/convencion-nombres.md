# Convención de Nombres del Proyecto Gissi

**Proyecto:** Plataforma Web para la Asociación de Economía Solidaria Los Pastos
**Versión:** 1.0  
**Fecha:** 22 de septiembre de 2026

---

## 1. Objetivo

Establecer reglas simples y consistentes para nombrar archivos, carpetas, variables y elementos del proyecto, facilitando el desarrollo individual y el mantenimiento del código.

---

## 2. Estructura del Proyecto

```text
gissi-plataforma/
├── frontend/                 # HTML, CSS y JS del cliente
├── backend/                  # Servidor Node.js/Express
│   ├── config/               # Configuración de BD
│   ├── controllers/          # Lógica de negocio
│   ├── models/               # Acceso a datos
│   ├── routes/               # Endpoints
│   ├── app.js                # Punto de entrada
│   └── package.json
├── database/                 # Scripts SQL
│   └── init.sql
├── docs/                     # Documentación
├── .gitignore
└── README.md
```

---

## 3. Reglas de Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Carpetas | Minúsculas, plural | `controllers`, `models` |
| Archivos JS | Minúsculas con guiones | `producto-controller.js` |
| Archivos SQL | Minúsculas con guiones | `init.sql` |
| Archivos HTML/CSS | Minúsculas con guiones | `catalogo.html`, `estilos.css` |
| Variables | camelCase | `nombreProducto` |
| Funciones | camelCase con verbo | `obtenerProductos()` |
| Constantes | MAYÚSCULAS con guion bajo | `DB_HOST`, `PORT` |
| Clases | PascalCase | `ProductoModel` |
| Tablas BD | Minúsculas, plural | `productos`, `categorias` |
| Columnas BD | Minúsculas con guion bajo | `id_producto`, `nombre_producto` |
| Claves primarias | `id_` + tabla singular | `id_producto` |
| Variables de entorno | MAYÚSCULAS con guion bajo | `DB_PASSWORD` |
| Rutas API | Minúsculas, plural, prefijo `/api/` | `/api/productos` |

---

## 4. Convenciones Git

| Elemento | Convención | Ejemplo |
|---|---|---|
| Mensajes de commit | Verbo presente + descripción | `Agrega endpoint de productos` |
| Rama principal | `main` | `main` |
| Ramas de funcionalidad | `feature/` + nombre | `feature/filtros-busqueda` |

---

## 5. Documentación

| Archivo | Contenido |
|---|---|
| `README.md` | Descripción general y estructura |
| `docs/convencion-nombres.md` | Este documento |
| `docs/arquitectura.md` | Diagrama de tres capas |
| `docs/diseno-base-datos.md` | Diagrama E/R y diccionario |

---

## 6. Reglas Generales

1. Sin tildes ni caracteres especiales en nombres de archivos.
2. Nombres descriptivos y consistentes en todo el proyecto.
3. Commits frecuentes con mensajes claros.
4. Mantener la separación por capas (rutas, controladores, modelos, configuración).

---

**Nota:** Esta convención aplica para todo el proyecto y puede actualizarse según necesidades del desarrollo.