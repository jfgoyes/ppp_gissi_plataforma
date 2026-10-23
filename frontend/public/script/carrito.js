/* ============================================================
   GISSI — carrito.js
   Carrito de cotización con persistencia en localStorage
   Checkout por WhatsApp (sin pasarela de pago)
   ============================================================ */

// ============================================================
// 1. CONFIGURACIÓN
// ============================================================
const CARRITO_KEY  = 'gissi_deportivo_carrito_v1';
const WA_NUMERO    = '593993939058';
const MONEDA       = '$';

// ============================================================
// 1.5. PLANTILLAS DE WHATSAPP (formato nativo WA)
// ============================================================
// En WhatsApp: *negrita*, _cursiva_, ~tachado~, ```mono```

/**
 * Mensaje de cotización para UN producto.
 * Usado desde producto.html y desde el botón de cada tarjeta.
 */
const formatearConsultaProducto = (producto) => {
  const nombre    = String(producto?.nombre || 'Diseño').trim();
  const precio    = Number(producto?.precio);
  const precioTxt = Number.isFinite(precio) ? `$${precio.toFixed(2)}` : '(a confirmar)';
  const categoria = String(producto?.categoria || '').trim();
  const codigo    = producto?.id ?? '—';

  const lineas = [
    `¡Hola *Textiles Los Pastos*! 👋`,
    ``,
    `Me interesa este diseño:`,
    ``,
    `*${nombre}*`,
    `💰 Precio: *${precioTxt}* _referencial_`,
    categoria ? `🏷️ Categoría: ${categoria}` : null,
    `🔖 Código: \`#${codigo}\``,
    ``,
    `📐 Datos para cotizar:`,
    `• Tallas que necesito:`,
    `• Colores / combinación:`,
    `• Cantidad aproximada:`,
    `• Personalización (escudo, nombres, números):`,
    ``,
    `¿Me confirman *disponibilidad*, *valor final* y *tiempo de entrega*? 🙌`
  ].filter(l => l !== null);

  return lineas.join('\n');
};

/**
 * Mensaje de solicitud de cotización para TODA la selección.
 * La suma del carrito se presenta como "total referencial".
 */
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
    `🛒 *PEDIDO — Textiles Los Pastos*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Diseños seleccionados:`,
    ``,
    lineasProductos,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📦 Artículos: *${cantidad}*`,
    `💵 Total: *$${totalNum.toFixed(2)}* _referencial_`,
    ``,
    `_El valor final se confirma al cotizar según tallas, cantidades y personalización._`,
    ``,
    `Para preparar la cotización:`,
    `• Tallas por diseño:`,
    `• Colores / combinación:`,
    `• Personalización (escudo, nombres, números):`,
    `• Fecha deseada de entrega:`,
    ``,
    `¿Me envían la *cotización* y el *tiempo de confección*? 🙌`,
    ``,
    `¡Gracias por elegir Textiles Los Pastos! ⚽`
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
// 3. OPERACIONES (idénticas al original)
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
          <span class="carrito-item__precio">${MONEDA}${p.precio.toFixed(2)} <small>ref.</small></span>
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

    // Se conserva el comportamiento: cerrar y vaciar para no reenviar.
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
  // --- Botón en navbar ---
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
      <aside id="carrito-drawer" class="carrito-drawer" aria-label="Carrito">
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
            <p class="carrito-vacio__sub">Agrega los diseños que te interesen y envíalos por WhatsApp.</p>
          </div>
          <ul id="carrito-lista" class="carrito-lista"></ul>
        </div>

        <footer id="carrito-footer" class="carrito-footer" hidden>
          <div class="carrito-total">
            <span>Total</span>
            <strong id="carrito-total">$0.00</strong>
          </div>
          <p class="carrito-nota">
            El valor final se confirma al cotizar según tallas, cantidades y personalización.
          </p>
          <button id="carrito-wa" class="button primary carrito-wa">
            <i class="fa-brands fa-whatsapp"></i> Enviar por WhatsApp
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

  // --- Botones WhatsApp genéricos con data-accion="wsp-*" ---
  // Permite que cualquier HTML (proceso.html, nosotros.html, …) delegue
  // el mensaje predefinido a carrito.js, en lugar de hardcodearlo en el href.
  // El href del HTML se deja como fallback por si este script no carga.
  inyectarHandlersWhatsAppGenericos();

  actualizarUI();
};


// ============================================================
// 5.1. MENSAJES PREDEFINIDOS DE WHATSAPP POR CONTEXTO
// ============================================================
// Se usan cuando el HTML tiene <a data-accion="wsp-XXX">.
// El número destino es siempre WA_NUMERO (593993939058).
const MENSAJES_WSP_PREDEFINIDOS = {
  // Botón "Cotizar por WhatsApp" de proceso.html
  proceso: () => [
    `¡Hola *Textiles Los Pastos*! 👋`,
    ``,
    `Quisiera información para cotizar diseños.`,
    ``,
    `• Tipo de prenda (escolar / trabajo / deportivo):`,
    `• Cantidad aproximada:`,
    `• Tallas:`,
    `• Colores / personalización (escudo, nombres, números):`,
    `• Fecha deseada de entrega:`,
    ``,
    `¿Me pueden asesorar y enviar una cotización? 🙌`
  ].join('\n'),

  // Botón "Contáctanos" de nosotros.html
  nosotros: () => [
    `¡Hola *Textiles Los Pastos*! 👋`,
    ``,
    `Me gustaría saber más sobre sus diseños y su proceso de confección.`,
    ``,
    `¿Me pueden dar más información? 🙌`
  ].join('\n'),

  // Fallback genérico (cualquier [data-accion="wsp-general"])
  general: () => [
    `¡Hola *Textiles Los Pastos*! 👋`,
    ``,
    `Quisiera más información sobre sus diseños. 🙌`
  ].join('\n')
};


// ============================================================
// 5.2. HANDLER GENÉRICO PARA BOTONES WHATSAPP
// ============================================================
const inyectarHandlersWhatsAppGenericos = () => {
  document.querySelectorAll('[data-accion^="wsp-"]').forEach(el => {
    // Idempotente: no enganchar dos veces el mismo botón
    if (el.dataset.wspBound === '1') return;
    el.dataset.wspBound = '1';

    el.addEventListener('click', (e) => {
      // El slug después de "wsp-": wsp-proceso -> proceso, wsp-nosotros -> nosotros
      const slug  = el.dataset.accion.replace(/^wsp-/, '').trim();
      const build = MENSAJES_WSP_PREDEFINIDOS[slug] || MENSAJES_WSP_PREDEFINIDOS.general;
      const msg   = build();

      // Si por alguna razón el mapa no produjo nada, dejamos que el href haga su trabajo
      if (!msg) return;

      e.preventDefault();
      abrirWhatsApp(msg);
    });
  });
};

// ============================================================
// 6. API PÚBLICA (para app.js y producto.js — MISMA FIRMA)
// ============================================================
window.GissiCarrito = {
  agregar:  (producto) => carrito.agregar(producto),
  abrir:    () => carrito.abrirDrawer(),
  cerrar:   () => carrito.cerrarDrawer(),
  vaciar:   () => carrito.vaciar(),
  total:    () => carrito.total(),
  cantidad: () => carrito.cantidadTotal(),

  // Consulta individual con mensaje formateado (cotización)
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