/* ============================================================
   PLATAFORMA WEB GISSI — app.js
   Conexión con el backend + renderizado dinámico
   Adaptado a interfaz 2 multi-página
   Con integración de carrito (window.GissiCarrito)
   ============================================================ */

// ============================================================
// 1. CONFIGURACIÓN
// ============================================================
const API_URL  = 'http://localhost:3000/api';
const API_BASE = 'http://localhost:3000';

const catalogoGrid   = document.getElementById('catalogo-grid');
const catalogoEstado = document.getElementById('catalogo-estado');
const filterGroup    = document.getElementById('filter-group');
const catalogCount   = document.getElementById('catalogCount');

// Página actual: 'inicio' | 'catalogo' | 'proceso' | 'nosotros'
const paginaActual = (() => {
  const path = window.location.pathname.split('/').pop() || 'inicio.html';
  return path.replace('.html', '') || 'inicio';
})();

// ============================================================
// 2. ESTADOS UI
// ============================================================
const mostrarCargando = () => {
  if (!catalogoGrid) return;
  catalogoGrid.innerHTML = '';
  catalogoEstado.innerHTML = `
    <div class="catalogo__cargando">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Cargando diseños…</p>
    </div>`;
};

const mostrarError = (mensaje = 'No se pudieron cargar los productos.') => {
  if (!catalogoGrid) return;
  catalogoGrid.innerHTML = '';
  catalogoEstado.innerHTML = `
    <div class="catalogo__error">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>${mensaje}</p>
      <button class="button outline catalogo__reintentar" id="btn-reintentar">
        <i class="fa-solid fa-rotate-right"></i> Reintentar
      </button>
    </div>`;

  const btn = document.getElementById('btn-reintentar');
  if (btn) btn.addEventListener('click', inicializarCatalogo);
};

const mostrarVacio = () => {
  if (!catalogoGrid) return;
  catalogoGrid.innerHTML = '';
  catalogoEstado.innerHTML = `
    <div class="catalogo__mensaje">
      <i class="fa-solid fa-box-open"></i>
      <p>No hay productos disponibles en este momento.</p>
      <p class="catalogo__mensaje-sub">Por favor, vuelve a intentarlo más tarde.</p>
    </div>`;
};

const limpiarEstados = () => {
  if (catalogoEstado) catalogoEstado.innerHTML = '';
};

// ============================================================
// 3. FETCH
// ============================================================
const obtenerProductos = async () => {
  const res = await fetch(`${API_URL}/productos`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.data)) throw new Error('Respuesta inválida');
  return data.data;
};

const obtenerDestacados = async () => {
  const res = await fetch(`${API_URL}/productos/destacados`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.data)) throw new Error('Respuesta inválida');
  return data.data;
};

// ============================================================
// 4. HELPERS
// ============================================================
// Escapa comillas dobles para meter el nombre en un atributo HTML
const escAttr = (str = '') =>
  String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ============================================================
// 5. TARJETA DE PRODUCTO
// ============================================================
const crearTarjetaProducto = (producto) => {
  const {
    producto_id,
    producto_nombre,
    producto_descripcion,
    producto_precio,
    categoria_nombre,
    producto_destacado,
    producto_imagen
  } = producto;

  const precio = `$${parseFloat(producto_precio).toFixed(2)}`;

  let imagenUrl;
  if (producto_imagen) {
    imagenUrl = producto_imagen.startsWith('http')
      ? producto_imagen
      : `${API_BASE}${producto_imagen}`;
  } else {
    imagenUrl = `https://placehold.co/600x600/1a1a1a/ffffff?text=${encodeURIComponent(producto_nombre)}`;
  }

  const badge = producto_destacado
    ? `<div class="product-card__badge">⭐ Destacado</div>`
    : '';

  const variants = ['dark', 'red', 'dark', 'light'];
  const variant  = variants[producto_id % variants.length];

  // Fallback del href: si carrito.js no carga, al menos hay un enlace funcional
  const waNumero  = '593993939058';
  const waFallback = encodeURIComponent(
    `Hola GISSI, me interesa el diseño "${producto_nombre}" (código ${producto_id}). ¿Podrían darme más información?`
  );
  const waUrlFallback = `https://wa.me/${waNumero}?text=${waFallback}`;

  return `
    <article class="catalog-item ${variant}" data-id="${producto_id}" data-category="${escAttr((categoria_nombre || '').toLowerCase())}">
      ${badge}
      <div class="catalog-image">
        <img
          src="${imagenUrl}"
          alt="${escAttr(producto_nombre)}"
          width="1200"
          height="780"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          onload="this.classList.add('is-loaded')">
        <span>${categoria_nombre || 'General'}</span>
        <b>↗</b>
      </div>
      <div class="catalog-info">
        <h3>${producto_nombre}</h3>
        <p>${producto_descripcion || 'Ver diseño completo'}</p>
        <div class="catalog-footer">
          <strong>${precio}</strong>
          <div class="catalog-actions">
            <a
              class="btn-add btn-wsp"
              href="${waUrlFallback}"
              target="_blank"
              rel="noopener noreferrer"
              data-accion="wsp-producto"
              data-id="${producto_id}"
              data-nombre="${escAttr(producto_nombre)}"
              data-precio="${producto_precio}"
              data-categoria="${escAttr(categoria_nombre || '')}"
              aria-label="Consultar por WhatsApp sobre ${escAttr(producto_nombre)}"
              title="Consultar por WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
            <button
              type="button"
              class="btn-add btn-cart"
              data-id="${producto_id}"
              data-nombre="${escAttr(producto_nombre)}"
              data-precio="${producto_precio}"
              data-imagen="${escAttr(imagenUrl)}"
              aria-label="Agregar ${escAttr(producto_nombre)} al carrito"
              title="Agregar al carrito">
              <i class="fa-solid fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </article>`;
};

