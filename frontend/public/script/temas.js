/* ============================================================
   GISSI — temas.js
   Selector de tema basado en variables CSS.
   - Cambia solo --accent y --accent-2 en <html>.
   - Persiste la elección en localStorage (mismo patrón que carrito).
   - Botón circular flotante abajo a la derecha + panel de swatches.
   - NO toca lógica de negocio, carrito, catálogo ni backend.
   ============================================================ */

(function () {
  'use strict';

  const THEME_KEY = 'gissi_theme_v1';

  const TEMAS = {
    naranja:  { nombre: 'Naranja',  accent: '#ff5a1f', accent2: '#e63946' },
    rojo:     { nombre: 'Rojo',     accent: '#e63946', accent2: '#ff5a1f' },
    verde:    { nombre: 'Verde',    accent: '#22c55e', accent2: '#16a34a' },
    azul:     { nombre: 'Azul',     accent: '#3b82f6', accent2: '#2563eb' },
    violeta:  { nombre: 'Violeta',  accent: '#a855f7', accent2: '#7c3aed' },
    amarillo: { nombre: 'Amarillo', accent: '#eab308', accent2: '#f59e0b' }
  };

  const DEFAULT_THEME = 'azul';

  // ---------- Aplicar tema ----------
  const aplicarTema = (id) => {
    const tema = TEMAS[id] || TEMAS[DEFAULT_THEME];
    const root = document.documentElement;
    root.style.setProperty('--accent', tema.accent);
    root.style.setProperty('--accent-2', tema.accent2);
    // Marca en <html> para CSS si se quiere afinar algún detalle
    root.dataset.theme = TEMAS[id] ? id : DEFAULT_THEME;
  };

  const guardarTema = (id) => {
    try { localStorage.setItem(THEME_KEY, id); } catch {}
  };

  const leerTema = () => {
    try { return localStorage.getItem(THEME_KEY) || DEFAULT_THEME; }
    catch { return DEFAULT_THEME; }
  };

  // ---------- Aplicar antes del paint ----------
  // Se ejecuta tan pronto como el script corre (antes de DOMContentLoaded),
  // para evitar "flash" del naranja por defecto.
  aplicarTema(leerTema());

  // ---------- Construir UI ----------
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
        aplicarTema(id);
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

    // Cerrar al click fuera o Escape
    document.addEventListener('click', (e) => {
      if (!panel.classList.contains('is-open')) return;
      if (panel.contains(e.target) || btn.contains(e.target)) return;
      cerrarPanel();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarPanel();
    });

    // Marcar tema activo al inicio
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

  // ---------- Arranque ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', construirUI);
  } else {
    construirUI();
  }
})();