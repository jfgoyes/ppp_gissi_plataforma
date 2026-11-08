const fs   = require('fs');
const path = require('path');

const ProductoModel       = require('../models/productoModel');
const ProductoImagenModel = require('../models/productoImagenModel');
const ApiError            = require('../utils/ApiError');
const validarId           = require('../utils/validarId');
const { optimizarImagen } = require('../config/imagenOptimizer');

// ============================================================
// Helper: elimina del disco TODAS las variantes WebP generadas
// por optimizarImagen (-sm, -md, -lg). El original .jpg/.png
// también se intenta borrar por compatibilidad con imágenes
// antiguas (subidas antes de este cambio), pero ya no se
// generan nuevas.
// No falla si algún archivo no existe.
// ============================================================
const borrarVariantesDeImagen = async (productoImagenUrl) => {
  if (!productoImagenUrl || !productoImagenUrl.startsWith('/uploads/')) return;

  const uploadsDir = path.join(__dirname, '..', 'uploads');

  // 1) Quitar extensión → "producto-123-456-md"
  // 2) Quitar sufijo de variante → "producto-123-456"
  let baseName = path.basename(productoImagenUrl, path.extname(productoImagenUrl));
  baseName = baseName.replace(/-(sm|md|lg)$/, '');

  // Candidatos a borrar:
  //  - Las 3 variantes WebP (siempre existen para subidas nuevas)
  //  - Los formatos originales (por compatibilidad con subidas previas)
  const candidatos = [
    `${baseName}-sm.webp`,
    `${baseName}-md.webp`,
    `${baseName}-lg.webp`,
    // Compatibilidad con archivos antiguos (antes del cambio)
    `${baseName}.jpg`,
    `${baseName}.jpeg`,
    `${baseName}.png`,
    `${baseName}.webp`
  ];

  const resultados = await Promise.all(
    candidatos.map(async (nombre) => {
      const ruta = path.join(uploadsDir, nombre);
      try {
        await fs.promises.unlink(ruta);
        return { nombre, borrado: true };
      } catch (err) {
        // ENOENT: el archivo no existía → no es un error real
        if (err.code === 'ENOENT') return { nombre, borrado: false, motivo: 'no existía' };
        return { nombre, borrado: false, motivo: err.message };
      }
    })
  );

  // Log en dev para ver qué se intenta borrar (útil para depurar)
  if (process.env.NODE_ENV !== 'production') {
    const borrados = resultados.filter(r => r.borrado).map(r => r.nombre);
    if (borrados.length > 0) {
      console.log(`[borrarVariantes] eliminados: ${borrados.join(', ')}`);
    }
  }
};

