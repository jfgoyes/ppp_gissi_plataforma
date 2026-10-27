/* ============================================================
   GISSI — temas.js
   Selector de tema basado en variables CSS.
   - Anti-FOUC: aplica data-theme ANTES del primer paint
     (requiere cargarse en el <head>, sin defer/async).
   - Persiste la elección en localStorage.
   - Botón flotante + panel de swatches.
   - NO toca lógica de negocio, carrito, catálogo ni backend.
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------
     0. ANTI-FOUC — aplicar el tema guardado antes del primer paint
     ------------------------------------------------------------
     Este bloque DEBE ejecutarse antes de que el CSS se resuelva.
     Por eso este archivo se carga en el <head>, ANTES de los
     <link rel="stylesheet"> y SIN defer/async.
     ------------------------------------------------------------ */
  try {
    var temaGuardado = localStorage.getItem('gissi_theme_v1');
    if (temaGuardado) {
      document.documentElement.dataset.theme = temaGuardado;
    }
  } catch (e) {
    /* localStorage bloqueado (modo privado, cookies off…) → default azul del CSS */
  }

  /* ------------------------------------------------------------
     1. CONFIGURACIÓN
     ------------------------------------------------------------ */
  const THEME_KEY = 'gissi_theme_v1';

  const TEMAS = {
    // ---------- Cálidos ----------
    naranja:  { nombre: 'Naranja',  accent: '#ff5a1f', accent2: '#e63946' },
    rojo:     { nombre: 'Rojo',     accent: '#e63946', accent2: '#ff5a1f' },
    amarillo: { nombre: 'Amarillo', accent: '#eab308', accent2: '#f59e0b' },
    dorado:   { nombre: 'Dorado',   accent: '#d4a017', accent2: '#b8860b' },

    // ---------- Fríos ----------
    azul:     { nombre: 'Azul',     accent: '#3b82f6', accent2: '#2563eb' },
    celeste:  { nombre: 'Celeste',  accent: '#5ac5db', accent2: '#1f9dbd' },
    turquesa: { nombre: 'Turquesa', accent: '#14b8a6', accent2: '#0d9488' },

    // ---------- Neutros / naturales ----------
    marron:   { nombre: 'Marrón',   accent: '#a16207', accent2: '#78350f' },
    verde:    { nombre: 'Verde',    accent: '#22c55e', accent2: '#16a34a' },
    lima:     { nombre: 'Lima',     accent: '#84cc16', accent2: '#65a30d' },

    // ---------- Vibrantes ----------
    violeta:  { nombre: 'Violeta',  accent: '#a855f7', accent2: '#7c3aed' },
    rosa:     { nombre: 'Rosa',     accent: '#ec4899', accent2: '#db2777' }
  };

  const DEFAULT_THEME = 'azul';

  /* ------------------------------------------------------------
     2. APLICAR TEMA
     ------------------------------------------------------------
     Con la opción B del CSS (html[data-theme="…"]), solo seteamos
     `data-theme` en <html>. El CSS resuelve los hex.
     `animar = false` por defecto: en el arranque NO queremos
     transición; solo al pulsar un swatch.
     ------------------------------------------------------------ */
  const aplicarTema = (id, animar = false) => {
    const root = document.documentElement;
    const valido = TEMAS[id] ? id : DEFAULT_THEME;

    if (animar) {
      root.classList.add('theme-transitioning');
      setTimeout(() => root.classList.remove('theme-transitioning'), 400);
    }

    root.dataset.theme = valido;
  };

  const guardarTema = (id) => {
    try { localStorage.setItem(THEME_KEY, id); } catch {}
  };

  const leerTema = () => {
    try { return localStorage.getItem(THEME_KEY) || DEFAULT_THEME; }
    catch { return DEFAULT_THEME; }
  };

  /* ------------------------------------------------------------
     3. CONSTRUIR UI (botón + panel de swatches)
     ------------------------------------------------------------ */
  const construirUI = () => {
    if (document.getElementById('theme-toggle')) return; // idempotente

    // Botón circular
    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', 'Cambiar tema de color');
    btn.setAttribute('aria-expanded', 'false');
    btn.title = 'Cambiar tema';
    btn.innerHTML = `<i class="fa-solid fa-palette"></i>`;

    // Panel de swatches
    const panel = document.createElement('div');
    panel.id = 'theme-panel';
    panel.className = 'theme-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Selector de tema');

    const titulo = document.createElement('p');
    titulo.className = 'theme-panel__title';
    titulo.textContent = 'Tema';
    panel.appendChild(titulo);

    const grid = document.createElement('div');
    grid.className = 'theme-panel__grid';

    Object.entries(TEMAS).forEach(([id, t]) => {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'theme-swatch';
      sw.dataset.theme = id;
      sw.setAttribute('aria-label', `Tema ${t.nombre}`);
      sw.title = t.nombre;
      sw.innerHTML = `
        <span class="theme-swatch__color"
              style="background:${t.accent}"></span>
        <span class="theme-swatch__name">${t.nombre}</span>
      `;
      sw.addEventListener('click', () => {
        aplicarTema(id, /* animar */ true);
        guardarTema(id);
        marcarActivo(id);
        cerrarPanel();
      });
      grid.appendChild(sw);
    });

    panel.appendChild(grid);
    document.body.appendChild(panel);
    document.body.appendChild(btn);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.contains('is-open') ? cerrarPanel() : abrirPanel();
    });

    document.addEventListener('click', (e) => {
      if (!panel.classList.contains('is-open')) return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      cerrarPanel();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarPanel();
    });

    marcarActivo(leerTema());
  };

  const abrirPanel = () => {
    const panel = document.getElementById('theme-panel');
    const btn   = document.getElementById('theme-toggle');
    if (!panel || !btn) return;
    panel.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.classList.add('is-open');
  };

  const cerrarPanel = () => {
    const panel = document.getElementById('theme-panel');
    const btn   = document.getElementById('theme-toggle');
    if (!panel || !btn) return;
    panel.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.classList.remove('is-open');
  };

  const marcarActivo = (id) => {
    document.querySelectorAll('.theme-swatch').forEach(s => {
      s.classList.toggle('is-active', s.dataset.theme === id);
    });
  };

  /* ------------------------------------------------------------
     4. ARRANQUE
     ------------------------------------------------------------ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', construirUI);
  } else {
    construirUI();
  }
})();