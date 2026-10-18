/* ============================================================
   GISSI — producto.js  ·  Página de detalle por producto
   Lee el ID desde ?id=123 en la URL y consume
   GET /api/productos/:id/detalle
   ============================================================ */

const API_URL  = 'http://localhost:3000/api';
const API_BASE = 'http://localhost:3000';

// Referencias
const detalle       = document.getElementById('detalle');
const estado        = document.getElementById('detalle-estado');
const imgPrincipal  = document.getElementById('detalle-img-principal');
const thumbsWrap    = document.getElementById('detalle-thumbs');
const badge         = document.getElementById('detalle-badge');
const bcNombre      = document.getElementById('bc-nombre');
const elCategoria   = document.getElementById('detalle-categoria');
const elNombre      = document.getElementById('detalle-nombre');
const elPrecio      = document.getElementById('detalle-precio');
const elDescripcion = document.getElementById('detalle-descripcion');
const elStock       = document.getElementById('detalle-stock');
const elTallas      = document.getElementById('detalle-tallas');
const elColores     = document.getElementById('detalle-colores');
const elVariantes   = document.getElementById('detalle-variantes');
const secTallas     = document.getElementById('detalle-tallas-section');
const secColores    = document.getElementById('detalle-colores-section');
const secVariantes  = document.getElementById('detalle-variantes-section');
const btnCarrito    = document.getElementById('detalle-btn-carrito');
const btnWsp        = document.getElementById('detalle-btn-wsp');

let productoActual = null;

// ============================================================
// Helpers
// ============================================================
const escAttr = (str = '') =>
  String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
             .replace(/</g, '&lt;').replace(/>/g, '&gt;');

const resolverImagen = (url) => {
  if (!url) return `https://placehold.co/1200x800/1a1a1a/ffffff?text=GISSI`; // ← 1200x800
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
};

// Paleta aproximada para pintar el "dot" de cada color
const colorToHex = (nombre = '') => {
  const n = nombre.toLowerCase().trim();
  const mapa = {
    'azul': '#2563eb', 'negro': '#111111', 'blanco': '#f5f5f5',
    'gris': '#7a7a7a', 'verde': '#16a34a', 'rojo': '#dc2626',
    'amarillo': '#eab308', 'naranja': '#ea580c', 'rosa': '#db2777',
    'morado': '#7c3aed', 'violeta': '#7c3aed', 'cafe': '#78350f',
    'café': '#78350f', 'beige': '#d6c7a1', 'celeste': '#38bdf8'
  };
  return mapa[n] || '#888';
};

// ============================================================
// Estados UI
// ============================================================
const mostrarCargando = () => {
  estado.innerHTML = `
    <div class="detalle__cargando">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Cargando producto…</p>
    </div>`;
  detalle.hidden = true;
};

const mostrarError = (msg = 'No se pudo cargar el producto.') => {
  estado.innerHTML = `
    <div class="detalle__error">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>${msg}</p>
      <a class="button outline" href="catalogo.html">← Volver al catálogo</a>
    </div>`;
  detalle.hidden = true;
};

// ============================================================
// Render
// ============================================================
const renderGaleria = (imagenes) => {
  if (!imagenes || imagenes.length === 0) {
    imgPrincipal.src = resolverImagen(null);
    imgPrincipal.alt = productoActual.producto_nombre;
    thumbsWrap.hidden = true;
    return;
  }

  // Principal: la primera (ya viene ordenada: principal primero)
  const principal = imagenes[0];
  imgPrincipal.src = resolverImagen(principal.producto_imagen_url);
  imgPrincipal.alt = principal.producto_imagen_alt || productoActual.producto_nombre;

  // Miniaturas (solo si hay >1)
  if (imagenes.length > 1) {
    thumbsWrap.hidden = false;
    thumbsWrap.innerHTML = imagenes.map((img, i) => `
      <button type="button"
              class="detalle__thumb ${i === 0 ? 'is-active' : ''}"
              data-index="${i}"
              aria-label="Ver imagen ${i + 1}">
        <img src="${resolverImagen(img.producto_imagen_url)}"
             alt="${escAttr(img.producto_imagen_alt || '')}" loading="lazy">
      </button>
    `).join('');

    thumbsWrap.querySelectorAll('.detalle__thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.index);
        imgPrincipal.src = resolverImagen(imagenes[i].producto_imagen_url);
        imgPrincipal.alt = imagenes[i].producto_imagen_alt || productoActual.producto_nombre;
        thumbsWrap.querySelectorAll('.detalle__thumb')
          .forEach(t => t.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });
  } else {
    thumbsWrap.hidden = true;
  }
};

const renderStock = (stockTotal) => {
  let clase = 'detalle__stock--agotado';
  let texto = 'Agotado';

  if (stockTotal > 10) {
    clase = 'detalle__stock--disponible';
    texto = `Disponible · ${stockTotal} unidades`;
  } else if (stockTotal > 0) {
    clase = 'detalle__stock--bajo';
    texto = `Últimas ${stockTotal} unidades`;
  }

  elStock.className = `detalle__stock ${clase}`;
  elStock.innerHTML = `<i class="fa-solid fa-boxes-stacked"></i> ${texto}`;
};

