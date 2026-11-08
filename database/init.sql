-- ============================================================
-- Base de datos: gissi_plataforma_db
-- Motor: MySQL (compatible con 5.7+, 8.0+, MariaDB 10.x+)
-- ============================================================

-- ============================================================
-- Paso 1: Creación de la base de datos
-- ============================================================

CREATE DATABASE IF NOT EXISTS gissi_plataforma_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE gissi_plataforma_db;

-- ============================================================
-- Paso 2: Creación de las tablas
-- ============================================================

-- Tabla categoria
CREATE TABLE categoria (
    categoria_id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_nombre VARCHAR(300) NOT NULL,
    categoria_descripcion VARCHAR(300) NULL
);

-- Tabla producto
CREATE TABLE producto (
    producto_id INT AUTO_INCREMENT PRIMARY KEY,
    producto_nombre VARCHAR(300) NOT NULL,
    producto_descripcion VARCHAR(300) NULL,
    producto_precio DECIMAL(10,2) NOT NULL,
    categoria_id INT,
    producto_destacado BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (categoria_id) REFERENCES categoria(categoria_id)
);

-- Tabla producto_imagen (almacena la galería de imágenes de cada producto)
CREATE TABLE producto_imagen (
    producto_imagen_id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    producto_imagen_url VARCHAR(500) NOT NULL,
    producto_imagen_alt VARCHAR(300) NULL,
    producto_imagen_orden INT NOT NULL DEFAULT 0,
    producto_imagen_principal BOOLEAN NOT NULL DEFAULT FALSE,
    producto_imagen_origen ENUM('url', 'upload') NOT NULL DEFAULT 'upload',
    producto_imagen_creada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES producto(producto_id) ON DELETE CASCADE,
    INDEX idx_producto_imagen (producto_id, producto_imagen_orden)
);

-- Tabla talla
CREATE TABLE talla (
    talla_id INT AUTO_INCREMENT PRIMARY KEY,
    talla_nombre VARCHAR(300) NOT NULL
);

-- Tabla color
CREATE TABLE color (
    color_id INT AUTO_INCREMENT PRIMARY KEY,
    color_nombre VARCHAR(300) NOT NULL
);

-- Tabla inventario (variante: producto + talla + color)
CREATE TABLE inventario (
    inventario_id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    talla_id INT NOT NULL,
    color_id INT NOT NULL,
    inventario_stock INT NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES producto(producto_id),
    FOREIGN KEY (talla_id) REFERENCES talla(talla_id),
    FOREIGN KEY (color_id) REFERENCES color(color_id)
);

-- Tabla inventario_imagen (relaciona imágenes con variantes específicas)
CREATE TABLE inventario_imagen (
    inventario_imagen_id INT AUTO_INCREMENT PRIMARY KEY,
    inventario_id INT NOT NULL,
    producto_imagen_id INT NOT NULL,
    FOREIGN KEY (inventario_id) REFERENCES inventario(inventario_id) ON DELETE CASCADE,
    FOREIGN KEY (producto_imagen_id) REFERENCES producto_imagen(producto_imagen_id) ON DELETE CASCADE,
    UNIQUE KEY uk_inventario_imagen (inventario_id, producto_imagen_id)
);

-- Tabla cliente
CREATE TABLE cliente (
    cliente_id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_nombre VARCHAR(300) NOT NULL,
    cliente_cedula VARCHAR(300) NOT NULL UNIQUE,
    cliente_telefono VARCHAR(300) NULL,
    cliente_correo VARCHAR(300) NULL
);

-- Tabla pedido
CREATE TABLE pedido (
    pedido_id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    pedido_fecha DATETIME NOT NULL,
    pedido_estado VARCHAR(300) NOT NULL,
    pedido_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id)
);

-- Tabla detalle_pedido (apunta a inventario)
CREATE TABLE detalle_pedido (
    detalle_pedido_id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    inventario_id INT NOT NULL,
    detalle_pedido_cantidad INT NOT NULL,
    detalle_pedido_precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedido(pedido_id),
    FOREIGN KEY (inventario_id) REFERENCES inventario(inventario_id)
);

