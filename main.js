(function () {
  'use strict';

  // Mobile menu toggle (abre/cierra el panel)
  function initMenuToggle() {
    var btn = document.querySelector('[data-menu-btn]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!btn || !panel) return;

    var closeMenu = function () {
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      panel.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
      panel.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
    };

    btn.addEventListener('click', function () {
      var isOpen = btn.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      panel.classList.toggle('is-open');
      panel.classList.toggle('opacity-0');
      panel.classList.toggle('-translate-y-2');
      panel.classList.toggle('pointer-events-none');
      panel.classList.toggle('opacity-100');
      panel.classList.toggle('translate-y-0');
      panel.classList.toggle('pointer-events-auto');
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  // Navbar con fondo y blur al hacer scroll
  function initNavbarScroll() {
    var header = document.querySelector('[data-navbar]');
    var surface = document.querySelector('[data-nav-surface]');
    if (!header || !surface) return;

    var lastState = null;
    var onScroll = function () {
      var scrolled = window.scrollY > 12;
      if (scrolled === lastState) return;
      lastState = scrolled;
      header.classList.toggle('is-scrolled', scrolled);
      surface.classList.toggle('is-scrolled', scrolled);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Scroll suave en anclas internas de la misma página
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href');
        if (!href || href === '#') return;

        var target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  // Separadores visuales entre secciones
  function initSectionDividers() {
    var sections = document.querySelectorAll('main section');
    sections.forEach(function (section, index) {
      if (index === 0) return;
      section.classList.add('axora-section');
    });
  }

  // Animaciones de aparición al hacer scroll
  function initRevealAnimations() {
    var targets = document.querySelectorAll(
      'main section .max-w-5xl, main section .max-w-6xl, main section .max-w-7xl'
    );

    if (!targets.length) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    targets.forEach(function (el) {
      el.classList.add('axora-reveal');
      if (prefersReduced) {
        el.classList.add('is-visible');
      }
    });

    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Microinteracciones en cards y CTAs
  function initHoverEnhancements() {
    var cards = document.querySelectorAll('main .rounded-2xl, main .rounded-3xl');
    cards.forEach(function (card) {
      card.classList.add('axora-card');
    });

    var ctas = document.querySelectorAll('main a, main button');
    ctas.forEach(function (cta) {
      var className = cta.className || '';
      if (className.includes('rounded-full') || className.includes('border-violet-500') || className.includes('bg-violet-600')) {
        cta.classList.add('axora-cta');
      }
    });
  }

  // Foco visual mejorado en inputs del formulario
  function initFocusStyles() {
    var fields = document.querySelectorAll('input, textarea, select');
    fields.forEach(function (field) {
      field.classList.add('axora-input');
    });
  }

  // Carrusel ligero (sin librerías)
  function initCarousel() {
    var carousels = document.querySelectorAll('[data-carousel]');
    if (!carousels.length) return;

    carousels.forEach(function (carousel) {
      var track = carousel.querySelector('[data-carousel-track]');
      var items = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-item]'));
      var prev = carousel.querySelector('[data-carousel-prev]');
      var next = carousel.querySelector('[data-carousel-next]');
      var dotsContainer = carousel.querySelector('[data-carousel-dots]');

      if (!track || items.length === 0) return;

      var state = {
        index: 0,
        maxIndex: 0,
        itemWidth: 0,
        gap: 0,
      };

      var dots = [];

      var getGap = function () {
        var styles = window.getComputedStyle(track);
        var gap = styles.gap || styles.columnGap || '0px';
        return parseFloat(gap) || 0;
      };

      var measure = function () {
        var itemRect = items[0].getBoundingClientRect();
        var containerRect = track.parentElement.getBoundingClientRect();
        var gap = getGap();
        var visible = Math.max(1, Math.round(containerRect.width / itemRect.width));

        state.gap = gap;
        state.itemWidth = itemRect.width + gap;
        state.maxIndex = Math.max(0, items.length - visible);

        if (state.index > state.maxIndex) {
          state.index = state.maxIndex;
        }

        buildDots();
        update();
      };

      var update = function () {
        track.style.transform = 'translateX(' + -(state.index * state.itemWidth) + 'px)';
        if (prev) prev.disabled = state.index === 0;
        if (next) next.disabled = state.index === state.maxIndex;
        dots.forEach(function (dot, idx) {
          dot.classList.toggle('is-active', idx === state.index);
        });
      };

      var buildDots = function () {
        if (!dotsContainer) return;
        var totalDots = state.maxIndex + 1;

        if (dots.length === totalDots) return;

        dotsContainer.innerHTML = '';
        dots = [];

        for (var i = 0; i < totalDots; i += 1) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'axora-dot';
          btn.setAttribute('aria-label', 'Ir al slide ' + (i + 1));
          (function (index) {
            btn.addEventListener('click', function () {
              state.index = index;
              update();
            });
          })(i);
          dotsContainer.appendChild(btn);
          dots.push(btn);
        }
      };

      if (prev) {
        prev.addEventListener('click', function () {
          state.index = Math.max(0, state.index - 1);
          update();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          state.index = Math.min(state.maxIndex, state.index + 1);
          update();
        });
      }

      var resizeTimer = null;
      window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(measure, 150);
      });

      measure();
    });
  }

  // Inicializaciones
  initMenuToggle();
  initNavbarScroll();
  initSmoothScroll();
  initSectionDividers();
  initRevealAnimations();
  initHoverEnhancements();
  initFocusStyles();
  initCarousel();
})();
