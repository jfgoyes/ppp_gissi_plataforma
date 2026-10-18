/* ============================================================
   GISSI — producto.js  ·  Página de detalle por producto
   Lee el ID desde ?id=123 en la URL y consume
   GET /api/productos/:id/detalle
   ============================================================ */

const API_URL  = 'http://localhost:3000/api';
const API_BASE = 'http://localhost:3000';

// ============================================================
// Referencias
// ============================================================
const detalle       = document.getElementById('detalle');
const estado        = document.getElementById('detalle-estado');
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

// Referencias del carrusel
const slidesWrap    = document.getElementById('detalle-slides');
const btnPrev       = document.getElementById('detalle-prev');
const btnNext       = document.getElementById('detalle-next');
const dotsWrap      = document.getElementById('detalle-dots');
const counterEl     = document.getElementById('detalle-counter');

// Referencias de miniaturas
const thumbsWrap    = document.getElementById('detalle-thumbs');
const thumbsWrapOut = document.getElementById('detalle-thumbs-wrap');
const thumbsPrev    = document.getElementById('detalle-thumbs-prev');
const thumbsNext    = document.getElementById('detalle-thumbs-next');

let productoActual = null;

// ============================================================
// Estado del carrusel
// ============================================================
const carrusel = {
  imagenes: [],
  indice:   0,

  get total() { return this.imagenes.length; },

  // Ir a un índice válido (sin wrap-around)
  ir(indice) {
    if (this.total === 0) return;
    const nuevo = Math.max(0, Math.min(indice, this.total - 1));
    if (nuevo === this.indice) {
      this.render();
      return;
    }
    this.indice = nuevo;
    this.render();
  },

  siguiente() { this.ir(this.indice + 1); },
  anterior()  { this.ir(this.indice - 1); },

  render() {
    if (this.total === 0) {
      // Sin imágenes: no hay nada que pintar
      if (slidesWrap) slidesWrap.style.transform = 'translateX(0)';
      if (btnPrev)  btnPrev.hidden = true;
      if (btnNext)  btnNext.hidden = true;
      if (dotsWrap) dotsWrap.hidden = true;
      if (counterEl) counterEl.hidden = true;
      if (thumbsWrapOut) thumbsWrapOut.hidden = true;
      return;
    }

    // 1) Desplazamiento
    slidesWrap.style.transform = `translateX(-${this.indice * 100}%)`;

    // 2) ¿Hay vecinos a izquierda/derecha? (sin wrap-around)
    const hayIzquierda = this.indice > 0;
    const hayDerecha   = this.indice < this.total - 1;

    // 3) Flechas inteligentes
    if (btnPrev) btnPrev.hidden = !hayIzquierda;
    if (btnNext) btnNext.hidden = !hayDerecha;

    // 4) Dots y contador: se ocultan si NO hay ambas direcciones
    const ambasDirecciones = hayIzquierda && hayDerecha;

    if (dotsWrap) {
      dotsWrap.hidden = !ambasDirecciones;
      if (ambasDirecciones) {
        dotsWrap.querySelectorAll('.detalle__dot').forEach((d, i) => {
          d.classList.toggle('is-active', i === this.indice);
        });
      }
    }

    if (counterEl) {
      counterEl.hidden = !ambasDirecciones;
      if (ambasDirecciones) {
        counterEl.textContent = `${this.indice + 1} / ${this.total}`;
      }
    }

    // 5) Miniaturas: sincronizar activa y scroll
    if (thumbsWrap && !thumbsWrapOut?.hidden) {
      thumbsWrap.querySelectorAll('.detalle__thumb').forEach((t, i) => {
        t.classList.toggle('is-active', i === this.indice);
      });

      const activa = thumbsWrap.querySelector('.detalle__thumb.is-active');
      if (activa) {
        activa.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
        // Actualizar flechas de miniaturas tras el scroll
        setTimeout(actualizarFlechasThumbs, 300);
      } else {
        actualizarFlechasThumbs();
      }
    }
  }
};

