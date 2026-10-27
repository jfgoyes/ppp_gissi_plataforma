/* ============================================================
   GISSI — toast.js
   Notificaciones flotantes breves (éxito / error / info).
   Uso: GissiToast.exito('Producto agregado'), GissiToast.error('...')
   ============================================================ */
(function () {
  'use strict';

  const ICONOS = {
    exito: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info:  'fa-circle-info'
  };

  const crearToast = (mensaje, tipo = 'info', duracion = 3000) => {
    let contenedor = document.getElementById('gissi-toasts');
    if (!contenedor) {
      contenedor = document.createElement('div');
      contenedor.id = 'gissi-toasts';
      contenedor.className = 'gissi-toasts';
      document.body.appendChild(contenedor);
    }

    const toast = document.createElement('div');
    toast.className = `gissi-toast gissi-toast--${tipo}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <i class="fa-solid ${ICONOS[tipo] || ICONOS.info}"></i>
      <span>${mensaje}</span>
    `;
    contenedor.appendChild(toast);

    // Forzar reflow para animación
    void toast.offsetWidth;
    toast.classList.add('is-visible');

    setTimeout(() => {
      toast.classList.remove('is-visible');
      toast.classList.add('is-hiding');
      setTimeout(() => toast.remove(), 300);
    }, duracion);
  };

  window.GissiToast = {
    exito: (msg, dur) => crearToast(msg, 'exito', dur),
    error: (msg, dur) => crearToast(msg, 'error', dur || 4000),
    info:  (msg, dur) => crearToast(msg, 'info',  dur)
  };
})();