const ProductoController = {

  // ============================================================
  // PRODUCTOS
  // ============================================================

  listar: async (req, res, next) => {
    try {
      const productos = await ProductoModel.obtenerTodos();
      res.json({ ok: true, total: productos.length, data: productos });
    } catch (error) {
      console.error('Error al listar productos:', error.message);
      next(new ApiError(500, 'Error al obtener los productos'));
    }
  },

  listarDestacados: async (req, res, next) => {
    try {
      const destacados = await ProductoModel.obtenerDestacados();
      res.json({ ok: true, total: destacados.length, data: destacados });
    } catch (error) {
      console.error('Error al listar destacados:', error.message);
      next(new ApiError(500, 'Error al obtener los productos destacados'));
    }
  },

  obtenerPorId: async (req, res, next) => {
    try {
      const id = validarId(req.params.id);
      const producto = await ProductoModel.obtenerPorId(id);
      if (!producto) throw new ApiError(404, `No se encontró un producto con ID ${id}`);
      res.json({ ok: true, data: producto });
    } catch (error) {
      console.error('Error al obtener producto:', error.message);
      next(error);
    }
  },

  obtenerConImagenes: async (req, res, next) => {
    try {
      const id = validarId(req.params.id);
      const producto = await ProductoModel.obtenerDetalleCompleto(id);
      if (!producto) throw new ApiError(404, `No se encontró un producto con ID ${id}`);
      res.json({ ok: true, data: producto });
    } catch (error) {
      console.error('Error al obtener detalle:', error.message);
      next(error);
    }
  },

  /**
   * Crear producto.
   * Acepta multipart/form-data:
   *  - campo "imagen"               → archivo subido (se optimiza a WebP)
   *  - campo "producto_imagen_url"  → URL externa
   * Se pueden enviar AMBOS y se guardan como 2 imágenes.
   */
  crear: async (req, res, next) => {
    try {
      const {
        producto_nombre,
        producto_descripcion,
        producto_precio,
        categoria_id,
        producto_destacado,
        producto_imagen_url
      } = req.body;

      if (!producto_nombre || !producto_precio) {
        if (req.file) fs.promises.unlink(req.file.path).catch(() => {});
        throw new ApiError(400, 'Nombre y precio son obligatorios');
      }

      // 1) Crear el producto (SIN imágenes)
      const productoId = await ProductoModel.crear({
        producto_nombre,
        producto_descripcion: producto_descripcion || null,
        producto_precio,
        categoria_id: categoria_id || null,
        producto_destacado: producto_destacado === 'true' || producto_destacado === true
      });

      // 2) Registrar imágenes (si las hay)
      const imagenesRegistradas = [];

      // 2a) Archivo subido → optimizar y guardar variante "md" (800px) como principal
      if (req.file) {
        let urlOptimizada = `/uploads/${req.file.filename}`; // fallback si sharp falla

        try {
          const variantes = await optimizarImagen(req.file);
          // Preferimos la variante "md" (800px WebP) como URL pública.
          // El frontend usará srcset para elegir sm/md/lg según viewport.
          urlOptimizada = variantes.md || urlOptimizada;
        } catch (sharpError) {
          // Si la optimización falla, NO abortamos: guardamos el original.
          console.warn(
            'Optimización de imagen falló, se usará el original:',
            sharpError.message
          );
        }

        const id = await ProductoImagenModel.crear({
          producto_id: productoId,
          producto_imagen_url: urlOptimizada,
          producto_imagen_alt: producto_nombre,
          producto_imagen_orden: 0,
          producto_imagen_principal: true,
          producto_imagen_origen: 'upload'
        });
        imagenesRegistradas.push({ producto_imagen_id: id, origen: 'upload' });
      }

      // 2b) URL externa → segunda imagen (o principal si no hay archivo)
      if (producto_imagen_url && producto_imagen_url.trim()) {
        const id = await ProductoImagenModel.crear({
          producto_id: productoId,
          producto_imagen_url: producto_imagen_url.trim(),
          producto_imagen_alt: producto_nombre,
          producto_imagen_orden: imagenesRegistradas.length,
          producto_imagen_principal: imagenesRegistradas.length === 0,
          producto_imagen_origen: 'url'
        });
        imagenesRegistradas.push({ producto_imagen_id: id, origen: 'url' });
      }

      res.status(201).json({
        ok: true,
        producto_id: productoId,
        imagenes_registradas: imagenesRegistradas
      });

    } catch (error) {
      console.error('Error al crear producto:', error.message);
      next(error.statusCode ? error : new ApiError(500, 'Error al crear el producto'));
    }
  },

  actualizar: async (req, res, next) => {
    try {
      const id = validarId(req.params.id);
      const {
        producto_nombre,
        producto_descripcion,
        producto_precio,
        categoria_id,
        producto_destacado
      } = req.body;

      const actual = await ProductoModel.obtenerPorId(id);
      if (!actual) throw new ApiError(404, `No se encontró un producto con ID ${id}`);

      const filas = await ProductoModel.actualizar(id, {
        producto_nombre,
        producto_descripcion,
        producto_precio,
        categoria_id,
        producto_destacado: producto_destacado === 'true' || producto_destacado === true
      });

      res.json({ ok: true, actualizados: filas });
    } catch (error) {
      console.error('Error al actualizar producto:', error.message);
      next(error.statusCode ? error : new ApiError(500, 'Error al actualizar el producto'));
    }
  },

  // ============================================================
  // IMÁGENES DEL PRODUCTO
  // ============================================================

  listarImagenes: async (req, res, next) => {
    try {
      const id = validarId(req.params.id);
      const imagenes = await ProductoImagenModel.obtenerPorProducto(id);
      res.json({ ok: true, total: imagenes.length, data: imagenes });
    } catch (error) {
      console.error('Error al listar imágenes:', error.message);
      next(error);
    }
  },

  agregarImagen: async (req, res, next) => {
    try {
      const productoId = validarId(req.params.id);
      const { producto_imagen_url, producto_imagen_principal } = req.body;

      const producto = await ProductoModel.obtenerPorId(productoId);
      if (!producto) {
        if (req.file) fs.promises.unlink(req.file.path).catch(() => {});
        throw new ApiError(404, `Producto ${productoId} no encontrado`);
      }

      if (!req.file && (!producto_imagen_url || !producto_imagen_url.trim())) {
        throw new ApiError(400, 'Debes enviar un archivo o una URL de imagen');
      }

      const totalActual = await ProductoImagenModel.contarPorProducto(productoId);
      const esPrimera   = totalActual === 0;

      let url;
      if (req.file) {
        url = `/uploads/${req.file.filename}`; // fallback
        try {
          const variantes = await optimizarImagen(req.file);
          url = variantes.md || url;
        } catch (sharpError) {
          console.warn(
            'Optimización de imagen falló, se usará el original:',
            sharpError.message
          );
        }
      } else {
        url = producto_imagen_url.trim();
      }

      const imagenId = await ProductoImagenModel.crear({
        producto_id: productoId,
        producto_imagen_url: url,
        producto_imagen_alt: producto.producto_nombre,
        producto_imagen_orden: totalActual,
        producto_imagen_principal:
          esPrimera ||
          producto_imagen_principal === 'true' ||
          producto_imagen_principal === true,
        producto_imagen_origen: req.file ? 'upload' : 'url'
      });

      res.status(201).json({
        ok: true,
        producto_imagen_id: imagenId,
        producto_imagen_url: url,
        es_principal: esPrimera
      });

    } catch (error) {
      console.error('Error al agregar imagen:', error.message);
      next(error.statusCode ? error : new ApiError(500, 'Error al agregar la imagen'));
    }
  },

  /**
   * Eliminar una imagen del producto.
   * Borra del disco las 3 variantes WebP (y, por compatibilidad,
   * cualquier original .jpg/.png/.webp de imágenes antiguas).
   */
  eliminarImagen: async (req, res, next) => {
    try {
      const productoId = validarId(req.params.id);
      const imagenId   = validarId(req.params.imagenId);

      const imagen = await ProductoImagenModel.obtenerPorId(imagenId);
      if (!imagen || imagen.producto_id !== productoId) {
        throw new ApiError(404, 'Imagen no encontrada para este producto');
      }

      // Si es archivo local, borrar del disco todas las variantes
      if (imagen.producto_imagen_origen === 'upload' &&
          imagen.producto_imagen_url.startsWith('/uploads/')) {
        // No esperamos: el borrado físico no debe bloquear la respuesta HTTP
        borrarVariantesDeImagen(imagen.producto_imagen_url).catch(err => {
          console.warn('No se pudieron borrar variantes físicas:', err.message);
        });
      }

      const eraPrincipal = imagen.producto_imagen_principal;

      await ProductoImagenModel.eliminar(imagenId);

      if (eraPrincipal) {
        const restantes = await ProductoImagenModel.obtenerPorProducto(productoId);
        if (restantes.length > 0) {
          await ProductoImagenModel.marcarPrincipal(
            productoId,
            restantes[0].producto_imagen_id
          );
        }
      }

      res.json({ ok: true, eliminada: imagenId });
    } catch (error) {
      console.error('Error al eliminar imagen:', error.message);
      next(error.statusCode ? error : new ApiError(500, 'Error al eliminar la imagen'));
    }
  },

  marcarImagenPrincipal: async (req, res, next) => {
    try {
      const productoId = validarId(req.params.id);
      const imagenId   = validarId(req.params.imagenId);

      const imagen = await ProductoImagenModel.obtenerPorId(imagenId);
      if (!imagen || imagen.producto_id !== productoId) {
        throw new ApiError(404, 'Imagen no encontrada para este producto');
      }

      await ProductoImagenModel.marcarPrincipal(productoId, imagenId);
      res.json({ ok: true });
    } catch (error) {
      console.error('Error al marcar principal:', error.message);
      next(error.statusCode ? error : new ApiError(500, 'Error al marcar la imagen'));
    }
  }
};

module.exports = ProductoController;