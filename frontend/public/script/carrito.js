/* ============================================================
   GISSI — carrito.js
   Carrito de compras con persistencia en localStorage
   Checkout por WhatsApp (sin pasarela de pago)
   ============================================================ */

// ============================================================
// 1. CONFIGURACIÓN
// ============================================================
const CARRITO_KEY  = 'gissi_carrito_v1';
const WA_NUMERO    = '593993939058';
const MONEDA       = '$';

// ============================================================
// 1.5. PLANTILLAS DE WHATSAPP (formato nativo WA)
// ============================================================
// En WhatsApp: *negrita*, _cursiva_, ~tachado~, ```mono```
const formatearConsultaProducto = (producto) => {
  const nombre    = String(producto?.nombre || 'Producto').trim();
  const precio    = Number(producto?.precio);
  const precioTxt = Number.isFinite(precio) ? `$${precio.toFixed(2)}` : '(precio a consultar)';
  const categoria = String(producto?.categoria || '').trim();
  const codigo    = producto?.id ?? '—';

  const lineas = [
    `¡Hola *GISSI*! 👋`,
    ``,
    `Me interesa este diseño:`,
    ``,
    `*${nombre}*`,
    `💰 Precio: *${precioTxt}*`,
    categoria ? `🏷️ Categoría: ${categoria}` : null,
    `🔖 Código: \`#${codigo}\``,
    ``,
    `¿Podrían darme más información y disponibilidad? 🙌`
  ].filter(l => l !== null);

  return lineas.join('\n');
};

const formatearPedidoCarrito = (items, total) => {
  if (!Array.isArray(items) || items.length === 0) return '';

  const totalNum = Number(total) || 0;
  const cantidad = items.reduce((a, p) => a + (Number(p.cantidad) || 0), 0);

  const lineasProductos = items.map((p, i) => {
    const precioUnit = Number(p.precio) || 0;
    const cant       = Number(p.cantidad) || 0;
    const sub        = precioUnit * cant;
    return `${i + 1}. *${p.nombre}*\n    ${cant} × $${precioUnit.toFixed(2)} = *$${sub.toFixed(2)}*`;
  }).join('\n');

  return [
    `🛒 *NUEVO PEDIDO — GISSI*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    lineasProductos,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 Artículos: *${cantidad}*`,
    `💵 Total: *$${totalNum.toFixed(2)}*`,
    ``,
    `Quisiera coordinar el *pago* y la *entrega*. 🙌`,
    ``,
    `¡Gracias por elegir GISSI! ⚽`
  ].join('\n');
};

