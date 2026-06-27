(function () {
  "use strict";

  /* ---- NAV SCROLL ---- */
  var nav = document.getElementById("nav");
  if (nav) {
    window.addEventListener("scroll", function () {
      nav.style.boxShadow = window.scrollY > 10
        ? "0 2px 16px rgba(0,0,0,.1)"
        : "0 1px 8px rgba(0,0,0,.06)";
    }, { passive: true });
  }

  /* ---- NAV HAMBURGER ---- */
  var hamburger = document.getElementById("nav-hamburger");
  var navLinks = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      var open = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!open));
      navLinks.classList.toggle("open", !open);
    });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target)) {
        hamburger.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("open");
      }
    });
  }

  /* ---- SMOOTH ANCHOR SCROLL ---- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id === "#") return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
    if (navLinks) {
      navLinks.classList.remove("open");
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---- REVEAL ON SCROLL ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- COUNT-UP ---- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.dataset.count, 10);
        var start = performance.now();
        var dur = 1400;
        (function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target);
          if (p < 1) requestAnimationFrame(step);
        })(start);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- FORM HANDLER ---- */
  function handleForm(formId, btnId) {
    var form = document.getElementById(formId);
    var btn = document.getElementById(btnId);
    if (!form || !btn) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      btn.classList.add("sent");
      btn.disabled = true;

      var nombre = (form.nombre ? form.nombre.value : "") || "cliente";
      var modelo = (form.modelo ? form.modelo.value : "") || "bomba B.Braun";
      var tel = (form.telefono ? form.telefono.value : "") || "";
      var inst = (form.institucion ? form.institucion.value : "") || "";

      var msg = "Hola, soy " + nombre
        + (inst ? " de " + inst : "")
        + ". Me interesa cotizar: " + modelo
        + (tel ? ". Mi teléfono es " + tel : "")
        + ". Vi su landing page de B.Braun.";

      setTimeout(function () {
        window.open("https://wa.me/528683009437?text=" + encodeURIComponent(msg), "_blank");
      }, 900);
    });
  }

  handleForm("lead-form", "submit-btn");
  handleForm("lead-form-2", "submit-btn-2");

})();
