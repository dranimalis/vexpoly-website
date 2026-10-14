/* =========================================================================
   VEXPOLY — shared site script
   Works on any page. Features auto-enable based on what's in the DOM.
   ========================================================================= */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================ nav ==== */

  const menuBtn = document.getElementById('menuBtn');
  const siteNav = document.getElementById('siteNav');

  if (menuBtn && siteNav) {
    menuBtn.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    siteNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        document.body.classList.remove('nav-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

/* ================================================= platform detect == */

(function detectPlatform() {
  const ua = navigator.userAgent || '';

  const platform =
    /Mac|iPhone|iPad|iPod/i.test(ua) ? 'macos'   :
    /Win/i.test(ua)                  ? 'windows' :
    /Linux|X11|CrOS/i.test(ua)       ? 'linux'   :
    null;

  if (!platform) return;

  const card = document.querySelector(`.dl-card[data-os="${platform}"]:not(.is-soon)`);
  if (!card) return;

  card.classList.add('is-match');

  // macOS: Intel or Apple Silicon?
  // WebKit's userAgent says "Intel" even on Apple Silicon under Rosetta,
  // so fall back to the WebGL renderer string, which reports "Apple M…".
  if (platform === 'macos') {
    const isARM =
      /ARM|Apple/i.test(navigator.platform || '') ||
      /Apple M\d/i.test(ua) ||
      (() => {
        try {
          const gl = document.createElement('canvas').getContext('webgl');
          const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
          if (!ext) return false;
          const r = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '';
          return /Apple M\d/i.test(r);
        } catch (_) { return false; }
      })();

    card.classList.add(isARM ? 'is-apple-silicon' : 'is-intel');
  }
})();

  /* ======================================================== copy ====== */

  document.querySelectorAll('.copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const scope = btn.closest('.install') || document;
      const codeEl = scope.querySelector('code');
      const text = codeEl ? codeEl.innerText.replace(/\u00a0/g, ' ').trim() : '';
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
      } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (__) {}
        document.body.removeChild(ta);
      }

      const label = btn.querySelector('.copy-text') || btn;
      const original = label.textContent;
      label.textContent = 'copied';
      btn.classList.add('done');
      setTimeout(() => {
        label.textContent = original;
        btn.classList.remove('done');
      }, 1500);
    });
  });

  /* ================================================== scroll reveal === */

  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* ================================================ stat counters === */

  const statEls = document.querySelectorAll('.stat-value');
  if (statEls.length && 'IntersectionObserver' in window) {
    const counter = (el) => {
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      const fmt = (n) => n.toLocaleString('en-US');
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(Math.round(target * eased)) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const statsIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          counter(entry.target);
          statsIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    statEls.forEach((el) => statsIO.observe(el));
  }

  /* ============================================ docs scroll spy ===== */

  const docsNavLinks = document.querySelectorAll('.docs-nav a[href^="#"]');
  if (docsNavLinks.length && 'IntersectionObserver' in window) {
    const targets = [...docsNavLinks]
      .map(a => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);

    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          docsNavLinks.forEach(a => {
            const match = a.getAttribute('href') === '#' + entry.target.id;
            a.classList.toggle('active', match);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    targets.forEach(t => spy.observe(t));
  }

  /* ========================================================= year === */

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ==================================================== 3D scene ===== */

  const canvas = document.getElementById('scene');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d');
  const W = 900, H = 580;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  ctx.scale(DPR, DPR);

  const sub   = (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const dot   = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  const norm  = (a) => { const l = Math.hypot(a[0],a[1],a[2]) || 1; return [a[0]/l, a[1]/l, a[2]/l]; };
  const rotX  = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0], v[1]*c - v[2]*s, v[1]*s + v[2]*c]; };
  const rotY  = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0]*c + v[2]*s, v[1], -v[0]*s + v[2]*c]; };

  const cubeVerts = [
    [-1,-1,-1], [ 1,-1,-1], [ 1, 1,-1], [-1, 1,-1],
    [-1,-1, 1], [ 1,-1, 1], [ 1, 1, 1], [-1, 1, 1]
  ];
  const cubeFaces = [
    [4,5,6,7], [1,0,3,2], [5,1,2,6], [0,4,7,3], [7,6,2,3], [0,1,5,4]
  ];
  const octaVerts = [
    [0, 1.1, 0], [ 1.1, 0, 0], [0, 0, 1.1], [-1.1, 0, 0], [0, 0,-1.1], [0,-1.1, 0]
  ];
  const octaFaces = [
    [0,2,1], [0,3,2], [0,4,3], [0,1,4],
    [5,1,2], [5,2,3], [5,3,4], [5,4,1]
  ];
  const pyrVerts = [
    [-1,-1,-1], [ 1,-1,-1], [ 1,-1, 1], [-1,-1, 1], [0, 1.15, 0]
  ];
  const pyrFaces = [
    [0,1,2,3], [0,4,1], [1,4,2], [2,4,3], [3,4,0]
  ];

  const OBJECTS = [
    { verts: cubeVerts, faces: cubeFaces, pos: [-2.4, -0.05, 0], scale: 0.72, spin: { x: 0.20, y: 0.34 }, phase: 0.0 },
    { verts: octaVerts, faces: octaFaces, pos: [ 0.0,  0.15, 0], scale: 0.92, spin: { x: 0.12, y: -0.42 }, phase: 0.7 },
    { verts: pyrVerts,  faces: pyrFaces,  pos: [ 2.4, -0.15, 0], scale: 0.80, spin: { x: 0.24, y: 0.28 }, phase: 1.3 }
  ];

  const cam = {
    yaw: 0.35, pitch: 0.22, distance: 8.6,
    target: [0, -0.15, 0], fov: 640,
    autorotate: false, wireframe: false
  };

  const THEMES = {
    industrial: '#7DD3FC',
    void:       '#C4B5FD',
    crimson:    '#FB7185',
    arctic:     '#BAE6FD',
    toxic:      '#A3E635'
  };
  let accent = THEMES.industrial;

  const camPos = () => {
    const cp = Math.cos(cam.pitch);
    return [
      cam.target[0] + cam.distance * cp * Math.sin(cam.yaw),
      cam.target[1] + cam.distance * Math.sin(cam.pitch),
      cam.target[2] + cam.distance * cp * Math.cos(cam.yaw)
    ];
  };

  const buildView = () => {
    const eye = camPos();
    const up = [0, 1, 0];

    let zx = eye[0] - cam.target[0];
    let zy = eye[1] - cam.target[1];
    let zz = eye[2] - cam.target[2];
    const zl = Math.hypot(zx, zy, zz) || 1;
    zx /= zl; zy /= zl; zz /= zl;

    let xx = up[1]*zz - up[2]*zy;
    let xy = up[2]*zx - up[0]*zz;
    let xz = up[0]*zy - up[1]*zx;
    const xl = Math.hypot(xx, xy, xz) || 1;
    xx /= xl; xy /= xl; xz /= xl;

    const yx = zy*xz - zz*xy;
    const yy = zz*xx - zx*xz;
    const yz = zx*xy - zy*xx;

    return { eye, xx, xy, xz, yx, yy, yz, zx, zy, zz };
  };

  const toCam = (v, view) => {
    const dx = v[0] - view.eye[0];
    const dy = v[1] - view.eye[1];
    const dz = v[2] - view.eye[2];
    return [
       dx*view.xx + dy*view.xy + dz*view.xz,
       dx*view.yx + dy*view.yy + dz*view.yz,
      -(dx*view.zx + dy*view.zy + dz*view.zz)
    ];
  };

  const project = (c) => {
    if (c[2] <= 0.15) return null;
    const f = cam.fov / c[2];
    return { x: W/2 + c[0] * f, y: H/2 - c[1] * f, z: c[2] };
  };

  const LIGHT = norm([0.45, 0.85, -0.35]);

  let time = 0;
  let dragging = false;
  let lastX = 0, lastY = 0;
  let vx = 0, vy = 0;
  let visible = true;
  let needsReset = false;

  const fpsEl   = document.getElementById('demoFps');
  const drawnEl = document.getElementById('demoDrawn');
  let lastT = performance.now();
  let fpsAcc = 0, frames = 0;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(canvas);
  }

  const ctlAuto  = document.getElementById('ctlAutorotate');
  const ctlWire  = document.getElementById('ctlWire');
  const ctlReset = document.getElementById('ctlReset');

  const syncCtl = (btn, on) => btn && btn.setAttribute('aria-pressed', String(on));
  syncCtl(ctlAuto, cam.autorotate);
  syncCtl(ctlWire, cam.wireframe);

  ctlAuto?.addEventListener('click', () => {
    cam.autorotate = !cam.autorotate;
    syncCtl(ctlAuto, cam.autorotate);
  });
  ctlWire?.addEventListener('click', () => {
    cam.wireframe = !cam.wireframe;
    syncCtl(ctlWire, cam.wireframe);
  });
  ctlReset?.addEventListener('click', () => {
    cam.yaw = 0.35; cam.pitch = 0.22; cam.distance = 8.6;
    vx = 0; vy = 0; needsReset = true;
  });

  document.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const name = btn.dataset.theme;
      accent = THEMES[name] || THEMES.industrial;
    });
  });

  const onDown = (e) => {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    cam.yaw   -= dx * 0.005;
    cam.pitch += dy * 0.005;
    cam.pitch = Math.max(-0.1, Math.min(1.1, cam.pitch));
    vx = -dx * 0.0004;
    vy =  dy * 0.0004;
  };
  const onUp = () => { dragging = false; };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onUp);

  const strokeLine = (a, b) => {
    const pa = project(a);
    const pb = project(b);
    if (!pa || !pb) return;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  };

  const drawGrid = (view) => {
    const y = -1.55;
    const range = 7;
    ctx.lineWidth = 1;
    ctx.strokeStyle = accent;
    ctx.globalAlpha = 0.08;
    for (let i = -range; i <= range; i++) {
      strokeLine(toCam([i, y, -range], view), toCam([i, y, range], view));
      strokeLine(toCam([-range, y, i], view), toCam([range, y, i], view));
    }
    ctx.globalAlpha = 1;
  };

  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible) { lastT = now; return; }

    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    time += dt;

    if (!dragging && cam.autorotate && !needsReset) cam.yaw += 0.14 * dt;
    needsReset = false;

    if (!dragging) {
      cam.yaw   += vx;
      cam.pitch += vy;
      vx *= 0.94; vy *= 0.94;
      cam.pitch = Math.max(-0.1, Math.min(1.1, cam.pitch));
    }

    fpsAcc += 1 / Math.max(dt, 0.0001);
    frames++;
    if (frames >= 20) {
      if (fpsEl) fpsEl.textContent = (fpsAcc / frames).toFixed(0) + ' fps';
      fpsAcc = 0; frames = 0;
    }

    const view = buildView();

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#07070A';
    ctx.fillRect(0, 0, W, H);
    drawGrid(view);

    const draws = [];

    for (const obj of OBJECTS) {
      const rx = time * obj.spin.x + obj.phase;
      const ry = time * obj.spin.y + obj.phase;

      const worldVerts = obj.verts.map(v => {
        let p = [v[0]*obj.scale, v[1]*obj.scale, v[2]*obj.scale];
        p = rotX(p, rx);
        p = rotY(p, ry);
        p = [p[0] + obj.pos[0], p[1] + obj.pos[1], p[2] + obj.pos[2]];
        p[1] += Math.sin(time * 1.2 + obj.phase) * 0.08;
        return p;
      });

      const camVerts  = worldVerts.map(v => toCam(v, view));
      const projVerts = camVerts.map(project);

      for (const face of obj.faces) {
        const a = worldVerts[face[0]], b = worldVerts[face[1]], c = worldVerts[face[2]];
        const n = norm(cross(sub(b, a), sub(c, a)));
        const center = [
          (a[0]+b[0]+c[0]) / 3,
          (a[1]+b[1]+c[1]) / 3,
          (a[2]+b[2]+c[2]) / 3
        ];
        const toCamVec = norm(sub(view.eye, center));
        if (dot(n, toCamVec) <= 0.02) continue;

        let ok = true;
        const pts = [];
        let zSum = 0;
        for (const idx of face) {
          const p = projVerts[idx];
          if (!p) { ok = false; break; }
          pts.push(p);
          zSum += p.z;
        }
        if (!ok) continue;

        const avgZ = zSum / face.length;
        const ndl  = Math.max(0, dot(n, LIGHT));
        const lit  = 0.22 + 0.78 * ndl;
        const fog  = Math.min(1, Math.max(0, (avgZ - 4) / 9));
        const alpha = (1 - fog) * (0.35 + 0.55 * lit);

        draws.push({ pts, avgZ, lit, alpha });
      }
    }

    draws.sort((a, b) => b.avgZ - a.avgZ);

    ctx.lineJoin = 'round';
    for (const d of draws) {
      ctx.beginPath();
      ctx.moveTo(d.pts[0].x, d.pts[0].y);
      for (let i = 1; i < d.pts.length; i++) ctx.lineTo(d.pts[i].x, d.pts[i].y);
      ctx.closePath();

      if (!cam.wireframe) {
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = accent;
        ctx.fill();
      }

      ctx.globalAlpha = Math.min(1, 0.35 + d.lit * 0.65);
      ctx.strokeStyle = accent;
      ctx.lineWidth = cam.wireframe ? 1.6 : 1.1;
      ctx.stroke();

      if (!cam.wireframe) {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = accent;
        for (const p of d.pts) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    if (drawnEl) drawnEl.textContent = draws.length + ' faces drawn';
  };

  requestAnimationFrame(frame);
})();