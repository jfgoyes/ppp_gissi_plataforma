const pool = require('../config/database');

const ProductoImagenModel = {

  /**
   * Obtiene TODAS las imágenes de un producto, ordenadas.
   * La principal primero, luego por orden ascendente.
   */
  obtenerPorProducto: async (productoId) => {
    const [rows] = await pool.query(`
      SELECT producto_imagen_id, producto_id, producto_imagen_url,
             producto_imagen_alt, producto_imagen_orden,
             producto_imagen_principal, producto_imagen_origen,
             producto_imagen_creada
      FROM producto_imagen
      WHERE producto_id = ?
      ORDER BY producto_imagen_principal DESC,
               producto_imagen_orden ASC,
               producto_imagen_id ASC
    `, [productoId]);
    return rows;
  },

  /**
   * Obtiene solo la imagen principal de un producto.
   * Si no hay principal marcada, devuelve la de menor orden.
   */
  obtenerPrincipal: async (productoId) => {
    const [rows] = await pool.query(`
      SELECT producto_imagen_id, producto_imagen_url,
             producto_imagen_alt, producto_imagen_origen
      FROM producto_imagen
      WHERE producto_id = ?
      ORDER BY producto_imagen_principal DESC,
               producto_imagen_orden ASC,
               producto_imagen_id ASC
      LIMIT 1
    `, [productoId]);
    return rows[0] || null;
  },

  /**
   * Obtiene una imagen por su ID.
   */
  obtenerPorId: async (imagenId) => {
    const [rows] = await pool.query(
      'SELECT * FROM producto_imagen WHERE producto_imagen_id = ?',
      [imagenId]
    );
    return rows[0] || null;
  },

  /**
   * Crea una nueva imagen para un producto.
   * Si se marca como principal, desmarca las demás del mismo producto.
   */
  crear: async (datos) => {
    const {
      producto_id,
      producto_imagen_url,
      producto_imagen_alt = null,
      producto_imagen_orden = 0,
      producto_imagen_principal = false,
      producto_imagen_origen = 'upload'
    } = datos;

    // Si va a ser principal, quitar el flag a las demás del mismo producto
    if (producto_imagen_principal) {
      await pool.query(
        'UPDATE producto_imagen SET producto_imagen_principal = FALSE WHERE producto_id = ?',
        [producto_id]
      );
    }

    const [result] = await pool.query(`
      INSERT INTO producto_imagen
        (producto_id, producto_imagen_url, producto_imagen_alt,
         producto_imagen_orden, producto_imagen_principal, producto_imagen_origen)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      producto_id,
      producto_imagen_url,
      producto_imagen_alt,
      producto_imagen_orden,
      producto_imagen_principal ? 1 : 0,
      producto_imagen_origen
    ]);

    return result.insertId;
  },

  /**
   * Elimina una imagen por su ID.
   */
  eliminar: async (imagenId) => {
    const [result] = await pool.query(
      'DELETE FROM producto_imagen WHERE producto_imagen_id = ?',
      [imagenId]
    );
    return result.affectedRows;
  },

  /**
   * Marca una imagen como principal y desmarca las demás.
   */
  marcarPrincipal: async (productoId, imagenId) => {
    await pool.query(
      'UPDATE producto_imagen SET producto_imagen_principal = FALSE WHERE producto_id = ?',
      [productoId]
    );
    const [result] = await pool.query(
      `UPDATE producto_imagen SET producto_imagen_principal = TRUE
       WHERE producto_imagen_id = ? AND producto_id = ?`,
      [imagenId, productoId]
    );
    return result.affectedRows;
  },

  /**
   * Cuenta las imágenes de un producto (para saber si es la única).
   */
  contarPorProducto: async (productoId) => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS total FROM producto_imagen WHERE producto_id = ?',
      [productoId]
    );
    return rows[0].total;
  }
};

module.exports = ProductoImagenModel;