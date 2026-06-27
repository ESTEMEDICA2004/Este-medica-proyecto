(function () {
  "use strict";

  window.initPump3D = function () {
    if (!window.THREE || !window.gsap || !window.ScrollTrigger) return;

    var canvas = document.getElementById("pump-canvas");
    if (!canvas) return;

    /* ---- RENDERER ---- */
    var W = canvas.parentElement.clientWidth;
    var H = canvas.parentElement.clientHeight;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    /* ---- SCENE ---- */
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b1117, 0.018);

    /* ---- CAMERA ---- */
    var camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0.5, 5.5);
    camera.lookAt(0, 0, 0);

    /* ---- LIGHTS ---- */
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    var keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    var greenFill = new THREE.PointLight(0x00a651, 3.5, 8);
    greenFill.position.set(-2, 1, 2);
    scene.add(greenFill);

    var rimLight = new THREE.DirectionalLight(0x00d4ff, 0.8);
    rimLight.position.set(-3, 2, -3);
    scene.add(rimLight);

    var backLight = new THREE.PointLight(0x00a651, 1.2, 10);
    backLight.position.set(0, -2, -3);
    scene.add(backLight);

    /* ---- MATERIALS ---- */
    var matBody = new THREE.MeshStandardMaterial({
      color: 0x1c2a38,
      metalness: 0.35,
      roughness: 0.45,
    });
    var matPanel = new THREE.MeshStandardMaterial({
      color: 0x243040,
      metalness: 0.5,
      roughness: 0.3,
    });
    var matGreen = new THREE.MeshStandardMaterial({
      color: 0x00a651,
      metalness: 0.2,
      roughness: 0.5,
      emissive: 0x00a651,
      emissiveIntensity: 0.25,
    });
    var matScreen = new THREE.MeshStandardMaterial({
      color: 0x0a1a10,
      emissive: 0x00e070,
      emissiveIntensity: 0.55,
      metalness: 0.0,
      roughness: 0.1,
    });
    var matButton = new THREE.MeshStandardMaterial({
      color: 0x2a3d50,
      metalness: 0.4,
      roughness: 0.35,
    });
    var matButtonGreen = new THREE.MeshStandardMaterial({
      color: 0x00a651,
      emissive: 0x00a651,
      emissiveIntensity: 0.6,
      metalness: 0.1,
      roughness: 0.4,
    });
    var matHandle = new THREE.MeshStandardMaterial({
      color: 0x263545,
      metalness: 0.6,
      roughness: 0.25,
    });
    var matTube = new THREE.MeshStandardMaterial({
      color: 0xc8d8e0,
      metalness: 0.05,
      roughness: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    var matRail = new THREE.MeshStandardMaterial({
      color: 0x8090a0,
      metalness: 0.7,
      roughness: 0.2,
    });
    var matLogo = new THREE.MeshStandardMaterial({
      color: 0x00a651,
      emissive: 0x00a651,
      emissiveIntensity: 0.5,
    });

    /* ---- PUMP GROUP ---- */
    var pump = new THREE.Group();
    scene.add(pump);

    function addBox(w, h, d, mat, x, y, z, rx, ry, rz, radius) {
      radius = radius || 0;
      var geo;
      if (radius > 0) {
        geo = new THREE.BoxGeometry(w, h, d, 4, 4, 4);
      } else {
        geo = new THREE.BoxGeometry(w, h, d);
      }
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x || 0, y || 0, z || 0);
      mesh.rotation.set(rx || 0, ry || 0, rz || 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      pump.add(mesh);
      return mesh;
    }

    function addCyl(rt, rb, h, mat, x, y, z, rx, ry, rz, seg) {
      seg = seg || 16;
      var geo = new THREE.CylinderGeometry(rt, rb, h, seg);
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x || 0, y || 0, z || 0);
      mesh.rotation.set(rx || 0, ry || 0, rz || 0);
      mesh.castShadow = true;
      pump.add(mesh);
      return mesh;
    }

    /* MAIN BODY */
    addBox(1.4, 3.2, 0.9, matBody, 0, 0, 0);

    /* FRONT PANEL (slightly raised) */
    addBox(1.35, 3.15, 0.05, matPanel, 0, 0, 0.48);

    /* SCREEN */
    addBox(0.9, 1.3, 0.06, matScreen, 0, 0.6, 0.5);

    /* SCREEN FRAME */
    addBox(0.96, 1.36, 0.055, matHandle, 0, 0.6, 0.495);

    /* KNOB (big rotary dial) */
    addCyl(0.28, 0.28, 0.12, matGreen, 0, -0.65, 0.52, 0, 0, 0, 24);
    addCyl(0.2, 0.2, 0.14, matButtonGreen, 0, -0.65, 0.54, 0, 0, 0, 24);

    /* BUTTONS ROW */
    var btnPositions = [[-0.3, -1.1], [0, -1.1], [0.3, -1.1]];
    btnPositions.forEach(function (p) {
      addBox(0.18, 0.18, 0.07, matButton, p[0], p[1], 0.5);
    });
    /* START/STOP big button */
    addBox(0.6, 0.22, 0.08, matButtonGreen, 0, -1.4, 0.5);

    /* SIDE CLAMP MECHANISM (right side) */
    addBox(0.12, 2.4, 0.7, matPanel, 0.78, 0.2, 0);
    addCyl(0.08, 0.08, 0.5, matGreen, 0.78, 0.7, 0, 0, 0, Math.PI / 2, 12);

    /* TUBING GUIDES */
    addCyl(0.05, 0.05, 0.3, matRail, 0.78, 0.2, 0.35, Math.PI / 2, 0, 0, 8);
    addCyl(0.05, 0.05, 0.3, matRail, 0.78, -0.1, 0.35, Math.PI / 2, 0, 0, 8);

    /* IV TUBE (right side) */
    var tubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.78, 1.6, 0),
      new THREE.Vector3(0.9, 1.2, 0.1),
      new THREE.Vector3(0.95, 0.2, 0),
      new THREE.Vector3(0.9, -0.5, -0.1),
      new THREE.Vector3(0.78, -1.6, 0),
    ]);
    var tubeGeo = new THREE.TubeGeometry(tubeCurve, 30, 0.028, 8, false);
    var tubeMesh = new THREE.Mesh(tubeGeo, matTube);
    tubeMesh.castShadow = true;
    pump.add(tubeMesh);

    /* RAIL POLE (IV stand mount) */
    addCyl(0.04, 0.04, 3.4, matRail, -0.65, 0, -0.3, 0, 0, 0, 8);
    addBox(0.08, 0.3, 0.08, matRail, -0.65, 1.5, -0.3);
    addBox(0.08, 0.3, 0.08, matRail, -0.65, -1.5, -0.3);

    /* HANDLE TOP */
    var handleShape = new THREE.Shape();
    handleShape.moveTo(-0.5, 0);
    handleShape.bezierCurveTo(-0.5, 0.4, 0.5, 0.4, 0.5, 0);
    var handleGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.5, 1.65, 0.1),
        new THREE.Vector3(-0.5, 1.85, 0.1),
        new THREE.Vector3(0, 2.05, 0.1),
        new THREE.Vector3(0.5, 1.85, 0.1),
        new THREE.Vector3(0.5, 1.65, 0.1),
      ]),
      20, 0.06, 8, false
    );
    var handleMesh = new THREE.Mesh(handleGeo, matHandle);
    handleMesh.castShadow = true;
    pump.add(handleMesh);

    /* LOGO PLATE */
    addBox(0.55, 0.12, 0.07, matLogo, 0, 1.25, 0.5);

    /* LOGO DOTS (B·Braun style indicator) */
    [-0.18, -0.06, 0.06, 0.18].forEach(function (x) {
      addCyl(0.025, 0.025, 0.08, matButtonGreen, x, 1.25, 0.52, 0, 0, 0, 8);
    });

    /* BOTTOM FOOT */
    addBox(1.5, 0.1, 1.0, matBody, 0, -1.65, 0);
    addBox(1.4, 0.06, 0.9, matGreen, 0, -1.72, 0);

    /* ACCENT STRIPE (green line along edge) */
    addBox(0.04, 3.2, 0.04, matGreen, 0.72, 0, 0.47);
    addBox(0.04, 3.2, 0.04, matGreen, -0.72, 0, 0.47);

    /* CENTER PUMP */
    pump.position.set(0, 0, 0);
    pump.rotation.y = 0.1;

    /* ---- FLOOR / REFLECTION PLANE ---- */
    var floorGeo = new THREE.CircleGeometry(3, 64);
    var floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d1820, metalness: 0.6, roughness: 0.4,
    });
    var floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.75;
    floor.receiveShadow = true;
    scene.add(floor);

    /* GLOW RING under pump */
    var ringGeo = new THREE.RingGeometry(0.4, 0.9, 64);
    var ringMat = new THREE.MeshBasicMaterial({
      color: 0x00a651, transparent: true, opacity: 0.18, side: THREE.DoubleSide,
    });
    var ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.72;
    scene.add(ring);

    /* FLOATING PARTICLES */
    var particleCount = 80;
    var positions = new Float32Array(particleCount * 3);
    for (var i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    var partGeo = new THREE.BufferGeometry();
    partGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var partMat = new THREE.PointsMaterial({
      color: 0x00a651, size: 0.018, transparent: true, opacity: 0.5,
    });
    var particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    /* ---- SCROLL-DRIVEN CAMERA ---- */
    var camData = {
      theta: 0.1,
      phi: 0.18,
      radius: 5.5,
      targetY: 0,
    };

    var keyframes = [
      { theta: 0.1,  phi: 0.18, radius: 5.5,  targetY: 0,    pumpY: 0 },
      { theta: 0.8,  phi: 0.1,  radius: 5.0,  targetY: 0.4,  pumpY: 0.15 },
      { theta: 1.57, phi: 0.05, radius: 4.8,  targetY: 0,    pumpY: 0 },
      { theta: 2.4,  phi: 0.18, radius: 5.2,  targetY: -0.3, pumpY: -0.1 },
      { theta: 3.0,  phi: 0.25, radius: 5.6,  targetY: 0,    pumpY: 0 },
    ];

    var scrollProgress = { value: 0 };

    gsap.to(scrollProgress, {
      value: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "#pump-section",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
      },
      onUpdate: function () {
        var p = scrollProgress.value * (keyframes.length - 1);
        var idx = Math.min(Math.floor(p), keyframes.length - 2);
        var t = p - idx;
        var a = keyframes[idx];
        var b = keyframes[idx + 1];
        function lerp(x, y, f) { return x + (y - x) * f; }
        camData.theta = lerp(a.theta, b.theta, t);
        camData.phi = lerp(a.phi, b.phi, t);
        camData.radius = lerp(a.radius, b.radius, t);
        camData.targetY = lerp(a.targetY, b.targetY, t);
      },
    });

    /* ---- PANEL TEXT REVEAL ---- */
    var panels = document.querySelectorAll(".pump-panel");
    panels.forEach(function (panel, i) {
      gsap.fromTo(panel,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.6,
          scrollTrigger: {
            trigger: "#pump-section",
            start: "top+=" + (i * 20) + "% top",
            end: "top+=" + (i * 20 + 15) + "% top",
            toggleActions: "play reverse play reverse",
            scrub: 0.5,
          },
        }
      );
    });

    /* ---- RENDER LOOP ---- */
    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      /* Camera orbit */
      var cx = camData.radius * Math.sin(camData.theta) * Math.cos(camData.phi);
      var cy = camData.radius * Math.sin(camData.phi) + camData.targetY;
      var cz = camData.radius * Math.cos(camData.theta) * Math.cos(camData.phi);
      camera.position.set(cx, cy + 0.5, cz);
      camera.lookAt(0, camData.targetY, 0);

      /* Subtle pump float */
      pump.position.y = Math.sin(t * 0.6) * 0.06;

      /* Particles drift */
      particles.rotation.y = t * 0.015;
      particles.rotation.x = t * 0.007;

      /* Green light pulse */
      greenFill.intensity = 3.5 + Math.sin(t * 1.2) * 0.5;

      /* Glow ring pulse */
      ring.material.opacity = 0.15 + Math.sin(t * 0.9) * 0.06;

      renderer.render(scene, camera);
    }
    animate();

    /* ---- RESIZE ---- */
    window.addEventListener("resize", function () {
      var nw = canvas.parentElement.clientWidth;
      var nh = canvas.parentElement.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  };

})();
