-- ============================================================
-- Base de datos: gissi_plataforma_db
-- Motor: MySQL
-- ============================================================

-- Paso 1: Creación de la base de datos
CREATE DATABASE IF NOT EXISTS gissi_plataforma_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE gissi_plataforma_db;

-- Paso 2: Creación de la tabla categoria
CREATE TABLE categoria (
    categoria_id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_nombre VARCHAR(300) NOT NULL,
    categoria_descripcion VARCHAR(300) NULL
);

-- Paso 3: Creación de la tabla producto
CREATE TABLE producto (
    producto_id INT AUTO_INCREMENT PRIMARY KEY,
    producto_nombre VARCHAR(300) NOT NULL,
    producto_descripcion VARCHAR(300) NULL,
    producto_precio DECIMAL(10,2) NOT NULL,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categoria(categoria_id)
);

-- Paso 4: Creación de la tabla talla
CREATE TABLE talla (
    talla_id INT AUTO_INCREMENT PRIMARY KEY,
    talla_nombre VARCHAR(300) NOT NULL
);

-- Paso 5: Creación de la tabla color
CREATE TABLE color (
    color_id INT AUTO_INCREMENT PRIMARY KEY,
    color_nombre VARCHAR(300) NOT NULL
);

-- Paso 6: Creación de la tabla inventario
CREATE TABLE inventario (
    inventario_id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT,
    talla_id INT,
    color_id INT,
    inventario_stock INT NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES producto(producto_id),
    FOREIGN KEY (talla_id) REFERENCES talla(talla_id),
    FOREIGN KEY (color_id) REFERENCES color(color_id)
);

-- Paso 7: Creación de la tabla cliente
CREATE TABLE cliente (
    cliente_id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_nombre VARCHAR(300) NOT NULL,
    cliente_cedula VARCHAR(300) NOT NULL UNIQUE,
    cliente_telefono VARCHAR(300) NULL,
    cliente_correo VARCHAR(300) NULL
);

-- Paso 8: Creación de la tabla pedido
CREATE TABLE pedido (
    pedido_id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    pedido_fecha DATETIME NOT NULL,
    pedido_estado VARCHAR(300) NOT NULL,
    pedido_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id)
);

-- Paso 9: Creación de la tabla detalle_pedido
CREATE TABLE detalle_pedido (
    detalle_pedido_id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT,
    producto_id INT,
    detalle_pedido_cantidad INT NOT NULL,
    detalle_pedido_precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedido(pedido_id),
    FOREIGN KEY (producto_id) REFERENCES producto(producto_id)
);

-- Paso 10: Creación de la tabla usuario
CREATE TABLE usuario (
    usuario_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_nombre VARCHAR(300) NOT NULL,
    usuario_correo VARCHAR(300) NOT NULL UNIQUE,
    usuario_contrasena VARCHAR(300) NOT NULL,
    usuario_rol VARCHAR(300) NOT NULL
);

-- Paso 11: Creación de la tabla proveedor
CREATE TABLE proveedor (
    proveedor_id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_nombre VARCHAR(300) NOT NULL,
    proveedor_telefono VARCHAR(300) NULL,
    proveedor_direccion VARCHAR(300) NULL
);

-- ============================================================
-- Inserción de datos de prueba
-- ============================================================

-- Paso 1: Inserción de categorías
INSERT INTO categoria (categoria_nombre, categoria_descripcion) VALUES
('Escolar', 'Uniformes y prendas escolares'),
('Trabajo', 'Ropa de trabajo y seguridad industrial'),
('Deportivo', 'Ropa deportiva y cómoda para actividad física');

-- Paso 2: Inserción de tallas
INSERT INTO talla (talla_nombre) VALUES
('XS'), ('S'), ('M'), ('L'), ('XL'), ('XXL');

-- Paso 3: Inserción de colores
INSERT INTO color (color_nombre) VALUES
('Azul'), ('Negro'), ('Blanco'), ('Gris'), ('Verde'), ('Rojo');

-- Paso 4: Inserción de 20 productos textiles
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

-- Paso 5: Inserción de inventario de prueba
INSERT INTO inventario (producto_id, talla_id, color_id, inventario_stock) VALUES
(1, 2, 1, 50), (1, 3, 1, 40), (1, 4, 1, 30),
(2, 3, 1, 45), (2, 4, 1, 35), (3, 2, 3, 60),
(4, 3, 2, 25), (5, 3, 1, 20), (6, 4, 1, 15),
(7, 4, 3, 30), (8, 4, 2, 40), (9, 3, 5, 10),
(10, 4, 2, 8), (11, 3, 1, 50), (12, 3, 2, 45),
(13, 4, 2, 20), (14, 4, 2, 25), (15, 3, 1, 30),
(19, 3, 3, 35), (20, 4, 1, 40);

-- Paso 6: Inserción de clientes
INSERT INTO cliente (cliente_nombre, cliente_cedula, cliente_telefono, cliente_correo) VALUES
('María López', '1004567890', '0991234567', 'maria.lopez@email.com'),
('Juan Pérez', '1005678901', '0987654321', 'juan.perez@email.com'),
('Ana Torres', '1006789012', '0976543210', 'ana.torres@email.com'),
('Carlos Ruiz', '1007890123', '0965432109', 'carlos.ruiz@email.com'),
('Lucía Gómez', '1008901234', '0954321098', 'lucia.gomez@email.com');

-- Paso 7: Inserción de usuarios
INSERT INTO usuario (usuario_nombre, usuario_correo, usuario_contrasena, usuario_rol) VALUES
('Administrador Gissi', 'admin@gissi.com', 'admin123', 'administrador'),
('Vendedor Gissi', 'vendedor@gissi.com', 'vende123', 'vendedor');

-- Paso 8: Inserción de proveedores
INSERT INTO proveedor (proveedor_nombre, proveedor_telefono, proveedor_direccion) VALUES
('Textiles del Norte', '0991112223', 'Calle 1 y Av. 2, Tulcán'),
('Confecciones Andinas', '0994445556', 'Calle 3 y Av. 4, Ipiales'),
('Hilos y Telas S.A.', '0997778889', 'Calle 5 y Av. 6, Pasto');

-- ============================================================
-- Selección de las tablas
-- ============================================================

SELECT * FROM producto;
SELECT * FROM categoria;
SELECT * FROM talla;
SELECT * FROM color;
SELECT * FROM inventario;
SELECT * FROM cliente;
SELECT * FROM usuario;
SELECT * FROM proveedor;

-- ============================================================
-- Selección conteo de datos registrados en las tablas
-- ============================================================

SELECT COUNT(*) FROM producto;
SELECT COUNT(*) FROM categoria;
SELECT COUNT(*) FROM talla;
SELECT COUNT(*) FROM color;
SELECT COUNT(*) FROM inventario;
SELECT COUNT(*) FROM cliente;
SELECT COUNT(*) FROM usuario;
SELECT COUNT(*) FROM proveedor;

-- ============================================================
-- Consulta de integridad referencial
-- ============================================================

SELECT p.producto_nombre, c.categoria_nombre, p.producto_precio
FROM producto p
INNER JOIN categoria c ON p.categoria_id = c.categoria_id
ORDER BY c.categoria_nombre;