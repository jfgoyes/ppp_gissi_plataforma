/* ============================================================
   PLATAFORMA WEB GISSI — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. REFERENCIAS DEL DOM
     ---------------------------------------------------------- */
  const navbar      = document.getElementById('navbar');
  const navToggle   = document.getElementById('nav-toggle');
  const navMenu     = document.getElementById('nav-menu');
  const navOverlay  = document.getElementById('nav-overlay');
  const navLinks    = document.querySelectorAll('.navbar__link');
  const dropdown    = document.getElementById('dropdown-colecciones');
  const backToTop   = document.getElementById('back-to-top');

  /* ----------------------------------------------------------
     2. MENÚ HAMBURGUESA (MÓVIL)
     ---------------------------------------------------------- */
  const abrirMenu = () => {
    navMenu.classList.add('active');
    navOverlay.classList.add('active');
    navToggle.setAttribute('aria-expanded', 'true');
  };

  const cerrarMenu = () => {
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    if (dropdown) dropdown.classList.remove('active');
  };

  navToggle.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) {
      cerrarMenu();
    } else {
      abrirMenu();
    }
  });

  navOverlay.addEventListener('click', cerrarMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768 && !link.closest('.dropdown')) {
        cerrarMenu();
      }
    });
  });

  document.querySelectorAll('.dropdown__menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        cerrarMenu();
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      cerrarMenu();
    }
  });

  /* ----------------------------------------------------------
     3. DROPDOWN DE COLECCIONES EN MÓVIL
     ---------------------------------------------------------- */
  if (dropdown) {
    const dropdownLink = dropdown.querySelector('.navbar__link');
    dropdownLink.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdown.classList.toggle('active');
      }
    });
  }

  /* ----------------------------------------------------------
     4. NAVBAR CON CLASE .scrolled Y BOTÓN VOLVER ARRIBA
     ---------------------------------------------------------- */
  const manejarScroll = () => {
    const scrollY = window.scrollY;

    // Navbar compacta al hacer scroll
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Mostrar botón volver arriba
    if (scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', manejarScroll);
  manejarScroll(); // Ejecutar al cargar

  /* ----------------------------------------------------------
     5. BOTÓN VOLVER ARRIBA
     ---------------------------------------------------------- */
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ----------------------------------------------------------
     6. ENLACE ACTIVO SEGÚN LA SECCIÓN VISIBLE
     ---------------------------------------------------------- */
  const secciones = document.querySelectorAll('main section[id]');

  const marcarEnlaceActivo = () => {
    const scrollPos = window.scrollY + 120; // compensa navbar

    secciones.forEach(seccion => {
      const top    = seccion.offsetTop;
      const bottom = top + seccion.offsetHeight;
      const id     = seccion.getAttribute('id');

      const enlace = document.querySelector(`.navbar__link[href="#${id}"]`);

      if (enlace) {
        if (scrollPos >= top && scrollPos < bottom) {
          navLinks.forEach(l => l.classList.remove('active'));
          enlace.classList.add('active');
        }
      }
    });
  };

  window.addEventListener('scroll', marcarEnlaceActivo);
  marcarEnlaceActivo(); // Ejecutar al cargar
});