const renderTallas = (tallas) => {
  if (!tallas || tallas.length === 0) {
    secTallas.hidden = true;
    return;
  }
  secTallas.hidden = false;
  elTallas.innerHTML = tallas
    .map(t => `<span class="detalle__chip">${escAttr(t.nombre)}</span>`)
    .join('');
};

const renderColores = (colores) => {
  if (!colores || colores.length === 0) {
    secColores.hidden = true;
    return;
  }
  secColores.hidden = false;
  elColores.innerHTML = colores.map(c => `
    <span class="detalle__chip detalle__chip--color">
      <span class="detalle__chip-dot" style="background:${colorToHex(c.nombre)}"></span>
      ${escAttr(c.nombre)}
    </span>
  `).join('');
};

const renderVariantes = (variantes) => {
  if (!variantes || variantes.length === 0) {
    secVariantes.hidden = true;
    return;
  }
  secVariantes.hidden = false;
  elVariantes.innerHTML = variantes.map(v => {
    const stock = Number(v.inventario_stock) || 0;
    let claseStock = 'detalle__variante-stock';
    let textoStock = `${stock} en stock`;
    if (stock === 0) {
      claseStock += ' is-out';
      textoStock = 'Agotado';
    } else if (stock <= 5) {
      claseStock += ' is-low';
      textoStock = `Solo ${stock}`;
    }

    return `
      <div class="detalle__variante">
        <span class="detalle__variante-talla">Talla <b>${escAttr(v.talla_nombre)}</b></span>
        <span class="detalle__variante-color">
          <span class="detalle__chip-dot" style="background:${colorToHex(v.color_nombre)}"></span>
          ${escAttr(v.color_nombre)}
        </span>
        <span class="${claseStock}">${textoStock}</span>
      </div>`;
  }).join('');
};

const renderInfo = (p) => {
  bcNombre.textContent  = p.producto_nombre;
  elCategoria.textContent = p.categoria_nombre || 'General';
  elNombre.textContent  = p.producto_nombre;
  elPrecio.textContent  = `$${parseFloat(p.producto_precio).toFixed(2)}`;
  elDescripcion.textContent =
    p.producto_descripcion || 'Prenda personalizable de la colección GISSI.';

  if (p.producto_destacado) {
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }

  renderStock(p.stock_total || 0);
  renderTallas(p.tallas);
  renderColores(p.colores);
  renderVariantes(p.variantes);

  document.title = `${p.producto_nombre} | GISSI | Textiles Los Pastos`;
};

// ============================================================
// Acciones
// ============================================================
const configurarAcciones = (p) => {
  const imagenPrincipal = p.imagenes?.[0]?.producto_imagen_url
    ? resolverImagen(p.imagenes[0].producto_imagen_url)
    : resolverImagen(p.producto_imagen);

  // Agregar al carrito
  btnCarrito.onclick = () => {
    if (window.GissiCarrito && typeof window.GissiCarrito.agregar === 'function') {
      window.GissiCarrito.agregar({
        id:     p.producto_id,
        nombre: p.producto_nombre,
        precio: Number(p.producto_precio),
        imagen: imagenPrincipal
      });
    } else {
      console.warn('carrito.js no está cargado.');
    }
  };

  // WhatsApp: usamos la API de carrito.js si existe
  const waFallback = `https://wa.me/593993939058?text=${encodeURIComponent(
    `Hola GISSI, me interesa el producto "${p.producto_nombre}" (código ${p.producto_id}). ¿Podrían darme más información?`
  )}`;
  btnWsp.href = waFallback;

  btnWsp.addEventListener('click', (e) => {
    if (window.GissiCarrito && typeof window.GissiCarrito.consultarProducto === 'function') {
      e.preventDefault();
      window.GissiCarrito.consultarProducto({
        id:        p.producto_id,
        nombre:    p.producto_nombre,
        precio:    Number(p.producto_precio),
        categoria: p.categoria_nombre
      });
    }
  });
};

// ============================================================
// Carga principal
// ============================================================
const cargarProducto = async () => {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));

  if (!id || !Number.isFinite(id) || id <= 0) {
    mostrarError('ID de producto inválido. Vuelve al catálogo y selecciona un producto.');
    return;
  }

  mostrarCargando();

  try {
    const res = await fetch(`${API_URL}/productos/${id}/detalle`);

    if (res.status === 404) {
      mostrarError('El producto solicitado no existe o fue removido.');
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!json.ok || !json.data) throw new Error('Respuesta inválida');

    productoActual = json.data;

    renderGaleria(productoActual.imagenes);
    renderInfo(productoActual);
    configurarAcciones(productoActual);

    estado.innerHTML = '';
    detalle.hidden = false;

  } catch (err) {
    console.error('Error al cargar producto:', err);
    mostrarError('Lo sentimos, no pudimos cargar el producto. Intenta de nuevo más tarde.');
  }
};

document.addEventListener('DOMContentLoaded', cargarProducto);