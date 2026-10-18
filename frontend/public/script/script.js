/* ============================================================
   PLATAFORMA WEB GISSI — script.js
   Interacciones comunes a todas las páginas
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. REFERENCIAS ---------- */
  const header    = document.querySelector('.site-header');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');
  const backToTop = document.getElementById('back-to-top');

  /* ---------- 2. MENÚ HAMBURGUESA ---------- */
  const abrirMenu = () => {
    navMenu.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  };

  const cerrarMenu = () => {
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.contains('active') ? cerrarMenu() : abrirMenu();
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) cerrarMenu();
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) cerrarMenu();
    });
  }

  /* ---------- 3. HEADER SCROLL + BACK TO TOP ---------- */
  const manejarScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    if (backToTop) {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', manejarScroll);
  manejarScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 4. ENLACE ACTIVO POR URL ---------- */
  const path = window.location.pathname.split('/').pop() || 'inicio.html';
  document.querySelectorAll('.main-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) link.classList.add('active');
    else link.classList.remove('active');
  });

  /* ---------- 5. CONTADORES ANIMADOS (Nosotros) ---------- */
  const stats = document.querySelectorAll('.stat-card strong');
  let statsAnimated = false;

  const animarStats = () => {
    if (statsAnimated || stats.length === 0) return;

    // Se dispara cuando el bloque entra en viewport
    const primerStat = stats[0];
    const rect = primerStat.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50 && rect.bottom > 0) {
      statsAnimated = true;

      stats.forEach(stat => {
        const texto = stat.textContent.trim();
        const match = texto.match(/^([+\-]?)(\d+)(%?)$/);
        if (!match) return;

        const [, prefix, num, suffix] = match;
        const target   = parseInt(num, 10);
        const duration = 1600;
        const start    = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const v = Math.floor(p * target);
          stat.textContent = `${prefix}${v}${suffix}`;
          if (p < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });
    }
  };

  window.addEventListener('scroll', animarStats);
  animarStats();

});