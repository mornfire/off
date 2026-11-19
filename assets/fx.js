/* Mornfrost 视觉效果引擎：流体背景 / 粒子烟花 / 自定义光标 / 音效 / 像素转场 */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var mobile = window.matchMedia("(max-width: 900px)").matches;

  function get(k, dflt) {
    try {
      var v = localStorage.getItem(k);
      return v === null ? dflt : v === "1";
    } catch (e) { return dflt; }
  }

  var S = {
    fluid: get("mg-fx-fluid", !mobile),
    particles: get("mg-fx-particles", true),
    cursor: get("mg-fx-cursor", fine),
    sound: get("mg-fx-sound", false),
    transition: get("mg-fx-transition", true)
  };

  var state = { fluid: null, particles: null, cursor: null, audio: null };

  /* ---------------- WebGL 流体背景 ---------------- */
  function initFluid() {
    if (state.fluid || reduce || S.fluid === false) return;
    var cv = document.createElement("canvas");
    cv.id = "mgFluid";
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:.55;mix-blend-mode:screen";
    document.body.appendChild(cv);
    var gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) { cv.remove(); return; }

    var vsrc = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    var fsrc = [
      "precision highp float;",
      "uniform vec2 r;uniform float t;uniform vec2 m;",
      "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
      "float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);",
      "float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));",
      "return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}",
      "float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}",
      "void main(){",
      "vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*3.0;q.x*=r.x/r.y;",
      "float tt=t*0.055;",
      "vec2 warp=vec2(fbm(q+vec2(tt,0.)),fbm(q+vec2(0.,-tt)));",
      "float f=fbm(q+warp*1.5+vec2(m.x,m.y));",
      "vec3 col=vec3(0.05,0.08,0.10);",
      "col+=vec3(0.10,0.55,0.50)*pow(f,1.7)*0.50;",
      "col+=vec3(0.28,0.22,0.62)*pow(fbm(q*1.3+vec2(-tt*0.7,tt*0.4)),2.0)*0.45;",
      "col+=vec3(0.50,0.38,0.16)*pow(fbm(q*0.8+vec2(tt*0.5,tt*0.3)),2.3)*0.30;",
      "float vig=smoothstep(1.25,0.35,length(uv-0.5));",
      "gl_FragColor=vec4(col*vig,1.0);}"
    ].join("\n");

    function sh(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, vsrc), fs = sh(gl.FRAGMENT_SHADER, fsrc);
    if (!vs || !fs) { cv.remove(); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { cv.remove(); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(prog, "r");
    var uT = gl.getUniformLocation(prog, "t");
    var uM = gl.getUniformLocation(prog, "m");

    var mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    document.addEventListener("pointermove", function (e) {
      tmx = e.clientX / window.innerWidth;
      tmy = 1 - e.clientY / window.innerHeight;
    }, { passive: true });

    function resize() {
      var scale = mobile ? 0.35 : 0.5;
      cv.width = Math.max(2, Math.floor(window.innerWidth * scale));
      cv.height = Math.max(2, Math.floor(window.innerHeight * scale));
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(uR, cv.width, cv.height);
    }
    resize();
    window.addEventListener("resize", resize);

    var t0 = performance.now(), raf = 0, paused = false;
    function loop(now) {
      if (paused) return;
      mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
      gl.uniform1f(uT, (now - t0) / 1000);
      gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!raf) raf = requestAnimationFrame(loop); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    document.addEventListener("visibilitychange", function () {
      paused = document.hidden;
      if (paused) stop(); else start();
    });
    start();
    state.fluid = { canvas: cv, stop: stop, start: start };
  }

  function killFluid() {
    if (!state.fluid) return;
    state.fluid.stop();
    state.fluid.canvas.remove();
    state.fluid = null;
  }

  /* ---------------- 粒子 + 烟花 ---------------- */
  function initParticles() {
    if (state.particles || reduce || S.particles === false) return;
    var cv = document.createElement("canvas");
    cv.id = "mgParticles";
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:3;pointer-events:none";
    document.body.appendChild(cv);
    var ctx = cv.getContext("2d");
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      cv.width = Math.floor(window.innerWidth * dpr);
      cv.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var dust = [], bursts = [], raf = 0;
    for (var i = 0; i < 26; i++) {
      dust.push({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, s: 0.5 + Math.random() * 1.6, v: 0.08 + Math.random() * 0.25 });
    }
    function burst(x, y) {
      for (var i = 0; i < 26; i++) {
        var a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3.4;
        bursts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, w: 1 + Math.random() * 1.8 });
      }
    }
    document.addEventListener("click", function (e) {
      if (e.target.closest("a,button,input,textarea,select")) return;
      burst(e.clientX, e.clientY);
    });
    function loop() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = "rgba(200,235,245,.35)";
      dust.forEach(function (p) {
        p.y -= p.v;
        if (p.y < -4) { p.y = window.innerHeight + 4; p.x = Math.random() * window.innerWidth; }
        ctx.fillRect(p.x, p.y, p.s, p.s);
      });
      bursts = bursts.filter(function (p) {
        p.vy += 0.045; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.life -= 0.014;
        if (p.life <= 0) return false;
        ctx.fillStyle = "rgba(168,240,234," + (p.life * 0.85).toFixed(3) + ")";
        ctx.fillRect(p.x, p.y, p.w, p.w);
        return true;
      });
      raf = requestAnimationFrame(loop);
    }
    loop();
    state.particles = {
      canvas: cv,
      stop: function () { cancelAnimationFrame(raf); raf = 0; },
      start: function () { if (!raf) loop(); }
    };
  }

  function killParticles() {
    if (!state.particles) return;
    state.particles.stop();
    state.particles.canvas.remove();
    state.particles = null;
  }

  /* ---------------- 自定义光标 ---------------- */
  function initCursor() {
    if (state.cursor || reduce || !fine) return;
    var dot = document.createElement("div");
    dot.id = "mgCursorDot";
    var ring = document.createElement("div");
    ring.id = "mgCursorRing";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    root.classList.add("mg-cursor");
    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var rx = x, ry = y, tx = x, ty = y;
    document.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = "translate3d(" + (tx - 3) + "px," + (ty - 3) + "px,0)";
      var over = e.target.closest && e.target.closest("a,button,input,textarea,select,.item,.works-block");
      ring.classList.toggle("hot", !!over);
    }, { passive: true });
    var raf = 0;
    function loop() {
      rx += (tx - rx) * 0.2; ry += (ty - ry) * 0.2;
      ring.style.transform = "translate3d(" + (rx - 15) + "px," + (ry - 15) + "px,0)";
      raf = requestAnimationFrame(loop);
    }
    loop();
    state.cursor = {
      stop: function () {
        cancelAnimationFrame(raf);
        dot.remove(); ring.remove();
        root.classList.remove("mg-cursor");
      }
    };
  }

  function killCursor() {
    if (!state.cursor) return;
    state.cursor.stop();
    state.cursor = null;
  }

  /* ---------------- 音效 ---------------- */
  function audioCtx() {
    if (!state.audio) {
      try { state.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    return state.audio;
  }
  function blip(freq, dur, type, gain) {
    var ac = audioCtx();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = type || "triangle";
    o.frequency.value = freq;
    g.gain.value = gain || 0.05;
    o.connect(g); g.connect(ac.destination);
    var now = ac.currentTime;
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + (dur || 0.08));
    o.start(now); o.stop(now + (dur || 0.08) + 0.02);
  }
  function bindSound() {
    if (!S.sound) return;
    document.addEventListener("pointerdown", function (e) {
      var el = e.target.closest && e.target.closest("a,button,.chip,.item");
      if (el) blip(620 + Math.random() * 120, 0.06, "triangle", 0.035);
    }, { passive: true });
  }

  /* ---------------- 像素转场 ---------------- */
  function initTransition() {
    if (reduce || S.transition === false) return;
    var overlay = document.createElement("div");
    overlay.id = "mgPixels";
    document.body.appendChild(overlay);
    var COLS = 12, ROWS = 8;
    for (var i = 0; i < COLS * ROWS; i++) {
      var b = document.createElement("i");
      b.style.transitionDelay = ((i % COLS) * 9 + Math.floor(i / COLS) * 6) + "ms";
      overlay.appendChild(b);
    }
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || a.target === "_blank" || a.hasAttribute("download")) return;
      if (/^(mailto:|tel:|javascript:)/.test(href)) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.origin && a.origin !== location.origin) return;
      if (href.indexOf(location.pathname) === 0 && href.indexOf("#") > 0) return;
      e.preventDefault();
      overlay.classList.add("on");
      setTimeout(function () { location.href = href; }, 340);
    });
  }

  /* ---------------- 设置应用 ---------------- */
  function apply(force) {
    if (force === "fluid") { S.fluid = get("mg-fx-fluid", !mobile); S.fluid ? initFluid() : killFluid(); }
    if (force === "particles") { S.particles = get("mg-fx-particles", true); S.particles ? initParticles() : killParticles(); }
    if (force === "cursor") { S.cursor = get("mg-fx-cursor", fine); S.cursor && fine ? initCursor() : killCursor(); }
    if (force === "sound") { S.sound = get("mg-fx-sound", false); if (S.sound) blip(880, 0.07, "sine", 0.04); }
  }
  window.mgFX = { apply: apply, state: S };

  if (S.fluid) initFluid();
  if (S.particles) initParticles();
  if (S.cursor && fine) initCursor();
  if (S.sound) bindSound();
  initTransition();
})();
