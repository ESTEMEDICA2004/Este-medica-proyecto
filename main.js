(function () {
  "use strict";

  /* ── NAV ── */
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ── HAMBURGER ── */
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var open = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!open));
      navLinks.classList.toggle('open', !open);
    });
    document.addEventListener('click', function (e) {
      if (nav && !nav.contains(e.target)) {
        hamburger.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('open');
      }
    });
  }

  /* ── SMOOTH SCROLL ── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' });
    if (navLinks) navLinks.classList.remove('open');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  });

  /* ── REVEALS ── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ── COUNT-UP ── */
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = +el.dataset.count;
        var dur = 1400;
        var start = performance.now();
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(tick);
        })(start);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ── FORM HANDLER ── */
  function handleForm(formId, btnId) {
    var form = document.getElementById(formId);
    var btn  = document.getElementById(btnId);
    if (!form || !btn) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      btn.classList.add('sent');
      btn.disabled = true;
      var n = (form.nombre    ? form.nombre.value    : '') || 'cliente';
      var t = (form.telefono  ? form.telefono.value  : '') || '';
      var i = (form.institucion ? form.institucion.value : '') || '';
      var mod = (form.modelo  ? form.modelo.value    : '') || 'bomba B.Braun';
      var cant = (form.cantidad ? form.cantidad.value : '') || '';
      var msg = 'Hola, soy ' + n
        + (i  ? ' de ' + i  : '')
        + '. Me interesa cotizar: ' + mod
        + (cant ? ', cantidad: ' + cant : '')
        + (t   ? '. Mi WhatsApp: ' + t  : '')
        + '. Vi su landing page.';
      setTimeout(function () {
        window.open('https://wa.me/528683009437?text=' + encodeURIComponent(msg), '_blank');
      }, 900);
    });
  }

  handleForm('form-hero', 'btn-hero');
  handleForm('form-main', 'btn-main');

  /* ── INIT 3D (esperamos a que carguen las libs) ── */
  window.addEventListener('load', function () {
    if (window.initPump3D) {
      if (window.gsap && window.ScrollTrigger) {
        window.initPump3D();
      } else {
        // intentar tras un momento si las libs tardaron
        setTimeout(function () {
          if (window.initPump3D) window.initPump3D();
        }, 500);
      }
    }
  });

})();
