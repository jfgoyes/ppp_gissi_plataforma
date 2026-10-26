/* ============================================================
   PLATAFORMA WEB GISSI — app.js
   Conexión con el backend + renderizado dinámico
   Adaptado a interfaz 2 multi-página
   Con integración de cotización (window.GissiCarrito)
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
// 1.5. ESTADO DE FILTROS DEL CATÁLOGO
// ============================================================
const estadoFiltros = {
  categoria: 'all',   // 'all' | nombre de categoría en minúsculas
  busqueda: '',       // texto libre del buscador
  productos: []       // productos originales cargados del backend
};

// ============================================================
// 2. ESTADOS UI
//    (todas como `function` para que el hoisting evite
//     problemas de orden entre funciones que se referencian)
// ============================================================
function mostrarCargando() {
  if (!catalogoGrid) return;
  catalogoGrid.innerHTML = '';
  catalogoEstado.innerHTML = `
    <div class="catalogo__cargando">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Cargando diseños…</p>
    </div>`;
}

function mostrarError(mensaje = 'No se pudieron cargar los diseños.') {
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
}

function mostrarSinResultados(texto, categoria) {
  if (!catalogoGrid) return;

  const partes = [];
  if (texto) partes.push(`"${texto}"`);
  if (categoria !== 'all') partes.push(`categoría "${categoria}"`);

  const detalle = partes.length
    ? `que coincidan con ${partes.join(' en ')}`
    : 'con esos filtros';

  catalogoGrid.innerHTML = '';
  catalogoEstado.innerHTML = `
    <div class="catalogo__mensaje">
      <i class="fa-solid fa-magnifying-glass-minus"></i>
      <p>No encontramos diseños ${detalle}.</p>
      <p class="catalogo__mensaje-sub">Prueba con otro término o limpia los filtros.</p>
      <button class="button outline catalogo__reintentar" id="btn-limpiar-vacio">
        <i class="fa-solid fa-rotate-left"></i> Limpiar filtros
      </button>
    </div>`;

  document.getElementById('btn-limpiar-vacio')
    ?.addEventListener('click', limpiarTodosLosFiltros);
}

function mostrarVacio() {
  if (!catalogoGrid) return;
  catalogoGrid.innerHTML = '';
  catalogoEstado.innerHTML = `
    <div class="catalogo__mensaje">
      <i class="fa-solid fa-box-open"></i>
      <p>No hay diseños disponibles en este momento.</p>
      <p class="catalogo__mensaje-sub">Vuelve a intentarlo más tarde o escríbenos por WhatsApp.</p>
    </div>`;
}

function limpiarEstados() {
  if (catalogoEstado) catalogoEstado.innerHTML = '';
}

function limpiarTodosLosFiltros() {
  estadoFiltros.categoria = 'all';
  estadoFiltros.busqueda  = '';

  // UI: input y botón clear
  const input    = document.getElementById('catalog-search');
  const btnClear = document.getElementById('catalog-search-clear');
  if (input)    input.value = '';
  if (btnClear) btnClear.hidden = true;

  // UI: chips de categoría
  if (filterGroup) {
    filterGroup.querySelectorAll('.filter').forEach(b => {
      b.classList.toggle('active', b.dataset.category === 'all');
    });
  }

  aplicarFiltros();
}

function actualizarBotonLimpiar() {
  const btn = document.getElementById('catalog-limpiar');
  if (!btn) return;
  const hayFiltros =
    estadoFiltros.categoria !== 'all' ||
    estadoFiltros.busqueda.trim() !== '';
  btn.hidden = !hayFiltros;
}

// ============================================================
// 3. FETCH (con retraso artificial de desarrollo)
// ============================================================
async function obtenerProductos() {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Retraso artificial.
  const res = await fetch(`${API_URL}/productos`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.data)) throw new Error('Respuesta inválida');
  return data.data;
}

async function obtenerDestacados() {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Retraso artificial.
  const res = await fetch(`${API_URL}/productos/destacados`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.data)) throw new Error('Respuesta inválida');
  return data.data;
}

// ============================================================
// 4. HELPERS
// ============================================================
// Escapa comillas dobles para meter el nombre en un atributo HTML
function escAttr(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============================================================
// 5. TARJETA DE PRODUCTO (modo cotización)
// ============================================================
function crearTarjetaProducto(producto) {
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
    ? `<div class="product-card__badge">⭐ Diseño destacado</div>`
    : '';

  const variants = ['dark', 'red', 'dark', 'light'];
  const variant  = variants[producto_id % variants.length];

  // Fallback del href de WhatsApp (si carrito.js no cargó)
  const waNumero   = '593993939058';
  const waFallback = encodeURIComponent(
    `Hola GISSI, me interesa el diseño "${producto_nombre}" (código ${producto_id}). ¿Me pueden dar más información y cotización?`
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
        <a class="card-ver-mas" href="producto.html?id=${producto_id}"
          aria-label="Ver detalle de ${escAttr(producto_nombre)}"
          title="Ver detalle">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
      <div class="catalog-info">
        <h3>${producto_nombre}</h3>
        <p>${producto_descripcion || 'Ver diseño completo'}</p>
        <div class="catalog-footer">
          <div class="precio-referencial">
            <strong>${precio}</strong>
            <span class="precio-tag">referencial</span>
          </div>
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
              aria-label="Consultar ${escAttr(producto_nombre)} por WhatsApp"
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
}

// ============================================================
// 6. LISTENERS DE LAS TARJETAS (idempotentes por render)
//    Como se llama después de cada `innerHTML = ...`, los
//    listeners anteriores ya no existen; no hay duplicación.
// ============================================================
function reengancharListenersTarjetas() {
  if (!catalogoGrid) return;

  // Agregar a cotización
  catalogoGrid.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const producto = {
        id:     Number(btn.dataset.id),
        nombre: btn.dataset.nombre,
        precio: Number(btn.dataset.precio),
        imagen: btn.dataset.imagen
      };
      if (window.GissiCarrito?.agregar) {
        window.GissiCarrito.agregar(producto);
      } else {
        console.warn('carrito.js no está cargado; no se puede agregar a la cotización.');
      }
    });
  });

  // WhatsApp individual
  catalogoGrid.querySelectorAll('[data-accion="wsp-producto"]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.GissiCarrito?.consultarProducto) {
        e.preventDefault();
        window.GissiCarrito.consultarProducto({
          id:        Number(link.dataset.id),
          nombre:    link.dataset.nombre,
          precio:    Number(link.dataset.precio),
          categoria: link.dataset.categoria
        });
      }
    });
  });
}

// ============================================================
// 6.5. RENDERIZAR CATÁLOGO
// ============================================================
function renderizarCatalogo(productos) {
  if (!catalogoGrid) return;
  limpiarEstados();
  catalogoGrid.innerHTML = productos.map(crearTarjetaProducto).join('');
  if (catalogCount) {
    catalogCount.textContent = productos.length === 1
      ? '1 diseño'
      : `${productos.length} diseños`;
  }
  reengancharListenersTarjetas();
  console.log(`✅ ${productos.length} diseños renderizados en "${paginaActual}".`);
}

// ============================================================
// 7. APLICAR FILTROS COMBINADOS (categoría + búsqueda)
// ============================================================
function aplicarFiltros() {
  const { categoria, busqueda, productos } = estadoFiltros;
  const texto = busqueda.trim().toLowerCase();

  const filtrados = productos.filter(p => {
    // 1) Categoría
    const coincideCategoria =
      categoria === 'all' ||
      (p.categoria_nombre || '').toLowerCase() === categoria;
    if (!coincideCategoria) return false;

    // 2) Texto (nombre, categoría, descripción, colores)
    if (!texto) return true;

    const nombre      = (p.producto_nombre      || '').toLowerCase();
    const categoriaN  = (p.categoria_nombre     || '').toLowerCase();
    const descripcion = (p.producto_descripcion || '').toLowerCase();
    const colores     = (p.producto_colores     || '').toLowerCase();

    return (
      nombre.includes(texto)      ||
      categoriaN.includes(texto)  ||
      descripcion.includes(texto) ||
      colores.includes(texto)
    );
  });

  // Render (o mensaje de sin resultados)
  if (filtrados.length === 0) {
    mostrarSinResultados(texto, categoria);
    if (catalogCount) catalogCount.textContent = '0 diseños';
  } else {
    limpiarEstados();
    catalogoGrid.innerHTML = filtrados.map(crearTarjetaProducto).join('');
    reengancharListenersTarjetas();
    if (catalogCount) {
      catalogCount.textContent = filtrados.length === 1
        ? '1 diseño'
        : `${filtrados.length} diseños`;
    }
  }

  // Botón limpiar
  actualizarBotonLimpiar();
}

// ============================================================
// 8. FILTROS POR CATEGORÍA
// ============================================================
function generarFiltros(productos) {
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
      estadoFiltros.categoria = btn.dataset.category;
      aplicarFiltros();
    });
  });
}

// ============================================================
// 9. BUSCADOR EN TIEMPO REAL (con debounce e idempotencia)
// ============================================================
function configurarBuscador() {
  const input      = document.getElementById('catalog-search');
  const btnClear   = document.getElementById('catalog-search-clear');
  const btnLimpiar = document.getElementById('catalog-limpiar');
  if (!input) return;

  // Idempotencia: no enganchar dos veces si se llama más de una vez
  if (input.dataset.buscadorBound === '1') return;
  input.dataset.buscadorBound = '1';

  let debounceId = null;

  input.addEventListener('input', () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      estadoFiltros.busqueda = input.value;
      if (btnClear) btnClear.hidden = input.value.trim() === '';
      aplicarFiltros();
    }, 150);
  });

  // Enter no envía formulario
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      input.value = '';
      estadoFiltros.busqueda = '';
      btnClear.hidden = true;
      aplicarFiltros();
      input.focus();
    });
  }

  if (btnLimpiar) {
    btnLimpiar.addEventListener('click', limpiarTodosLosFiltros);
  }
}

// ============================================================
// 10. INICIALIZACIÓN SEGÚN PÁGINA
// ============================================================
async function inicializarCatalogo() {
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

    // Guardar en el estado global
    estadoFiltros.productos = productos;

    // Render inicial
    renderizarCatalogo(productos);

    // Solo en catálogo: filtros + buscador + reset de estado
    if (paginaActual === 'catalogo') {
      generarFiltros(productos);
      configurarBuscador();
      // Reset visual + estado (necesario si venimos de un "Reintentar")
      limpiarTodosLosFiltros();
    }

  } catch (error) {
    console.error('Error al cargar:', error.message);
    mostrarError('Lo sentimos, estamos teniendo problemas para cargar los diseños (Error interno del servidor).');
  }
}

// ============================================================
// 11. ARRANQUE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  console.log(`app.js cargado · página: ${paginaActual}`);
  if (paginaActual === 'inicio' || paginaActual === 'catalogo') {
    inicializarCatalogo();
  }
});