// Helper: abre WhatsApp con un mensaje dado
const abrirWhatsApp = (mensaje) => {
  if (!mensaje) return;
  const url = `https://api.whatsapp.com/send?phone=${WA_NUMERO}&text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank', 'noopener');
};

// ============================================================
// 2. ESTADO (leer/escribir localStorage con sanitización)
// ============================================================
const sanitizarItem = (p) => {
  if (!p || typeof p !== 'object') return null;
  const id     = Number(p.id);
  const precio = Number(p.precio);
  const cant   = Number(p.cantidad);
  if (!Number.isFinite(id) || id <= 0) return null;
  if (!Number.isFinite(precio) || precio < 0) return null;
  return {
    id,
    nombre:   String(p.nombre || 'Producto'),
    precio,
    imagen:   typeof p.imagen === 'string' ? p.imagen : '',
    cantidad: Number.isFinite(cant) && cant > 0 ? Math.floor(cant) : 1
  };
};

const leerCarrito = () => {
  try {
    const raw = localStorage.getItem(CARRITO_KEY);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data.map(sanitizarItem).filter(Boolean);
  } catch {
    return [];
  }
};

const guardarCarrito = (items) => {
  try {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('No se pudo guardar el carrito en localStorage:', e);
  }
  actualizarUI();
};

// ============================================================
// 3. OPERACIONES
// ============================================================
const carrito = {
  items: leerCarrito(),

  agregar(producto) {
    const item = sanitizarItem({
      id:       producto && producto.id,
      nombre:   producto && producto.nombre,
      precio:   producto && producto.precio,
      imagen:   producto && producto.imagen,
      cantidad: 1
    });
    if (!item) {
      console.warn('Producto inválido, no se agregó al carrito:', producto);
      return;
    }

    const existente = this.items.find(p => p.id === item.id);
    if (existente) {
      existente.cantidad += 1;
    } else {
      this.items.push(item);
    }
    guardarCarrito(this.items);
    this.abrirDrawer();
  },

  quitar(id) {
    this.items = this.items.filter(p => p.id !== id);
    guardarCarrito(this.items);
  },

  cambiarCantidad(id, delta) {
    const item = this.items.find(p => p.id === id);
    if (!item) return;
    item.cantidad = Math.max(1, item.cantidad + delta);
    guardarCarrito(this.items);
  },

  vaciar() {
    this.items = [];
    guardarCarrito(this.items);
    // Aseguramos reset visual inmediato del total y del footer
    this.render();
  },

  total() {
    return this.items.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  },

  cantidadTotal() {
    return this.items.reduce((acc, p) => acc + p.cantidad, 0);
  },

  // ---- UI ----
  abrirDrawer() {
    const drawer  = document.getElementById('carrito-drawer');
    const overlay = document.getElementById('carrito-overlay');
    if (!drawer) return;
    drawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    document.body.classList.add('carrito-open');
    this.render();
  },

  cerrarDrawer() {
    const drawer  = document.getElementById('carrito-drawer');
    const overlay = document.getElementById('carrito-overlay');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    document.body.classList.remove('carrito-open');
  },

  render() {
    const lista   = document.getElementById('carrito-lista');
    const vacio   = document.getElementById('carrito-vacio');
    const footer  = document.getElementById('carrito-footer');
    const totalEl = document.getElementById('carrito-total');
    if (!lista) return;

    // --- Estado vacío ---
    if (this.items.length === 0) {
      lista.innerHTML = '';
      if (vacio)  vacio.hidden  = false;
      if (footer) footer.hidden = true;
      if (totalEl) totalEl.textContent = `${MONEDA}0.00`;
      return;
    }

    // --- Estado con items ---
    if (vacio)  vacio.hidden  = true;
    if (footer) footer.hidden = false;

    lista.innerHTML = this.items.map(p => `
      <li class="carrito-item" data-id="${p.id}">
        <div class="carrito-item__img">
          ${p.imagen
            ? `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy">`
            : `<i class="fa-solid fa-shirt"></i>`}
        </div>
        <div class="carrito-item__info">
          <h4>${p.nombre}</h4>
          <span class="carrito-item__precio">${MONEDA}${p.precio.toFixed(2)}</span>
          <div class="carrito-item__qty">
            <button class="qty-btn" data-action="menos" aria-label="Quitar uno">−</button>
            <span>${p.cantidad}</span>
            <button class="qty-btn" data-action="mas" aria-label="Agregar uno">+</button>
          </div>
        </div>
        <button class="carrito-item__del" data-action="eliminar" aria-label="Eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </li>
    `).join('');

    if (totalEl) totalEl.textContent = `${MONEDA}${this.total().toFixed(2)}`;

    // listeners (delegación)
    lista.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const li  = e.target.closest('.carrito-item');
        if (!li) return;
        const id  = Number(li.dataset.id);
        const acc = btn.dataset.action;
        if (acc === 'mas')      this.cambiarCantidad(id, +1);
        if (acc === 'menos')    this.cambiarCantidad(id, -1);
        if (acc === 'eliminar') this.quitar(id);
      });
    });
  },

  checkoutWhatsApp() {
    if (this.items.length === 0) return;

    const mensaje = formatearPedidoCarrito(this.items, this.total());
    if (!mensaje) return;

    abrirWhatsApp(mensaje);

    // Cerrar el drawer y vaciar el carrito para que no se reenvíe por error
    this.vaciar();
    this.cerrarDrawer();
  }
};

// ============================================================
// 4. UI GLOBAL (badge + apertura)
// ============================================================
const actualizarUI = () => {
  const badge = document.getElementById('carrito-badge');
  if (badge) {
    const n = carrito.cantidadTotal();
    badge.textContent = n;
    badge.hidden = n === 0;
  }
  if (document.getElementById('carrito-drawer')) carrito.render();
};

// ============================================================
// 5. INYECTAR HTML DEL CARRITO (navbar + drawer)
// ============================================================
const inyectarCarritoUI = () => {
  // --- Botón en navbar (antes del header-cta) ---
  const header = document.querySelector('.site-header');
  if (header && !document.getElementById('carrito-btn')) {
    const btn = document.createElement('button');
    btn.id = 'carrito-btn';
    btn.className = 'carrito-btn';
    btn.setAttribute('aria-label', 'Abrir carrito');
    btn.innerHTML = `
      <i class="fa-solid fa-bag-shopping"></i>
      <span id="carrito-badge" class="carrito-badge" hidden>0</span>
    `;
    const cta = header.querySelector('.header-cta');
    if (cta) header.insertBefore(btn, cta);
    else header.appendChild(btn);
  }

  // --- Drawer + overlay ---
  if (!document.getElementById('carrito-drawer')) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="carrito-overlay" class="carrito-overlay"></div>
      <aside id="carrito-drawer" class="carrito-drawer" aria-label="Carrito de compras">
        <header class="carrito-drawer__head">
          <h3><i class="fa-solid fa-bag-shopping"></i> Tu carrito</h3>
          <button id="carrito-cerrar" class="carrito-cerrar" aria-label="Cerrar carrito">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div class="carrito-drawer__body">
          <div id="carrito-vacio" class="carrito-vacio" hidden>
            <i class="fa-solid fa-cart-shopping"></i>
            <p>Tu carrito está vacío.</p>
            <p class="carrito-vacio__sub">Explora el catálogo y agrega tus diseños favoritos.</p>
          </div>
          <ul id="carrito-lista" class="carrito-lista"></ul>
        </div>

        <footer id="carrito-footer" class="carrito-footer" hidden>
          <div class="carrito-total">
            <span>Total</span>
            <strong id="carrito-total">$0.00</strong>
          </div>
          <button id="carrito-wa" class="button primary carrito-wa">
            <i class="fa-brands fa-whatsapp"></i> Finalizar por WhatsApp
          </button>
          <button id="carrito-vaciar" class="carrito-vaciar">Vaciar carrito</button>
        </footer>
      </aside>
    `;
    document.body.appendChild(wrap);
  }

  // --- Listeners (idempotentes vía marcador) ---
  if (!document.body.dataset.carritoListeners) {
    const btnAbrir  = document.getElementById('carrito-btn');
    const btnCerrar = document.getElementById('carrito-cerrar');
    const overlay   = document.getElementById('carrito-overlay');
    const btnWA     = document.getElementById('carrito-wa');
    const btnVaciar = document.getElementById('carrito-vaciar');

    if (btnAbrir)  btnAbrir.addEventListener('click',  () => carrito.abrirDrawer());
    if (btnCerrar) btnCerrar.addEventListener('click', () => carrito.cerrarDrawer());
    if (overlay)   overlay.addEventListener('click',   () => carrito.cerrarDrawer());
    if (btnWA)     btnWA.addEventListener('click',     () => carrito.checkoutWhatsApp());
    if (btnVaciar) btnVaciar.addEventListener('click', () => {
      if (confirm('¿Vaciar el carrito?')) carrito.vaciar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') carrito.cerrarDrawer();
    });

    document.body.dataset.carritoListeners = '1';
  }

  actualizarUI();
};

// ============================================================
// 6. API PÚBLICA (para app.js)
// ============================================================
window.GissiCarrito = {
  agregar:  (producto) => carrito.agregar(producto),
  abrir:    () => carrito.abrirDrawer(),
  cerrar:   () => carrito.cerrarDrawer(),
  vaciar:   () => carrito.vaciar(),
  total:    () => carrito.total(),
  cantidad: () => carrito.cantidadTotal(),

  // Consulta individual con mensaje formateado
  consultarProducto: (producto) => {
    const msg = formatearConsultaProducto(producto);
    abrirWhatsApp(msg);
  },
  // Utilidades de testing / preview
  mensajeProducto: (producto) => formatearConsultaProducto(producto),
  mensajePedido:   ()         => formatearPedidoCarrito(carrito.items, carrito.total())
};

// ============================================================
// 7. ARRANQUE
// ============================================================
document.addEventListener('DOMContentLoaded', inyectarCarritoUI);