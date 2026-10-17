/* ============================================================
   PLATAFORMA WEB GISSI — app.js
   Conexión con el backend y renderizado dinámico del catálogo
   ============================================================ */

// ============================================================
// 1. CONFIGURACIÓN
// ============================================================

const API_URL = 'http://localhost:3000/api';
const API_BASE = 'http://localhost:3000';

// Referencias del DOM
const catalogoGrid   = document.getElementById('catalogo-grid');
const catalogoEstado = document.getElementById('catalogo-estado');

// Referencias para los productos destacados
const featuredGrid   = document.getElementById('featured-grid');
const featuredEstado = document.getElementById('featured-estado');

// ============================================================
// 2. FUNCIONES DE ESTADO (UI)
// ============================================================

/**
 * Muestra el estado de carga.
 */
const mostrarCargando = () => {
  catalogoGrid.innerHTML = '';
  catalogoEstado.innerHTML = `
    <div class="catalogo__cargando">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Cargando productos...</p>
    </div>
  `;
};

/**
 * Muestra un mensaje de error.
 * @param {string} mensaje - Texto a mostrar al usuario.
 */
const mostrarError = (mensaje = 'No se pudieron cargar los productos.') => {
  catalogoGrid.innerHTML = '';
  catalogoEstado.innerHTML = `
    <div class="catalogo__error">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>${mensaje}</p>
      <button class="btn btn--outline btn--sm catalogo__reintentar" id="btn-reintentar">
        <i class="fa-solid fa-rotate-right"></i> Reintentar
      </button>
    </div>
  `;

  // Vincular el botón de reintentar
  const btnReintentar = document.getElementById('btn-reintentar');
  if (btnReintentar) {
    btnReintentar.addEventListener('click', inicializarCatalogo);
  }
};

/**
 * Muestra el estado vacío (sin productos).
 */
const mostrarVacio = () => {
  catalogoGrid.innerHTML = '';
  catalogoEstado.innerHTML = `
    <div class="catalogo__mensaje">
      <i class="fa-solid fa-box-open"></i>
      <p>No hay productos disponibles por el momento.</p>
      <p class="catalogo__mensaje-sub">Vuelve a intentarlo más tarde.</p>
    </div>
  `;
};

/**
 * Limpia los estados para mostrar solo el grid.
 */
const limpiarEstados = () => {
  catalogoEstado.innerHTML = '';
};

/* --- Estados para la sección Destacados --- */

const mostrarCargandoFeatured = () => {
  featuredGrid.innerHTML = '';
  featuredEstado.innerHTML = `
    <div class="catalogo__cargando">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Cargando destacados...</p>
    </div>
  `;
};

const mostrarErrorFeatured = () => {
  featuredGrid.innerHTML = '';
  featuredEstado.innerHTML = `
    <div class="catalogo__error">
      <i class="fa-solid fa-triangle-exclamation"></i>
      <p>No se pudieron cargar los productos destacados.</p>
    </div>
  `;
};

const mostrarVacioFeatured = () => {
  featuredGrid.innerHTML = '';
  featuredEstado.innerHTML = `
    <div class="catalogo__mensaje">
      <i class="fa-solid fa-box-open"></i>
      <p>Aún no hay productos destacados.</p>
    </div>
  `;
};

const limpiarEstadoFeatured = () => {
  featuredEstado.innerHTML = '';
};

// ============================================================
// 3. FUNCIÓN PARA OBTENER PRODUCTOS
// ============================================================

/**
 * Realiza el fetch al backend y devuelve el array de productos.
 * Lanza un Error si la petición falla.
 * @returns {Promise<Array>}
 */
const obtenerProductos = async () => {
  const response = await fetch(`${API_URL}/productos`);

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const data = await response.json();
  console.log('Respuesta del backend:', data);

  // Validación defensiva: que exista data.data y sea array
  if (!data || !Array.isArray(data.data)) {
    throw new Error('Formato de respuesta inválido del servidor.');
  }

  return data.data;
};