-- Tabla usuario
CREATE TABLE usuario (
    usuario_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_nombre VARCHAR(300) NOT NULL,
    usuario_correo VARCHAR(300) NOT NULL UNIQUE,
    usuario_contrasena VARCHAR(300) NOT NULL,
    usuario_rol VARCHAR(300) NOT NULL
);

-- Tabla proveedor
CREATE TABLE proveedor (
    proveedor_id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_nombre VARCHAR(300) NOT NULL,
    proveedor_telefono VARCHAR(300) NULL,
    proveedor_direccion VARCHAR(300) NULL
);

-- ============================================================
-- Paso 2.1: Índices de rendimiento
-- Compatible con MySQL 5.7+, 8.0+ y MariaDB 10.x+
-- Estrategia: verificar existencia en information_schema y
-- ejecutar CREATE INDEX dinámicamente con PREPARE/EXECUTE.
-- Cada bloque es idempotente: se puede correr N veces sin error.
-- ============================================================

-- ------------------------------------------------------------
-- Índice 1: idx_producto_destacado
-- Acelera: WHERE producto_destacado = TRUE (GET /productos/destacados)
-- ------------------------------------------------------------
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = 'gissi_plataforma_db'
    AND table_name   = 'producto'
    AND index_name   = 'idx_producto_destacado'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_producto_destacado ON producto (producto_destacado)',
  'SELECT ''idx_producto_destacado ya existe'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- Índice 2: idx_producto_categoria
-- Acelera: JOIN producto ↔ categoria (todos los SELECT de producto)
-- ------------------------------------------------------------
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = 'gissi_plataforma_db'
    AND table_name   = 'producto'
    AND index_name   = 'idx_producto_categoria'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_producto_categoria ON producto (categoria_id)',
  'SELECT ''idx_producto_categoria ya existe'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- Índice 3: idx_inventario_producto
-- Acelera: WHERE inventario.producto_id = ?
--          (GET /productos/:id/detalle)
-- ------------------------------------------------------------
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = 'gissi_plataforma_db'
    AND table_name   = 'inventario'
    AND index_name   = 'idx_inventario_producto'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_inventario_producto ON inventario (producto_id)',
  'SELECT ''idx_inventario_producto ya existe'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- Índice 4: idx_inventario_talla
-- Acelera: JOIN inventario ↔ talla (detalle de producto)
-- ------------------------------------------------------------
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = 'gissi_plataforma_db'
    AND table_name   = 'inventario'
    AND index_name   = 'idx_inventario_talla'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_inventario_talla ON inventario (talla_id)',
  'SELECT ''idx_inventario_talla ya existe'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- Índice 5: idx_inventario_color
-- Acelera: JOIN inventario ↔ color (detalle de producto)
-- ------------------------------------------------------------
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = 'gissi_plataforma_db'
    AND table_name   = 'inventario'
    AND index_name   = 'idx_inventario_color'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_inventario_color ON inventario (color_id)',
  'SELECT ''idx_inventario_color ya existe'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ------------------------------------------------------------
-- Verificación de índices creados
-- ------------------------------------------------------------
SELECT table_name, index_name, column_name
FROM information_schema.statistics
WHERE table_schema = 'gissi_plataforma_db'
  AND index_name IN (
    'idx_producto_destacado', 'idx_producto_categoria',
    'idx_inventario_producto', 'idx_inventario_talla',
    'idx_inventario_color'
  )
ORDER BY table_name, index_name;

-- ============================================================
-- Paso 3: Inserción de datos de prueba
-- ============================================================

-- Categorías
INSERT INTO categoria (categoria_nombre, categoria_descripcion) VALUES
('Escolar',      'Uniformes y prendas escolares'),
('Trabajo',      'Ropa de trabajo y seguridad industrial'),
('Deportivo',    'Ropa deportiva y cómoda para actividad física'),
('Personalizada','Ropa personalizada bajo pedido');