// ============================================================
// Flechas de miniaturas
// Se activan cuando hay MÁS de 6 imágenes (o cuando hay overflow real)
// ============================================================
const actualizarFlechasThumbs = () => {
  if (!thumbsWrap || !thumbsPrev || !thumbsNext) return;

  const total       = carrusel.total;
  const hayOverflow = thumbsWrap.scrollWidth > thumbsWrap.clientWidth + 1;
  const scrollLeft  = thumbsWrap.scrollLeft;
  const maxScroll   = thumbsWrap.scrollWidth - thumbsWrap.clientWidth;

  // Mostrar flechas si hay más de 6 imágenes O si hay overflow real
  const necesitaNavegacion = total > 6 || hayOverflow;

  if (!necesitaNavegacion) {
    thumbsPrev.hidden = true;
    thumbsNext.hidden = true;
    return;
  }

  // Hay miniaturas a la izquierda si ya se scrolleó algo
  const hayIzquierda = scrollLeft > 2;
  // Hay miniaturas a la derecha si aún queda por scrollear
  const hayDerecha   = scrollLeft < maxScroll - 2;

  thumbsPrev.hidden = !hayIzquierda;
  thumbsNext.hidden = !hayDerecha;
};

// ============================================================
// Helpers
// ============================================================
const escAttr = (str = '') =>
  String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
             .replace(/</g, '&lt;').replace(/>/g, '&gt;');

const resolverImagen = (url) => {
  if (!url) return `https://placehold.co/1200x800/1a1a1a/ffffff?text=GISSI`;
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
};

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
  // Normalizar
  const lista = Array.isArray(imagenes) && imagenes.length > 0
    ? imagenes
    : [{ producto_imagen_url: null, producto_imagen_alt: null }];

  const sinImagen = !Array.isArray(imagenes) || imagenes.length === 0;
  const multiples = lista.length > 1;

  carrusel.imagenes = lista;
  carrusel.indice   = 0;

  // ---- SLIDES ----
  slidesWrap.innerHTML = lista.map((img, i) => `
    <img
      src="${resolverImagen(img.producto_imagen_url)}"
      alt="${escAttr(img.producto_imagen_alt || productoActual.producto_nombre)}"
      loading="${i === 0 ? 'eager' : 'lazy'}"
      draggable="false">
  `).join('');

  // ---- DOTS ----
  if (dotsWrap) {
    dotsWrap.hidden = !multiples;
    dotsWrap.innerHTML = multiples
      ? lista.map((_, i) => `
          <button type="button"
                  class="detalle__dot ${i === 0 ? 'is-active' : ''}"
                  data-index="${i}"
                  aria-label="Ver imagen ${i + 1}">
          </button>`).join('')
      : '';

    dotsWrap.querySelectorAll('.detalle__dot').forEach(dot => {
      dot.addEventListener('click', () => {
        carrusel.ir(Number(dot.dataset.index));
      });
    });
  }

  // ---- MINIATURAS (solo si > 1) ----
  if (thumbsWrap && thumbsWrapOut) {
    if (multiples) {
      thumbsWrapOut.hidden = false;
      thumbsWrap.innerHTML = lista.map((img, i) => `
        <button type="button"
                class="detalle__thumb ${i === 0 ? 'is-active' : ''}"
                data-index="${i}"
                aria-label="Ver imagen ${i + 1}">
          <img src="${resolverImagen(img.producto_imagen_url)}"
               alt="${escAttr(img.producto_imagen_alt || '')}"
               loading="lazy"
               draggable="false">
        </button>
      `).join('');

      thumbsWrap.querySelectorAll('.detalle__thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
          carrusel.ir(Number(thumb.dataset.index));
        });
      });

      // Reset scroll al inicio y actualizar flechas.
      // Triple rAF para asegurar que el layout ya incluyó las miniaturas
      // y el navegador ya calculó scrollWidth/clientWidth reales.
      thumbsWrap.scrollLeft = 0;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => actualizarFlechasThumbs());
        });
      });

    } else {
      thumbsWrapOut.hidden = true;
      thumbsWrap.innerHTML = '';
    }
  }

  // ---- Flechas y contador: los maneja carrusel.render() ----
  if (counterEl) counterEl.hidden = !multiples;
  if (btnPrev)   btnPrev.hidden   = sinImagen || !multiples;
  if (btnNext)   btnNext.hidden   = sinImagen || !multiples;

  carrusel.render();
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
  if (!tallas || tallas.length === 0) { secTallas.hidden = true; return; }
  secTallas.hidden = false;
  elTallas.innerHTML = tallas
    .map(t => `<span class="detalle__chip">${escAttr(t.nombre)}</span>`)
    .join('');
};