// ============================================================
// 6. RENDERIZAR
// ============================================================
const renderizarCatalogo = (productos) => {
  limpiarEstados();
  catalogoGrid.innerHTML = productos.map(crearTarjetaProducto).join('');
  if (catalogCount) catalogCount.textContent = `${productos.length} diseños`;
  console.log(`✅ ${productos.length} productos renderizados en "${paginaActual}".`);

  // Listeners de "Agregar al carrito"
  catalogoGrid.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const producto = {
        id:     Number(btn.dataset.id),
        nombre: btn.dataset.nombre,
        precio: Number(btn.dataset.precio),
        imagen: btn.dataset.imagen
      };

      if (window.GissiCarrito && typeof window.GissiCarrito.agregar === 'function') {
        window.GissiCarrito.agregar(producto);
      } else {
        console.warn('carrito.js no está cargado; no se puede agregar al carrito.');
      }
    });
  });

  // Listeners del botón WhatsApp individual (mensaje formateado desde carrito.js)
  catalogoGrid.querySelectorAll('[data-accion="wsp-producto"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.GissiCarrito && typeof window.GissiCarrito.consultarProducto === 'function') {
        e.preventDefault();
        window.GissiCarrito.consultarProducto({
          id:        Number(link.dataset.id),
          nombre:    link.dataset.nombre,
          precio:    Number(link.dataset.precio),
          categoria: link.dataset.categoria
        });
      }
      // Si carrito.js no está cargado, se deja el href fallback y se abre igual
    });
  });
};

// ============================================================
// 7. FILTROS (solo catálogo)
// ============================================================
const generarFiltros = (productos) => {
  if (!filterGroup) return;

  const categorias = [...new Set(
    productos
      .map(p => (p.categoria_nombre || '').trim())
      .filter(Boolean)
  )];

  filterGroup.innerHTML = `
    <a class="filter active" href="#" data-category="all">Todos</a>
    ${categorias.map(c => `
      <a class="filter" href="#" data-category="${c.toLowerCase()}">${c}</a>
    `).join('')}`;

  filterGroup.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterGroup.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.category;
      const items = catalogoGrid.querySelectorAll('.catalog-item');

      items.forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      const visibles = [...items].filter(i => i.style.display !== 'none').length;
      if (catalogCount) catalogCount.textContent = `${visibles} diseños`;
    });
  });
};

// ============================================================
// 8. INICIALIZACIÓN SEGÚN PÁGINA
// ============================================================
const inicializarCatalogo = async () => {
  if (!catalogoGrid) return;

  mostrarCargando();

  try {
    const productos = paginaActual === 'inicio'
      ? await obtenerDestacados()
      : await obtenerProductos();

    if (productos.length === 0) {
      mostrarVacio();
      return;
    }

    renderizarCatalogo(productos);

    if (paginaActual === 'catalogo') {
      generarFiltros(productos);
    }

  } catch (error) {
    console.error('Error al cargar:', error.message);
    mostrarError('Lo sentimos, estamos teniendo problemas para cargar los productos (Error interno del servidor).');
  }
};

// ============================================================
// 9. ARRANQUE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log(`app.js cargado · página: ${paginaActual}`);
  if (paginaActual === 'inicio' || paginaActual === 'catalogo') {
    inicializarCatalogo();
  }
});