-- Tallas
INSERT INTO talla (talla_nombre) VALUES
('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL');

-- Colores: solo el genérico que usarán todos los productos bajo pedido
INSERT INTO color (color_nombre) VALUES
('Personalizado');

-- Inserción de los 20 productos para simulación
START TRANSACTION;

INSERT INTO producto (producto_nombre, producto_descripcion, producto_precio, categoria_id, producto_destacado) VALUES
('Producto 1',  'Descripción genérica del Producto 1.  Registro de prueba; será reemplazado por datos reales.',  10.00, 4, FALSE),
('Producto 2',  'Descripción genérica del Producto 2.  Registro de prueba; será reemplazado por datos reales.',  20.00, 4, FALSE),
('Producto 3',  'Descripción genérica del Producto 3.  Registro de prueba; será reemplazado por datos reales.',  30.00, 4, FALSE),
('Producto 4',  'Descripción genérica del Producto 4.  Registro de prueba; será reemplazado por datos reales.',  40.00, 4, FALSE),
('Producto 5',  'Descripción genérica del Producto 5.  Registro de prueba; será reemplazado por datos reales.',  50.00, 4, FALSE),
('Producto 6',  'Descripción genérica del Producto 6.  Registro de prueba; será reemplazado por datos reales.',  60.00, 4, FALSE),
('Producto 7',  'Descripción genérica del Producto 7.  Registro de prueba; será reemplazado por datos reales.',  70.00, 4, FALSE),
('Producto 8',  'Descripción genérica del Producto 8.  Registro de prueba; será reemplazado por datos reales.',  80.00, 4, FALSE),
('Producto 9',  'Descripción genérica del Producto 9.  Registro de prueba; será reemplazado por datos reales.',  90.00, 4, FALSE),
('Producto 10', 'Descripción genérica del Producto 10. Registro de prueba; será reemplazado por datos reales.', 100.00, 4, FALSE),
('Producto 11', 'Descripción genérica del Producto 11. Registro de prueba; será reemplazado por datos reales.', 110.00, 4, FALSE),
('Producto 12', 'Descripción genérica del Producto 12. Registro de prueba; será reemplazado por datos reales.', 120.00, 4, FALSE),
('Producto 13', 'Descripción genérica del Producto 13. Registro de prueba; será reemplazado por datos reales.', 130.00, 4, FALSE),
('Producto 14', 'Descripción genérica del Producto 14. Registro de prueba; será reemplazado por datos reales.', 140.00, 4, FALSE),
('Producto 15', 'Descripción genérica del Producto 15. Registro de prueba; será reemplazado por datos reales.', 150.00, 4, FALSE),
('Producto 16', 'Descripción genérica del Producto 16. Registro de prueba; será reemplazado por datos reales.', 160.00, 4, FALSE),
('Producto 17', 'Descripción genérica del Producto 17. Registro de prueba; será reemplazado por datos reales.', 170.00, 4, FALSE),
('Producto 18', 'Descripción genérica del Producto 18. Registro de prueba; será reemplazado por datos reales.', 180.00, 4, FALSE),
('Producto 19', 'Descripción genérica del Producto 19. Registro de prueba; será reemplazado por datos reales.', 190.00, 4, FALSE),
('Producto 20', 'Descripción genérica del Producto 20. Registro de prueba; será reemplazado por datos reales.', 200.00, 4, FALSE);

COMMIT;

-- Inserción de las variantes de inventario para los 20 productos simulados
START TRANSACTION;

INSERT INTO inventario (producto_id, talla_id, color_id, inventario_stock)
SELECT
    p.producto_id,
    t.talla_id,
    co.color_id,
    0
FROM producto p
CROSS JOIN talla t
JOIN color co ON co.color_nombre = 'Personalizado'
WHERE p.producto_nombre LIKE 'Producto %'
  AND p.producto_nombre REGEXP '^Producto ([1-9]|1[0-9]|20)$';