const renderColores = (colores) => {
  if (!colores || colores.length === 0) { secColores.hidden = true; return; }
  secColores.hidden = false;
  elColores.innerHTML = colores.map(c => `
    <span class="detalle__chip detalle__chip--color">
      <span class="detalle__chip-dot" style="background:${colorToHex(c.nombre)}"></span>
      ${escAttr(c.nombre)}
    </span>
  `).join('');
};

const renderVariantes = (variantes) => {
  if (!variantes || variantes.length === 0) { secVariantes.hidden = true; return; }
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
  bcNombre.textContent    = p.producto_nombre;
  elCategoria.textContent = p.categoria_nombre || 'General';
  elNombre.textContent    = p.producto_nombre;
  elPrecio.textContent    = `$${parseFloat(p.producto_precio).toFixed(2)}`;
  elDescripcion.textContent =
    p.producto_descripcion || 'Prenda personalizable de la colección GISSI.';

  badge.hidden = !p.producto_destacado;

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

    // Recalcular flechas de miniaturas después de mostrarse
    requestAnimationFrame(() => {
      requestAnimationFrame(() => actualizarFlechasThumbs());
    });

  } catch (err) {
    console.error('Error al cargar producto:', err);
    mostrarError('Lo sentimos, no pudimos cargar el producto. Intenta de nuevo más tarde.');
  }
};

// ============================================================
// Eventos del carrusel principal (una sola vez)
// ============================================================
if (btnPrev) btnPrev.addEventListener('click', () => carrusel.anterior());
if (btnNext) btnNext.addEventListener('click', () => carrusel.siguiente());

document.addEventListener('keydown', (e) => {
  if (!detalle || detalle.hidden) return;
  if (carrusel.total <= 1) return;

  if (e.key === 'ArrowLeft'  && btnPrev && !btnPrev.hidden) {
    e.preventDefault();
    carrusel.anterior();
  }
  if (e.key === 'ArrowRight' && btnNext && !btnNext.hidden) {
    e.preventDefault();
    carrusel.siguiente();
  }
});

// ============================================================
// Flechas de miniaturas: click + scroll + resize
// ============================================================
if (thumbsPrev) {
  thumbsPrev.addEventListener('click', () => {
    if (!thumbsWrap) return;
    const paso = Math.max(thumbsWrap.clientWidth * 0.8, 200);
    thumbsWrap.scrollBy({ left: -paso, behavior: 'smooth' });
  });
}
if (thumbsNext) {
  thumbsNext.addEventListener('click', () => {
    if (!thumbsWrap) return;
    const paso = Math.max(thumbsWrap.clientWidth * 0.8, 200);
    thumbsWrap.scrollBy({ left: paso, behavior: 'smooth' });
  });
}

if (thumbsWrap) {
  thumbsWrap.addEventListener('scroll', actualizarFlechasThumbs, { passive: true });
  window.addEventListener('resize', actualizarFlechasThumbs);
}

// ============================================================
// Arranque
// ============================================================
document.addEventListener('DOMContentLoaded', cargarProducto);