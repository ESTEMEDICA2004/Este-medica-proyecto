(function () {
  "use strict";

  window.initPump3D = function () {
    if (!window.THREE || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    /* ── SHARED MATERIAL FACTORY ── */
    function mats() {
      return {
        body:    new THREE.MeshStandardMaterial({ color: 0xd0dae6, metalness: 0.15, roughness: 0.55 }),
        bodyDk:  new THREE.MeshStandardMaterial({ color: 0xa0aebb, metalness: 0.25, roughness: 0.5 }),
        panel:   new THREE.MeshStandardMaterial({ color: 0x00a99d, metalness: 0.2, roughness: 0.4, emissive: 0x00a99d, emissiveIntensity: 0.08 }),
        screen:  new THREE.MeshStandardMaterial({ color: 0x061410, emissive: 0x00e0c0, emissiveIntensity: 0.65, roughness: 0.08, metalness: 0 }),
        scr2:    new THREE.MeshStandardMaterial({ color: 0x08180a, emissive: 0x60e090, emissiveIntensity: 0.3, roughness: 0.08 }),
        btn:     new THREE.MeshStandardMaterial({ color: 0x8898aa, metalness: 0.5, roughness: 0.4 }),
        btnGn:   new THREE.MeshStandardMaterial({ color: 0x00cc55, emissive: 0x00cc55, emissiveIntensity: 0.6, metalness: 0.1, roughness: 0.4 }),
        btnRd:   new THREE.MeshStandardMaterial({ color: 0xee2233, emissive: 0xee2233, emissiveIntensity: 0.5, metalness: 0.1, roughness: 0.4 }),
        rail:    new THREE.MeshStandardMaterial({ color: 0x7088a0, metalness: 0.7, roughness: 0.25 }),
        dark:    new THREE.MeshStandardMaterial({ color: 0x182535, metalness: 0.3, roughness: 0.6 }),
        rubber:  new THREE.MeshStandardMaterial({ color: 0x3a4855, metalness: 0.05, roughness: 0.85 }),
      };
    }

    /* ── HELPERS ── */
    function box(g, w, h, d, mat, x, y, z, rx, ry, rz) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x||0, y||0, z||0);
      if (rx) m.rotation.x = rx;
      if (ry) m.rotation.y = ry;
      if (rz) m.rotation.z = rz;
      m.castShadow = true; m.receiveShadow = true;
      g.add(m); return m;
    }
    function cyl(g, rt, rb, h, mat, x, y, z, rx, ry, rz, seg) {
      var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg||16), mat);
      m.position.set(x||0, y||0, z||0);
      if (rx) m.rotation.x = rx;
      if (ry) m.rotation.y = ry;
      if (rz) m.rotation.z = rz;
      m.castShadow = true;
      g.add(m); return m;
    }

    /* ── INFUSOMAT SPACE ── */
    function buildSpace(g) {
      var M = mats();
      // Cuerpo principal — horizontal, rectangular
      box(g, 2.4, 0.95, 0.72, M.body);
      // Frente panel teal
      box(g, 2.38, 0.93, 0.04, M.panel,  0, 0, 0.385);
      // Pantalla OLED pequeña (izquierda)
      box(g, 0.72, 0.54, 0.055, M.screen, -0.72, 0.07, 0.39);
      box(g, 0.78, 0.60, 0.045, M.dark,   -0.72, 0.07, 0.385); // marco
      // Texto display (bar simulada)
      box(g, 0.60, 0.04, 0.06, M.scr2, -0.72, 0.24, 0.40);
      box(g, 0.60, 0.04, 0.06, M.scr2, -0.72, 0.16, 0.40);
      // Botones redondos x5 (centro)
      [-0.12, 0.0, 0.12, 0.24, 0.36].forEach(function(x, i) {
        cyl(g, 0.055, 0.055, 0.065, i===2 ? M.btnGn : M.btn, x, 0.06, 0.39, 0,0,0, 12);
      });
      // Start/Stop (derecha)
      cyl(g, 0.085, 0.085, 0.07, M.btnGn, 0.82, 0.14, 0.39, 0,0,0, 12);
      cyl(g, 0.085, 0.085, 0.07, M.btnRd, 0.82, -0.06, 0.39, 0,0,0, 12);
      // Panel lateral derecho
      box(g, 0.08, 0.95, 0.72, M.bodyDk, 1.24, 0, 0);
      // Panel lateral izquierdo
      box(g, 0.08, 0.95, 0.72, M.bodyDk, -1.24, 0, 0);
      // Tapa superior
      box(g, 2.4,  0.07, 0.72, M.dark,  0, 0.51, 0);
      // Base inferior
      box(g, 2.52, 0.06, 0.8,  M.dark,  0, -0.505, 0);
      // Banda teal superior e inferior
      box(g, 2.38, 0.04, 0.04, M.panel, 0,  0.475, 0.365);
      box(g, 2.38, 0.04, 0.04, M.panel, 0, -0.475, 0.365);
      // Guía de tubo (lado derecho)
      cyl(g, 0.05, 0.05, 0.32, M.rail, 1.2,  0.18, 0.32, Math.PI/2, 0, 0, 8);
      cyl(g, 0.05, 0.05, 0.32, M.rail, 1.2, -0.15, 0.32, Math.PI/2, 0, 0, 8);
      // Tubo IV
      var curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.2,  0.55, 0.1),
        new THREE.Vector3(1.3,  0.18, 0.18),
        new THREE.Vector3(1.28,-0.15, 0.1),
        new THREE.Vector3(1.2, -0.55, 0.1),
      ]);
      g.add(Object.assign(
        new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.025, 8, false),
          new THREE.MeshStandardMaterial({ color: 0xb8ccd8, transparent: true, opacity: 0.65, roughness: 0.8 })),
        { castShadow: true }
      ));
    }

    /* ── INFUSOMAT COMPACT PLUS ── */
    function buildCompact(g) {
      var M = mats();
      // Cuerpo principal — más ancho y bajo
      box(g, 3.0, 1.05, 0.9, M.body);
      // Frente: panel teal grande
      box(g, 2.0, 1.03, 0.04, M.panel, 0.1, 0, 0.465);
      // Pantalla color (izquierda, más grande)
      box(g, 0.78, 0.68, 0.06, M.screen, -0.82, 0.1, 0.47);
      box(g, 0.85, 0.74, 0.05, M.dark,   -0.82, 0.1, 0.465); // marco
      // Contenido pantalla (líneas de UI)
      box(g, 0.65, 0.05, 0.065, M.scr2, -0.82, 0.36, 0.475);
      box(g, 0.65, 0.05, 0.065, M.scr2, -0.82, 0.27, 0.475);
      box(g, 0.45, 0.18, 0.065, M.panel, -0.82, 0.04, 0.475); // bloque UI
      // Pad navegación (centro) — cruz
      cyl(g, 0.065, 0.065, 0.068, M.btn, 0.05, 0.1, 0.47, 0,0,0, 12); // OK
      [ [0.05,0.22], [0.05,-0.02], [-0.12,0.1], [0.22,0.1] ].forEach(function(p) {
        cyl(g, 0.055, 0.055, 0.068, M.btn, p[0], p[1], 0.47, 0,0,0, 8);
      });
      // Botones MENU INFO BOL
      [0.48, 0.62, 0.76].forEach(function(x) {
        cyl(g, 0.038, 0.038, 0.065, M.btn, x, 0.22, 0.47, 0,0,0, 12);
      });
      // Start / Stop
      box(g, 0.22, 0.17, 0.07, M.btnGn, 0.96,  0.16, 0.47);
      box(g, 0.22, 0.17, 0.07, M.btnRd, 0.96, -0.04, 0.47);
      // Power button izquierda
      cyl(g, 0.048, 0.048, 0.068, M.btn, -1.35, 0.3, 0.47, 0,0,0, 12);
      // ── Cassette cilíndrico (derecha) ──
      cyl(g, 0.46, 0.46, 0.78, M.body, 1.48, 0, 0.06, Math.PI/2, 0, 0, 32);
      cyl(g, 0.44, 0.44, 0.06, M.panel,1.48, 0, 0.45, Math.PI/2, 0, 0, 32); // aro teal
      cyl(g, 0.28, 0.28, 0.06, M.dark, 1.48, 0, 0.45, Math.PI/2, 0, 0, 24); // centro
      // Pull tab
      box(g, 0.38, 0.13, 0.09, M.panel, 1.48, -0.26, 0.47);
      // Tapa superior
      box(g, 3.0, 0.07, 0.9, M.dark,  0, 0.56, 0);
      // Base
      box(g, 3.1, 0.06, 0.95, M.dark, 0, -0.56, 0);
      // Patas
      [ -1.1, 1.1 ].forEach(function(x) {
        box(g, 0.22, 0.1, 0.85, M.rubber, x, -0.62, 0);
      });
      // Bandas teal
      box(g, 3.0, 0.04, 0.04, M.panel, 0,  0.52, 0.455);
      box(g, 3.0, 0.04, 0.04, M.panel, 0, -0.52, 0.455);
      // Paneles laterales
      box(g, 0.08, 1.05, 0.9, M.bodyDk,  1.54, 0, 0);
      box(g, 0.08, 1.05, 0.9, M.bodyDk, -1.54, 0, 0);
    }

    /* ── SCENE BUILDER ── */
    function buildScene(canvasId, sectionId, buildPump, panelCount, initRotY) {
      var canvas  = document.getElementById(canvasId);
      var section = document.getElementById(sectionId);
      if (!canvas || !section) return;

      var W = canvas.parentElement.clientWidth;
      var H = canvas.parentElement.clientHeight;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      var scene = new THREE.Scene();
      scene.background = new THREE.Color(0x080e18);
      scene.fog = new THREE.FogExp2(0x080e18, 0.075); // denso al inicio

      var camera = new THREE.PerspectiveCamera(40, W/H, 0.1, 100);
      camera.position.set(0, 0.5, 6.0);
      camera.lookAt(0, 0, 0);

      /* Luces — todas inician en 0 */
      var ambient = new THREE.AmbientLight(0xffffff, 0);
      scene.add(ambient);

      var key = new THREE.DirectionalLight(0xfff8f0, 0);
      key.position.set(4, 6, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      scene.add(key);

      var tealFill = new THREE.PointLight(0x00c4b8, 0, 12);
      tealFill.position.set(-3.5, 1.5, 2.5);
      scene.add(tealFill);

      var rimBlue = new THREE.DirectionalLight(0x4060ff, 0);
      rimBlue.position.set(-2, 3, -4);
      scene.add(rimBlue);

      var under = new THREE.PointLight(0x00a99d, 0, 8);
      under.position.set(0, -3.5, 1.5);
      scene.add(under);

      /* Bomba */
      var pump = new THREE.Group();
      buildPump(pump);
      pump.rotation.y = initRotY || 0.2;
      scene.add(pump);

      /* Suelo con reflejo */
      var floor = new THREE.Mesh(
        new THREE.CircleGeometry(4, 64),
        new THREE.MeshStandardMaterial({ color: 0x060c18, metalness: 0.6, roughness: 0.35 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.65;
      floor.receiveShadow = true;
      scene.add(floor);

      /* Anillo de luz bajo la bomba */
      var ring = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 1.1, 64),
        new THREE.MeshBasicMaterial({ color: 0x00a99d, transparent: true, opacity: 0, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -0.62;
      scene.add(ring);

      /* Partículas flotantes */
      var pN = 70;
      var pPos = new Float32Array(pN * 3);
      for (var i = 0; i < pN; i++) {
        pPos[i*3]   = (Math.random()-0.5) * 10;
        pPos[i*3+1] = (Math.random()-0.5) * 7;
        pPos[i*3+2] = (Math.random()-0.5) * 8 - 2;
      }
      var pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      var pMat = new THREE.PointsMaterial({ color: 0x00a99d, size: 0.022, transparent: true, opacity: 0 });
      var particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      /* Estado de scroll */
      var revealVal = 0;

      /* ScrollTrigger */
      var panels = section.querySelectorAll('.ppanel');
      var progressFill = document.getElementById(
        canvasId === 'canvas-space' ? 'prog-space' : 'prog-compact'
      );
      var hint = document.getElementById(
        canvasId === 'canvas-space' ? 'hint-space' : 'hint-compact'
      );

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.8,
        onUpdate: function (self) {
          var p = self.progress;

          /* Progreso visual */
          if (progressFill) progressFill.style.height = (p * 100) + '%';
          if (hint) hint.style.opacity = p > 0.05 ? '0' : '1';

          /* ── EFECTO SOMBRA → LUZ: 0-35% del scroll ── */
          var reveal = Math.min(p / 0.35, 1);
          // Ease suavizado
          var eased = reveal < 0.5
            ? 2 * reveal * reveal
            : -1 + (4 - 2 * reveal) * reveal;

          revealVal = eased;

          ambient.intensity   = eased * 0.55;
          key.intensity       = eased * 3.8;
          tealFill.intensity  = eased * 4.2;
          rimBlue.intensity   = eased * 1.2;
          under.intensity     = eased * 2.0;

          /* Niebla se disipa */
          scene.fog.density = 0.075 - eased * 0.062; // 0.075 → 0.013

          /* Anillo glow */
          ring.material.opacity = eased * 0.22;

          /* Partículas */
          pMat.opacity = eased * 0.45;

          /* ── ROTACIÓN: 35-90% del scroll ── */
          var rotPhase = Math.max(0, (p - 0.35) / 0.55);
          var rotEased = rotPhase < 0.5
            ? 2 * rotPhase * rotPhase
            : -1 + (4 - 2 * rotPhase) * rotPhase;
          pump.rotation.y = (initRotY || 0.2) + rotEased * Math.PI * 1.65;

          /* ── PANELS: distribuidos en 4 cuartos de scroll ── */
          var idx = Math.min(Math.floor(p * panelCount), panelCount - 1);
          panels.forEach(function (panel, i) {
            var isActive = i === idx;
            panel.classList.toggle('active', isActive);
          });
        }
      });

      /* Loop de render */
      var clock = new THREE.Clock();
      var visible = true;
      var io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      });
      io.observe(canvas);

      (function animate() {
        requestAnimationFrame(animate);
        if (!visible) return;
        var t = clock.getElapsedTime();

        /* Flotación suave */
        pump.position.y = Math.sin(t * 0.55) * 0.055;

        /* Partículas giran */
        particles.rotation.y = t * 0.012;
        particles.rotation.x = t * 0.006;

        /* Pulso de luz inferior */
        if (revealVal > 0.1) {
          under.intensity = revealVal * (2.0 + Math.sin(t * 1.1) * 0.4);
        }

        renderer.render(scene, camera);
      })();

      /* Resize */
      window.addEventListener('resize', function () {
        var nw = canvas.parentElement.clientWidth;
        var nh = canvas.parentElement.clientHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      });
    }

    /* ── PHOTO VIEWER — Infusomat Space ── */
    (function () {
      var section = document.getElementById('pump-space');
      var overlay = document.getElementById('overlay-space');
      var angles  = Array.from(document.querySelectorAll('#viewer-space .pump-angle'));
      var fill    = document.getElementById('prog-space');
      var hint    = document.getElementById('hint-space');
      var panels  = Array.from(document.querySelectorAll('#pump-space .ppanel'));
      if (!section || !overlay || !angles.length) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        onUpdate: function (self) {
          var p = self.progress;

          /* Oscuridad → luz en el primer 30% del scroll */
          var reveal = Math.min(p / 0.30, 1);
          /* ease cuadrático suave */
          var eased  = reveal < 0.5 ? 2 * reveal * reveal : -1 + (4 - 2 * reveal) * reveal;
          overlay.style.opacity = String(1 - eased);

          /* Cambio de ángulo: 4 fotos en 4 cuartos */
          var idx = Math.min(Math.floor(p * 4), 3);
          angles.forEach(function (img, i) { img.classList.toggle('active', i === idx); });

          /* Texto panels */
          panels.forEach(function (panel, i) { panel.classList.toggle('active', i === idx); });

          /* Barra de progreso */
          if (fill) fill.style.height = (p * 100) + '%';

          /* Hint desaparece tras 8% scroll */
          if (hint) hint.style.opacity = p > 0.08 ? '0' : '1';
        }
      });
    })();

    /* ── ESCENA 3D — Infusomat compact plus ── */
    buildScene('canvas-compact', 'pump-compact', buildCompact, 4, -0.2);
  };

})();