COMMIT;

-- Clientes
INSERT INTO cliente (cliente_nombre, cliente_cedula, cliente_telefono, cliente_correo) VALUES
('María López', '1004567890', '0991234567', 'maria.lopez@email.com'),
('Juan Pérez', '1005678901', '0987654321', 'juan.perez@email.com'),
('Ana Torres', '1006789012', '0976543210', 'ana.torres@email.com'),
('Carlos Ruiz', '1007890123', '0965432109', 'carlos.ruiz@email.com'),
('Lucía Gómez', '1008901234', '0954321098', 'lucia.gomez@email.com');

-- Usuarios
INSERT INTO usuario (usuario_nombre, usuario_correo, usuario_contrasena, usuario_rol) VALUES
('Administrador Gissi', 'admin@gissi.com', 'admin123', 'administrador'),
('Vendedor Gissi', 'vendedor@gissi.com', 'vende123', 'vendedor');

-- Proveedores
INSERT INTO proveedor (proveedor_nombre, proveedor_telefono, proveedor_direccion) VALUES
('Textiles del Norte', '0991112223', 'Calle 1 y Av. 2, Tulcán'),
('Confecciones Andinas', '0994445556', 'Calle 3 y Av. 4, Ipiales'),
('Hilos y Telas S.A.', '0997778889', 'Calle 5 y Av. 6, Pasto');

-- Marcar destacados de prueba
UPDATE producto SET producto_destacado = TRUE WHERE producto_id IN (1, 6, 8, 11, 15, 19);

-- ============================================================
-- Paso 4: Consultas de verificación
-- ============================================================

-- Selección de todas las tablas
SELECT * FROM producto;
SELECT * FROM producto_imagen;
SELECT * FROM categoria;
SELECT * FROM talla;
SELECT * FROM color;
SELECT * FROM inventario;
SELECT * FROM inventario_imagen;
SELECT * FROM cliente;
SELECT * FROM usuario;
SELECT * FROM proveedor;

-- Conteos
SELECT COUNT(*) AS total_productos FROM producto;
SELECT COUNT(*) AS total_categorias FROM categoria;
SELECT COUNT(*) AS total_tallas FROM talla;
SELECT COUNT(*) AS total_colores FROM color;
SELECT COUNT(*) AS total_inventario FROM inventario;
SELECT COUNT(*) AS total_clientes FROM cliente;
SELECT COUNT(*) AS total_usuarios FROM usuario;
SELECT COUNT(*) AS total_proveedores FROM proveedor;

-- Integridad referencial: producto + categoría
SELECT p.producto_nombre, c.categoria_nombre, p.producto_precio
FROM producto p
INNER JOIN categoria c ON p.categoria_id = c.categoria_id
ORDER BY c.categoria_nombre;

-- Vista completa del inventario
SELECT
    i.inventario_id,
    p.producto_nombre,
    t.talla_nombre,
    co.color_nombre,
    i.inventario_stock
FROM inventario i
INNER JOIN producto p ON i.producto_id = p.producto_id
INNER JOIN talla t     ON i.talla_id = t.talla_id
INNER JOIN color co    ON i.color_id = co.color_id
ORDER BY p.producto_nombre, t.talla_nombre, co.color_nombre;

-- Detalle de un pedido con la variante exacta vendida
SELECT
    dp.detalle_pedido_id,
    p.producto_nombre,
    t.talla_nombre,
    co.color_nombre,
    dp.detalle_pedido_cantidad,
    dp.detalle_pedido_precio_unitario,
    (dp.detalle_pedido_cantidad * dp.detalle_pedido_precio_unitario) AS subtotal
FROM detalle_pedido dp
INNER JOIN inventario i ON dp.inventario_id = i.inventario_id
INNER JOIN producto p   ON i.producto_id = p.producto_id
INNER JOIN talla t      ON i.talla_id = t.talla_id
INNER JOIN color co     ON i.color_id = co.color_id
WHERE dp.pedido_id = 1;

