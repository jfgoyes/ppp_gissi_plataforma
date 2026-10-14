const fs   = require('fs');
const path = require('path');

const ProductoModel       = require('../models/productoModel');
const ProductoImagenModel = require('../models/productoImagenModel');
const ApiError            = require('../utils/ApiError');
const validarId           = require('../utils/validarId');

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

  /**
   * Detalle completo con TODAS sus imágenes (para galería / modal).
   */
  obtenerConImagenes: async (req, res, next) => {
    try {
      const id = validarId(req.params.id);
      const producto = await ProductoModel.obtenerPorId(id);
      if (!producto) throw new ApiError(404, `No se encontró un producto con ID ${id}`);

      const imagenes = await ProductoImagenModel.obtenerPorProducto(id);
      res.json({ ok: true, data: { ...producto, imagenes } });
    } catch (error) {
      console.error('Error al obtener detalle:', error.message);
      next(error);
    }
  },

  /**
   * Crear producto.
   * Acepta multipart/form-data:
   *  - campo "imagen"               → archivo subido
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

      // 2a) Archivo subido → primera imagen, principal
      if (req.file) {
        const id = await ProductoImagenModel.crear({
          producto_id: productoId,
          producto_imagen_url: `/uploads/${req.file.filename}`,
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

  /**
   * Actualizar datos del producto.
   * NO reemplaza imágenes. Para gestionar imágenes usa los endpoints /imagenes.
   */
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

  /**
   * Agregar una imagen a un producto existente.
   * Acepta archivo o URL. Si es la primera, se marca como principal.
   */
  agregarImagen: async (req, res, next) => {
    try {
      const productoId = validarId(req.params.id);
      const { producto_imagen_url, producto_imagen_principal } = req.body;

      // Verificar que el producto existe
      const producto = await ProductoModel.obtenerPorId(productoId);
      if (!producto) throw new ApiError(404, `Producto ${productoId} no encontrado`);

      if (!req.file && (!producto_imagen_url || !producto_imagen_url.trim())) {
        throw new ApiError(400, 'Debes enviar un archivo o una URL de imagen');
      }

      // ¿Es la primera imagen del producto?
      const totalActual = await ProductoImagenModel.contarPorProducto(productoId);
      const esPrimera   = totalActual === 0;

      const url = req.file
        ? `/uploads/${req.file.filename}`
        : producto_imagen_url.trim();

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
   * Si es un archivo local, lo borra del disco también.
   * Si era la principal, marca la siguiente como principal.
   */
  eliminarImagen: async (req, res, next) => {
    try {
      const productoId = validarId(req.params.id);
      const imagenId   = validarId(req.params.imagenId);

      const imagen = await ProductoImagenModel.obtenerPorId(imagenId);
      if (!imagen || imagen.producto_id !== productoId) {
        throw new ApiError(404, 'Imagen no encontrada para este producto');
      }

      // Si es archivo local, borrarlo del disco
      if (imagen.producto_imagen_origen === 'upload' &&
          imagen.producto_imagen_url.startsWith('/uploads/')) {
        const rutaFisica = path.join(__dirname, '..', imagen.producto_imagen_url);
        fs.promises.unlink(rutaFisica).catch(() => {
          console.warn('No se pudo borrar el archivo físico:', rutaFisica);
        });
      }

      const eraPrincipal = imagen.producto_imagen_principal;

      await ProductoImagenModel.eliminar(imagenId);

      // Si era la principal y quedan imágenes, promover la siguiente
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

  /**
   * Marcar una imagen como principal.
   */
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