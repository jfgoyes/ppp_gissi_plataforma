-- ============================================================
-- Base de datos: gissi_plataforma_db
-- Motor: MySQL
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
-- Paso 3: Inserción de datos de prueba
-- ============================================================

-- Categorías
INSERT INTO categoria (categoria_nombre, categoria_descripcion) VALUES
('Escolar', 'Uniformes y prendas escolares'),
('Trabajo', 'Ropa de trabajo y seguridad industrial'),
('Deportivo', 'Ropa deportiva y cómoda para actividad física');

-- Tallas
INSERT INTO talla (talla_nombre) VALUES
('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL');

-- Colores
INSERT INTO color (color_nombre) VALUES
('Azul'), ('Negro'), ('Blanco'), ('Gris'), ('Verde'), ('Rojo');

-- Productos
INSERT INTO producto (producto_nombre, producto_descripcion, producto_precio, categoria_id) VALUES
('Uniforme Escolar Primaria', 'Conjunto de camisa y pantalón para primaria', 25.50, 1),
('Uniforme Escolar Secundaria', 'Conjunto de camisa y pantalón para secundaria', 30.00, 1),
('Camiseta Escolar', 'Camiseta de algodón para uso escolar', 12.00, 1),
('Pantalón Escolar', 'Pantalón de drill para uniforme escolar', 15.50, 1),
('Falda Escolar', 'Falda plisada para uniforme escolar', 14.00, 1),
('Overol Industrial', 'Overol de trabajo resistente para industria', 45.00, 2),
('Camisa de Trabajo', 'Camisa de manga larga para trabajo', 22.00, 2),
('Pantalón de Trabajo', 'Pantalón reforzado para trabajo pesado', 28.00, 2),
('Chaqueta de Seguridad', 'Chaqueta reflectiva de alta visibilidad', 55.00, 2),
('Botas de Seguridad', 'Botas con punta de acero para industria', 65.00, 2),
('Camiseta Deportiva', 'Camiseta transpirable para deporte', 18.00, 3),
('Short Deportivo', 'Short cómodo para actividad física', 15.00, 3),
('Sudadera Deportiva', 'Sudadera con capucha para entrenamiento', 35.00, 3),
('Pantalón Deportivo', 'Pantalón deportivo con elasticidad', 25.00, 3),
('Conjunto Deportivo', 'Conjunto de camiseta y short deportivo', 40.00, 3),
('Medias Deportivas', 'Par de medias para uso deportivo', 5.00, 3),
('Buzo Escolar', 'Buzo abrigado para uniforme escolar', 28.00, 1),
('Chaleco Escolar', 'Chaleco para uniforme escolar', 20.00, 1),
('Camisa Formal', 'Camisa formal para uso laboral', 26.00, 2),
('Pantalón Jeans', 'Pantalón de jeans para uso diario', 32.00, 2);

-- Inventario (variantes producto + talla + color)
INSERT INTO inventario (producto_id, talla_id, color_id, inventario_stock) VALUES
(1, 2, 1, 50), (1, 3, 1, 40), (1, 4, 1, 30),
(2, 3, 1, 45), (2, 4, 1, 35), (3, 2, 3, 60),
(4, 3, 2, 25), (5, 3, 1, 20), (6, 4, 1, 15),
(7, 4, 3, 30), (8, 4, 2, 40), (9, 3, 5, 10),
(10, 4, 2, 8), (11, 3, 1, 50), (12, 3, 2, 45),
(13, 4, 2, 20), (14, 4, 2, 25), (15, 3, 1, 30),
(19, 3, 3, 35), (20, 4, 1, 40);

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
UPDATE producto SET producto_destacado = TRUE WHERE producto_id IN (1, 6, 11, 19);

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