-- Verificar productos destacados
SELECT producto_id, producto_nombre, producto_destacado 
FROM producto 
WHERE producto_destacado = TRUE;

-- ============================================================
-- Borrar todas las tablas
-- ============================================================

DROP TABLE IF EXISTS inventario_imagen;
DROP TABLE IF EXISTS producto_imagen;
DROP TABLE IF EXISTS detalle_pedido;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS inventario;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS talla;
DROP TABLE IF EXISTS color;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS proveedor;

-- ============================================================
-- Sentencias para realizar pruebas
-- ============================================================

-- Categorías
INSERT INTO categoria (categoria_nombre, categoria_descripcion) VALUES
('Escolar', 'Uniformes y prendas escolares'),
('Trabajo', 'Ropa de trabajo y seguridad industrial'),
('Deportivo', 'Ropa deportiva y cómoda para actividad física'),
('Personalizada', 'Ropa personalizada bajo pedido');

-- Tallas
INSERT INTO talla (talla_nombre) VALUES
('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL');

-- Color base
INSERT INTO color (color_nombre) VALUES
  ('Personalizado');

SELECT * FROM categoria;
SELECT * FROM talla;
SELECT * FROM color;

-- ============================================================
-- SECCIÓN 0: VERIFICACIÓN PREVIA
-- Ejecutar esta verificación antes de insertar productos
-- ============================================================

-- Confirmar IDs de categorías
SELECT categoria_id, categoria_nombre FROM categoria;
-- Resultado esperado:
-- 1 = Escolar | 2 = Trabajo | 3 = Deportivo | 4 = Personalizada

-- Confirmar IDs de tallas
SELECT talla_id, talla_nombre FROM talla;
-- 1=XS, 2=S, 3=M, 4=L, 5=XL, 6=XXL

-- Confirmar IDs de colores
SELECT color_id, color_nombre FROM color;
-- 1=Personalizado

-- ============================================================
-- SECCIÓN 1: DATOS DEL PRODUCTO
-- Reemplazar cada variable por los datos reales
-- ============================================================
SET @nombre       = 'Camiseta (Personalizada)';
SET @descripcion  = 'Bajo pedido se personalizan colores, escudo, nombres, números y acabados.';
SET @precio       = 8.75;              -- DECIMAL(10,2)
SET @categoria_id = 4;                 -- 1 = Escolar | 2 = Trabajo | 3 = Deportivo | 4 = Personalizada
SET @destacado    = FALSE;             -- TRUE / FALSE

-- ============================================================
-- SECCIÓN 2: INSERTAR PRODUCTO
-- ============================================================
START TRANSACTION;

INSERT INTO producto
  (producto_nombre, producto_descripcion, producto_precio,
   categoria_id, producto_destacado)
VALUES
  (@nombre, @descripcion, @precio, @categoria_id, @destacado);

SET @pid = LAST_INSERT_ID();

-- ============================================================
-- SECCIÓN 3: VARIANTES DEL PRODUCTO (bajo pedido)
-- Editar/eliminar filas según tallas y colores REALES del producto
-- ============================================================

INSERT INTO inventario (producto_id, talla_id, color_id, inventario_stock) VALUES
  (@pid, 1, 1, 0),   -- XS  - Color Personalizado
  (@pid, 2, 1, 0),   -- S  - Color Personalizado
  (@pid, 3, 1, 0),   -- M  - Color Personalizado
  (@pid, 4, 1, 0),   -- L  - Color Personalizado
  (@pid, 5, 1, 0),   -- XL  - Color Personalizado
  (@pid, 6, 1, 0);   -- XXL  - Color Personalizado

-- Si el producto SOLO tiene una talla/color, dejar una sola fila
-- Si NO tiene variantes (producto único), usar una combinación genérica:
--   (@pid, 3, 1, 0)   -- M - Azul (representativa)

COMMIT;