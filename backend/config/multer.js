// ============================================
// Configuración de Multer
// Plataforma Gissi — Subida de imágenes de producto
// ============================================

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Almacenamiento en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext    = path.extname(file.originalname).toLowerCase();
    const nombre = `producto-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, nombre);
  }
});

// Filtro: solo imágenes
const fileFilter = (req, file, cb) => {
  const permitidos = /jpeg|jpg|png|webp|gif/;
  const valido     = permitidos.test(file.mimetype);
  cb(valido ? null : new Error('Solo se permiten imágenes JPG, PNG, WEBP o GIF'), valido);
};

// Exportar middleware configurado
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB máximo
});