/**
 * Obtiene solo los productos marcados como destacados.
 */
const obtenerDestacados = async () => {
  const response = await fetch(`${API_URL}/productos/destacados`);

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.data)) {
    throw new Error('Formato de respuesta inválido del servidor.');
  }

  return data.data;
};

// ============================================================
// 4. FUNCIÓN PARA CREAR UNA TARJETA DE PRODUCTO
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

  const precioFormateado = `$${parseFloat(producto_precio).toFixed(2)}`;

  // Construir URL final de imagen
  let imagenUrl;
  if (producto_imagen) {
    imagenUrl = producto_imagen.startsWith('http')
      ? producto_imagen                                // URL externa
      : `${API_BASE}${producto_imagen}`;               // /uploads/... → local
  } else {
    imagenUrl = `https://placehold.co/600x600/cccccc/666666?text=${encodeURIComponent(producto_nombre)}`;
  }

  // Badge si está destacado
  const badgeDestacado = producto_destacado
    ? `<div class="product-card__badge product-card__badge--new">⭐ Destacado</div>`
    : '';

  return `
    <article class="product-card" data-id="${producto_id}">
      <button class="product-card__wishlist" aria-label="Agregar a favoritos">
        <i class="fa-regular fa-heart"></i>
      </button>
      <div class="product-card__image">
        <img src="${imagenUrl}" alt="${producto_nombre}" class="product-card__img">
      </div>
      <div class="product-card__body">
        <span class="product-card__category">${categoria_nombre || 'Sin categoría'}</span>
        <h3 class="product-card__name">${producto_nombre}</h3>
        <p class="product-card__description">${producto_descripcion || ''}</p>
        <div class="product-card__price">
          <span class="product-card__price-current">${precioFormateado}</span>
        </div>
        <button class="btn btn--primary btn--sm product-card__btn add-to-cart">
          <i class="fa-solid fa-bag-shopping"></i> Agregar al carrito
        </button>
      </div>
    </article>
  `;
};

// ============================================================
// 5. FUNCIÓN PARA RENDERIZAR EL CATÁLOGO
// ============================================================

const renderizarCatalogo = (productos) => {
  limpiarEstados();
  catalogoGrid.innerHTML = '';

  productos.forEach(producto => {
    catalogoGrid.innerHTML += crearTarjetaProducto(producto);
  });

  console.log(`✅ ${productos.length} productos renderizados.`);
};

/**
 * Renderiza los productos destacados en el grid de featured.
 * Reutiliza crearTarjetaProducto pero sin descripción (más compacta).
 */
const renderizarDestacados = (productos) => {
  limpiarEstadoFeatured();
  featuredGrid.innerHTML = '';

  productos.forEach(producto => {
    // Reutilizamos la misma tarjeta
    featuredGrid.innerHTML += crearTarjetaProducto(producto);
  });

  console.log(`⭐ ${productos.length} productos destacados renderizados.`);
};

// ============================================================
// 6. FUNCIÓN PRINCIPAL (INICIALIZACIÓN)
// ============================================================

const inicializarCatalogo = async () => {
  mostrarCargando();

  try {
    const productos = await obtenerProductos();

    if (productos.length === 0) {
      mostrarVacio();
      return;
    }

    renderizarCatalogo(productos);

  } catch (error) {
    console.error('Error al inicializar catálogo:', error.message);
    mostrarError('No se pudieron cargar los productos. Verifica que el backend esté corriendo.');
  }
};

const inicializarDestacados = async () => {
  mostrarCargandoFeatured();

  try {
    const destacados = await obtenerDestacados();

    if (destacados.length === 0) {
      mostrarVacioFeatured();
      return;
    }

    renderizarDestacados(destacados);

  } catch (error) {
    console.error('Error al inicializar destacados:', error.message);
    mostrarErrorFeatured();
  }
};

// ============================================================
// 7. EJECUTAR AL CARGAR EL DOM
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('app.js cargado correctamente');
  inicializarCatalogo();
  inicializarDestacados();
});