(function () {
  "use strict";

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ---- SPLASH ---- */
  function initSplash() {
    var splash = document.querySelector("[data-splash]");
    if (!splash) return;
    var hide = function () { splash.classList.add("is-out"); };
    if (document.readyState === "complete") {
      setTimeout(hide, 700);
    } else {
      window.addEventListener("load", function () { setTimeout(hide, 500); });
    }
    setTimeout(hide, 3800);
  }

  /* ---- NAV scroll ---- */
  function initNav() {
    var nav = document.querySelector(".nav");
    if (!nav) return;
    function onScroll() {
      if (window.scrollY > 60) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- SMOOTH ANCHOR SCROLL ---- */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var offset = 80;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: "smooth"
      });
    });
  }

  /* ---- REVEAL ON SCROLL ---- */
  function initReveals() {
    var els = document.querySelectorAll(".reveal, .reveal-line");
    if (!els.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" });

    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.is-visible), .reveal-line:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ---- COUNT-UP ---- */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var target = parseInt(el.dataset.countTo, 10);
        var duration = 1600;
        var start = performance.now();
        function step(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---- HERO PARALLAX ---- */
  function initHeroParallax() {
    var img = document.querySelector(".hero-photo-hospital");
    if (!img) return;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY * 0.3;
        img.style.transform = "translateY(" + y + "px)";
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- CARD TILT ---- */
  function initTilt() {
    if (window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll(".model-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = (e.clientX - cx) / (rect.width / 2);
        var dy = (e.clientY - cy) / (rect.height / 2);
        card.style.transform = "translateY(-6px) rotateY(" + (dx * 5) + "deg) rotateX(" + (-dy * 5) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---- FORM SUBMIT ---- */
  function initForm() {
    var form = document.getElementById("cta-form");
    var btn = document.getElementById("submit-btn");
    if (!form || !btn) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      btn.classList.add("sent");
      btn.disabled = true;
      setTimeout(function () {
        var phone = "528683009437";
        var nombre = (form.nombre ? form.nombre.value : "") || "cliente";
        var modelo = (form.modelo ? form.modelo.value : "") || "equipo B.Braun";
        var msg = encodeURIComponent("Hola, soy " + nombre + " y me interesa cotizar: " + modelo + ". Vi su landing de B.Braun.");
        window.open("https://wa.me/" + phone + "?text=" + msg, "_blank");
      }, 800);
    });
  }

  /* ---- GSAP SCROLL ANIMATIONS ---- */
  function initGSAP() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".model-card", {
      y: 60, opacity: 0, stagger: 0.15, duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".models-grid", start: "top 80%" }
    });

    gsap.from(".feature-item", {
      y: 40, opacity: 0, stagger: 0.1, duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".features-grid", start: "top 80%" }
    });

    gsap.from(".about-visual", {
      x: 60, opacity: 0, duration: 1.2,
      ease: "power3.out",
      scrollTrigger: { trigger: ".about-grid", start: "top 75%" }
    });
  }

  /* ---- PUMP 3D PROGRESS BAR ---- */
  function initPumpProgress() {
    var fill = document.getElementById("pump-progress-fill");
    var hint = document.querySelector(".pump-hint");
    if (!fill) return;

    ScrollTrigger && ScrollTrigger.create({
      trigger: "#pump-section",
      start: "top top",
      end: "bottom bottom",
      onUpdate: function (self) {
        fill.style.height = (self.progress * 100) + "%";
        if (hint) hint.style.opacity = self.progress > 0.05 ? "0" : "";
      },
    });
  }

  /* ---- BOOT ---- */
  function boot() {
    safe(initSplash, "initSplash");
    safe(initNav, "initNav");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals, "initReveals");
    safe(initCounters, "initCounters");
    safe(initHeroParallax, "initHeroParallax");
    safe(initTilt, "initTilt");
    safe(initForm, "initForm");
    safe(initGSAP, "initGSAP");
    if (window.gsap) gsap.registerPlugin(ScrollTrigger);
    if (window.initPump3D) safe(initPump3D, "initPump3D");
    safe(initPumpProgress, "initPumpProgress");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
