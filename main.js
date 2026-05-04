(function () {
  'use strict';

  function initMenuToggle() {
    var btn = document.querySelector('[data-menu-btn]');
    var panel = document.querySelector('[data-menu-panel]');
    if (!btn || !panel) return;

    var body = document.body;
    var desktopQuery = window.matchMedia('(min-width: 768px)');

    var closeMenu = function () {
      btn.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open', 'opacity-100', 'translate-y-0', 'pointer-events-auto');
      panel.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
      body.classList.remove('menu-open');
    };

    var openMenu = function () {
      btn.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open', 'opacity-100', 'translate-y-0', 'pointer-events-auto');
      panel.classList.remove('opacity-0', '-translate-y-2', 'pointer-events-none');
      body.classList.add('menu-open');
    };

    btn.addEventListener('click', function () {
      var isOpen = btn.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    panel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (event) {
      if (!btn.classList.contains('is-open')) return;
      if (btn.contains(event.target) || panel.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    desktopQuery.addEventListener('change', function (event) {
      if (event.matches) {
        closeMenu();
      }
    });
  }

  function initNavbarScroll() {
    var header = document.querySelector('[data-navbar]');
    var surface = document.querySelector('[data-nav-surface]');
    if (!header || !surface) return;

    var lastState = null;

    var onScroll = function () {
      var scrolled = window.scrollY > 20;
      if (scrolled === lastState) return;
      lastState = scrolled;
      header.classList.toggle('is-scrolled', scrolled);
      surface.classList.toggle('is-scrolled', scrolled);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

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

  function initSectionDividers() {
    var sections = document.querySelectorAll('main section');
    sections.forEach(function (section, index) {
      if (index === 0) return;
      section.classList.add('axora-section');
    });
  }

  function initRevealAnimations() {
    var targets = document.querySelectorAll(
      'main section .max-w-5xl, main section .max-w-6xl, main section .max-w-7xl, main section article, main section form'
    );

    if (!targets.length) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    targets.forEach(function (el, index) {
      el.classList.add('axora-reveal');
      el.style.transitionDelay = Math.min(index % 6, 5) * 70 + 'ms';
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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initScrollProgress() {
    var bar = document.querySelector('[data-scroll-progress]');
    if (!bar) return;

    var onScroll = function () {
      var doc = document.documentElement;
      var total = doc.scrollHeight - doc.clientHeight;
      var progress = total > 0 ? doc.scrollTop / total : 0;
      bar.style.transform = 'scaleX(' + progress + ')';
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  function initHoverEnhancements() {
    document.querySelectorAll('main .rounded-2xl, main .rounded-3xl, main .rounded-\\[1\\.75rem\\]').forEach(function (card) {
      card.classList.add('axora-card');
    });

    document.querySelectorAll('main a, main button').forEach(function (cta) {
      var className = cta.className || '';
      if (
        className.indexOf('rounded-full') !== -1 ||
        className.indexOf('border-violet') !== -1 ||
        className.indexOf('bg-violet') !== -1
      ) {
        cta.classList.add('axora-cta');
      }
    });
  }

  function initFocusStyles() {
    document.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.classList.add('axora-input');
    });
  }

  function initProtectedContactForm() {
    var form = document.querySelector('[data-contact-form]');
    if (!form) return;

    var status = form.querySelector('[data-form-status]');
    var submit = form.querySelector('button[type="submit"]');
    var startedAt = Date.now();
    var submitted = false;

    var showStatus = function (message, type) {
      if (!status) return;
      status.textContent = message;
      status.classList.remove(
        'hidden',
        'border-red-400/40',
        'border-violet-400/40',
        'bg-red-500/10',
        'bg-violet-500/10',
        'text-red-100',
        'text-violet-100'
      );
      if (type === 'error') {
        status.classList.add('border-red-400/40', 'bg-red-500/10', 'text-red-100');
      } else {
        status.classList.add('border-violet-400/40', 'bg-violet-500/10', 'text-violet-100');
      }
    };

    var normalize = function (value) {
      return value.replace(/\s+/g, ' ').trim();
    };

    var hasSuspiciousContent = function (value) {
      return /<[^>]*>|https?:\/\/|www\.|[\r\n]{2,}/i.test(value);
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var honeypot = form.querySelector('[data-honeypot]');
      var nombre = form.querySelector('#nombre');
      var email = form.querySelector('#email');
      var negocio = form.querySelector('#negocio');
      var mensaje = form.querySelector('#mensaje');
      var consent = form.querySelector('input[name="consentimiento"]');

      if (submitted) {
        showStatus('Tu solicitud ya fue validada. No se enviaron datos duplicados.', 'error');
        return;
      }

      if (honeypot && honeypot.value) {
        showStatus('No pudimos validar la solicitud.', 'error');
        return;
      }

      if (Date.now() - startedAt < 3000) {
        showStatus('Revisa los campos antes de enviar la solicitud.', 'error');
        return;
      }

      [nombre, email, negocio, mensaje].forEach(function (field) {
        if (field) field.value = normalize(field.value);
      });

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!consent || !consent.checked) {
        showStatus('Confirma el diagnóstico inicial antes de enviar.', 'error');
        return;
      }

      if ([nombre, negocio, mensaje].some(function (field) { return field && hasSuspiciousContent(field.value); })) {
        showStatus('Evita enlaces, código o bloques de texto sospechosos en la solicitud.', 'error');
        return;
      }

      submitted = true;
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Enviando solicitud...';
      }
      showStatus('Formulario validado. Enviando solicitud de forma segura...', 'success');
      form.submit();
    });
  }

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
        autoplay: null,
      };

      var dots = [];

      var getGap = function () {
        var styles = window.getComputedStyle(track);
        var gap = styles.gap || styles.columnGap || '0px';
        return parseFloat(gap) || 0;
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
              restartAutoplay();
            });
          })(i);
          dotsContainer.appendChild(btn);
          dots.push(btn);
        }
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

      var goNext = function () {
        state.index = state.index >= state.maxIndex ? 0 : state.index + 1;
        update();
      };

      var stopAutoplay = function () {
        if (state.autoplay) {
          window.clearInterval(state.autoplay);
          state.autoplay = null;
        }
      };

      var restartAutoplay = function () {
        stopAutoplay();
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || state.maxIndex === 0) return;
        state.autoplay = window.setInterval(goNext, 4500);
      };

      if (prev) {
        prev.addEventListener('click', function () {
          state.index = Math.max(0, state.index - 1);
          update();
          restartAutoplay();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          goNext();
          restartAutoplay();
        });
      }

      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', restartAutoplay);
      carousel.addEventListener('focusin', stopAutoplay);
      carousel.addEventListener('focusout', restartAutoplay);

      carousel.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft' && prev) {
          prev.click();
        }
        if (event.key === 'ArrowRight' && next) {
          next.click();
        }
      });

      var resizeTimer = null;
      window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
          measure();
          restartAutoplay();
        }, 150);
      });

      measure();
      restartAutoplay();
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var animateCounter = function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (Number.isNaN(target)) return;

      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1200;
      var start = null;

      var step = function (timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var value = Math.floor(progress * target);
        el.textContent = prefix + value + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target + suffix;
        }
      };

      window.requestAnimationFrame(step);
    };

    if (prefersReduced || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) {
        var target = el.getAttribute('data-target') || '0';
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        el.textContent = prefix + target + suffix;
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  initMenuToggle();
  initNavbarScroll();
  initSmoothScroll();
  initSectionDividers();
  initRevealAnimations();
  initScrollProgress();
  initHoverEnhancements();
  initFocusStyles();
  initProtectedContactForm();
  initCarousel();
  initCounters();
})();
