// backend/config/imagenOptimizer.js
const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

/**
 * Genera versiones optimizadas de una imagen subida.
 * Devuelve las rutas relativas de las 3 variantes WebP
 * (sm/md/lg). El archivo original subido por multer se
 * elimina del disco tras generar las variantes: el frontend
 * NUNCA lo usa (siempre consume WebP vía srcset/src).
 *
 * → 1 imagen subida = 3 archivos en disco (sm, md, lg).
 */
async function optimizarImagen(file) {
  const originalPath = file.path;
  const dir          = path.dirname(originalPath);
  const baseName     = path.basename(originalPath, path.extname(originalPath));

  const variantes = [
    { sufijo: '-sm',  width: 480  },   // 400 → 480  (móvil más nítido)
    { sufijo: '-md',  width: 960  },   // 800 → 960  (tablet/laptop)
    { sufijo: '-lg',  width: 1600 }    // 1280 → 1600 (retina, pantallas grandes)
  ];

  const resultados = {};

  for (const { sufijo, width } of variantes) {
    const webpName = `${baseName}${sufijo}.webp`;
    const webpPath = path.join(dir, webpName);

    await sharp(originalPath)
      .resize({
        width,
        withoutEnlargement: true,
        fit: 'inside',        // ← respeta aspect ratio
        kernel: 'lanczos3'    // ← reescalado de alta calidad (por defecto es 'lanczos3' pero explícito es mejor)
      })
      .webp({
        quality: 88,          // 78 → 88  (mucho más nítido, ~40% más peso)
        effort: 6,            // 4 → 6    (mejor compresión, no afecta nitidez)
        smartSubsample: true  // ← subsampling adaptativo (mejor texto/bordes)
      })
      .toFile(webpPath);

    resultados[sufijo.replace('-', '')] = `/uploads/${webpName}`;
  }

  // 2) Eliminar el archivo original subido por multer.
  //    Ya no se usa (el frontend consume solo las variantes WebP).
  //    Si falla el unlink, no abortamos: log de aviso y seguimos.
  try {
    await fs.promises.unlink(originalPath);
  } catch (unlinkErr) {
    console.warn(
      'No se pudo eliminar el archivo original tras optimizar:',
      originalPath,
      '-',
      unlinkErr.message
    );
  }

  return resultados;
}

module.exports = { optimizarImagen };