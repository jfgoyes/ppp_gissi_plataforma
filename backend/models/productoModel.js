const pool = require('../config/database');

// Subconsulta reutilizable para traer la imagen principal del producto.
// Prioriza: principal marcada > menor orden > menor id.
const SUBQUERY_IMAGEN_PRINCIPAL = `
  (SELECT pi.producto_imagen_url
   FROM producto_imagen pi
   WHERE pi.producto_id = p.producto_id
   ORDER BY pi.producto_imagen_principal DESC,
            pi.producto_imagen_orden ASC,
            pi.producto_imagen_id ASC
   LIMIT 1) AS producto_imagen
`;

const ProductoModel = {

  obtenerTodos: async () => {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.producto_nombre, p.producto_descripcion,
             p.producto_precio, p.categoria_id, c.categoria_nombre,
             p.producto_destacado,
             ${SUBQUERY_IMAGEN_PRINCIPAL}
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      ORDER BY p.producto_id ASC
    `);
    return rows;
  },

  obtenerPorId: async (id) => {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.producto_nombre, p.producto_descripcion,
             p.producto_precio, p.categoria_id, c.categoria_nombre,
             p.producto_destacado,
             ${SUBQUERY_IMAGEN_PRINCIPAL}
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      WHERE p.producto_id = ?
    `, [id]);
    return rows[0] || null;
  },

  obtenerDestacados: async () => {
    const [rows] = await pool.query(`
      SELECT p.producto_id, p.producto_nombre, p.producto_descripcion,
             p.producto_precio, p.categoria_id, c.categoria_nombre,
             p.producto_destacado,
             ${SUBQUERY_IMAGEN_PRINCIPAL}
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      WHERE p.producto_destacado = TRUE
      ORDER BY p.producto_id ASC
    `);
    return rows;
  },

  // ============================================================
  // DETALLE COMPLETO (producto + imágenes + inventario)
  // Usado por GET /api/productos/:id/detalle
  // ============================================================
  obtenerDetalleCompleto: async (id) => {
    // 1) Producto + categoría + imagen principal
    const [productoRows] = await pool.query(`
      SELECT p.producto_id, p.producto_nombre, p.producto_descripcion,
             p.producto_precio, p.categoria_id, c.categoria_nombre,
             p.producto_destacado,
             ${SUBQUERY_IMAGEN_PRINCIPAL}
      FROM producto p
      INNER JOIN categoria c ON p.categoria_id = c.categoria_id
      WHERE p.producto_id = ?
    `, [id]);

    if (!productoRows[0]) return null;
    const producto = productoRows[0];

    // 2) Galería de imágenes (principal primero, luego por orden)
    const [imagenes] = await pool.query(`
      SELECT producto_imagen_id, producto_id, producto_imagen_url,
             producto_imagen_alt, producto_imagen_orden,
             producto_imagen_principal, producto_imagen_origen,
             producto_imagen_creada
      FROM producto_imagen
      WHERE producto_id = ?
      ORDER BY producto_imagen_principal DESC,
               producto_imagen_orden ASC,
               producto_imagen_id ASC
    `, [id]);

    // 3) Variantes de inventario (talla + color + stock)
    const [variantes] = await pool.query(`
      SELECT i.inventario_id, i.inventario_stock,
             t.talla_id,  t.talla_nombre,
             co.color_id, co.color_nombre
      FROM inventario i
      INNER JOIN talla t  ON i.talla_id  = t.talla_id
      INNER JOIN color co ON i.color_id  = co.color_id
      WHERE i.producto_id = ?
      ORDER BY t.talla_id ASC, co.color_id ASC
    `, [id]);

    // 4) Derivados: stock total, tallas y colores únicos
    const stockTotal = variantes.reduce(
      (acc, v) => acc + (Number(v.inventario_stock) || 0),
      0
    );

    const tallasMap  = new Map();
    const coloresMap = new Map();

    variantes.forEach(v => {
      if (!tallasMap.has(v.talla_id)) {
        tallasMap.set(v.talla_id, { id: v.talla_id, nombre: v.talla_nombre });
      }
      if (!coloresMap.has(v.color_id)) {
        coloresMap.set(v.color_id, { id: v.color_id, nombre: v.color_nombre });
      }
    });

    return {
      ...producto,
      imagenes,
      variantes,
      stock_total: stockTotal,
      tallas:  Array.from(tallasMap.values()),
      colores: Array.from(coloresMap.values())
    };
  },

  // Crear y actualizar (sin tocar imágenes)

  crear: async (datos) => {
    const {
      producto_nombre,
      producto_descripcion,
      producto_precio,
      categoria_id,
      producto_destacado
    } = datos;

    const [result] = await pool.query(`
      INSERT INTO producto
        (producto_nombre, producto_descripcion, producto_precio,
         categoria_id, producto_destacado)
      VALUES (?, ?, ?, ?, ?)
    `, [
      producto_nombre,
      producto_descripcion,
      producto_precio,
      categoria_id,
      producto_destacado ? 1 : 0
    ]);

    return result.insertId;
  },

  actualizar: async (id, datos) => {
    const {
      producto_nombre,
      producto_descripcion,
      producto_precio,
      categoria_id,
      producto_destacado
    } = datos;

    const [result] = await pool.query(`
      UPDATE producto SET
        producto_nombre = ?,
        producto_descripcion = ?,
        producto_precio = ?,
        categoria_id = ?,
        producto_destacado = ?
      WHERE producto_id = ?
    `, [
      producto_nombre,
      producto_descripcion,
      producto_precio,
      categoria_id,
      producto_destacado ? 1 : 0,
      id
    ]);

    return result.affectedRows;
  }
};

module.exports = ProductoModel;