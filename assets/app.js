/* Mornfrost Office — small vanilla behaviours, no frameworks */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var header = doc.getElementById("siteHeader");
  var nav = doc.getElementById("nav");
  var toggle = doc.getElementById("navToggle");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hoverDemo = /(\?|&)hoverdemo/.test(window.location.search);

  /* ---------- sticky header ---------- */
  var onScroll = function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav ---------- */
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- reveal on scroll ---------- */
  var items = doc.querySelectorAll("[data-reveal]");
  var staticMode = /(\?|&)static(=|&|$)/.test(window.location.search);
  if (staticMode) {
    items.forEach(function (el) {
      el.style.transition = "none";
      el.classList.add("is-visible");
    });
  } else if ("IntersectionObserver" in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- mod filters + search ---------- */
  var grid = doc.getElementById("modsGrid");
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".item"));
    var chips = Array.prototype.slice.call(doc.querySelectorAll(".chip"));
    var search = doc.getElementById("modSearch");
    var count = doc.getElementById("results");
    var state = { cat: "all", q: "" };

    var apply = function () {
      var visible = 0;
      cards.forEach(function (card) {
        var okCat = state.cat === "all" || card.getAttribute("data-cat") === state.cat;
        var hay = (card.getAttribute("data-search") || "") + " " + card.textContent.toLowerCase();
        var okQ = !state.q || hay.indexOf(state.q) !== -1;
        var ok = okCat && okQ;
        card.classList.toggle("is-hidden", !ok);
        if (ok) visible++;
      });
      if (count) count.textContent = visible + " 个项目";
    };

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        state.cat = chip.getAttribute("data-filter") || "all";
        apply();
      });
    });

    if (search) {
      search.addEventListener("input", function () {
        state.q = search.value.trim().toLowerCase();
        apply();
      });
    }

    apply();
  }

  /* ---------- footer year ---------- */
  var year = doc.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- 光：全局缓动 + 玻璃面上的跟手镜面高光 ---------- */
  if (reduce) return;

  var SURF = ".glass, .header-inner, .hero > .wrap, .page-head .wrap, .cta > .wrap," +
             ".item, .works-block, .caps, .about-teaser, .filters, .member, .hiring," +
             ".services, .contact-center, .article-narrow, .doc, .error .wrap, .btn";
  var TILT = { ".item": 1, ".works-block": 1, ".member": 1, ".hiring": 1 };

  /* 全局光（html::after 用） */
  var light = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.18 };
  var lightTarget = { x: light.x, y: light.y };

  /* 当前悬停的玻璃面 */
  var surf = { el: null, tx: 0.5, ty: 0.16, cx: 0.5, cy: 0.16, releasing: false, releaseAt: 0 };

  /* 拖尾：三层递减残影 */
  var trail = [
    { x: 0.5, y: 0.16, k: 0.100 },
    { x: 0.5, y: 0.16, k: 0.062 },
    { x: 0.5, y: 0.16, k: 0.038 }
  ];

  var isTilt = function (el) {
    for (var k in TILT) if (el.matches(k)) return true;
    return false;
  };

  doc.addEventListener("pointermove", function (e) {
    lightTarget.x = e.clientX;
    lightTarget.y = e.clientY;
    if (!fine) return;

    var el = e.target.closest ? e.target.closest(SURF) : null;
    if (!el) return;

    if (surf.el !== el) {
      if (surf.el) {
        surf.el.style.removeProperty("--px");
        surf.el.style.removeProperty("--py");
        surf.el.style.removeProperty("--px2");
        surf.el.style.removeProperty("--py2");
        surf.el.style.removeProperty("--px3");
        surf.el.style.removeProperty("--py3");
        surf.el.style.removeProperty("--px4");
        surf.el.style.removeProperty("--py4");
        surf.el.style.removeProperty("--rx");
        surf.el.style.removeProperty("--ry");
      }
      surf.el = el;
      surf.cx = 0.5;
      surf.cy = 0.16;
      trail.forEach(function (p) { p.x = surf.cx; p.y = surf.cy; });
    }
    surf.releasing = false;

    var r = el.getBoundingClientRect();
    surf.tx = Math.min(1, Math.max(0, (e.clientX - r.left) / Math.max(r.width, 1)));
    surf.ty = Math.min(1, Math.max(0, (e.clientY - r.top) / Math.max(r.height, 1)));

    if (isTilt(el)) {
      el.style.setProperty("--rx", ((0.5 - surf.ty) * 1.6).toFixed(2) + "deg");
      el.style.setProperty("--ry", ((surf.tx - 0.5) * 1.6).toFixed(2) + "deg");
    }
  }, { passive: true });

  doc.addEventListener("pointerleave", function () {
    if (!surf.el) return;
    surf.releasing = true;
    surf.releaseAt = performance.now();
  }, { passive: true });

  /* 静态演示：?hoverdemo 把高光固定在玻璃左上区域，便于截图检查 */
  if (hoverDemo) {
    Array.prototype.forEach.call(doc.querySelectorAll(SURF), function (el, i) {
      var bx = 38 + (i % 5) * 6;
      el.style.setProperty("--px", bx + "%");
      el.style.setProperty("--py", "22%");
      el.style.setProperty("--px2", (bx - 7) + "%");
      el.style.setProperty("--py2", "26%");
      el.style.setProperty("--px3", (bx - 13) + "%");
      el.style.setProperty("--py3", "30%");
      el.style.setProperty("--px4", (bx - 18) + "%");
      el.style.setProperty("--py4", "34%");
    });
  }

  var loop = function (now) {
    var t = now / 1000;

    /* 全局光缓动（拖动时有一点黏性） */
    light.x += (lightTarget.x - light.x) * 0.12;
    light.y += (lightTarget.y - light.y) * 0.12;
    root.style.setProperty("--mx", light.x.toFixed(0) + "px");
    root.style.setProperty("--my", light.y.toFixed(0) + "px");

    /* 玻璃面：缓动 + 呼吸式微位移，鼠标停住时光也不会死 */
    if (surf.el) {
      if (surf.releasing) {
        surf.cx += (0.5 - surf.cx) * 0.08;
        surf.cy += (0.02 - surf.cy) * 0.08;
        if (now - surf.releaseAt > 560) {
          surf.el.style.removeProperty("--px");
          surf.el.style.removeProperty("--py");
          surf.el.style.removeProperty("--px2");
          surf.el.style.removeProperty("--py2");
          surf.el.style.removeProperty("--px3");
          surf.el.style.removeProperty("--py3");
          surf.el.style.removeProperty("--px4");
          surf.el.style.removeProperty("--py4");
          surf.el.style.removeProperty("--rx");
          surf.el.style.removeProperty("--ry");
          surf.el = null;
          surf.releasing = false;
        }
      } else {
        surf.cx += (surf.tx - surf.cx) * 0.18;
        surf.cy += (surf.ty - surf.cy) * 0.18;
      }
      if (surf.el) {
        /* 残影逐级追赶核心位置 */
        var lead = { x: surf.cx, y: surf.cy };
        trail.forEach(function (p) {
          p.x += (lead.x - p.x) * p.k;
          p.y += (lead.y - p.y) * p.k;
          lead = { x: p.x, y: p.y };
        });

        var wobX = Math.sin(t * 1.15) * 0.012 + Math.sin(t * 0.47) * 0.007;
        var wobY = Math.cos(t * 0.85) * 0.009 + Math.cos(t * 0.39) * 0.005;
        surf.el.style.setProperty("--px", ((surf.cx + wobX) * 100).toFixed(2) + "%");
        surf.el.style.setProperty("--py", ((surf.cy + wobY) * 100).toFixed(2) + "%");
        surf.el.style.setProperty("--px2", ((trail[0].x + wobX * 0.7) * 100).toFixed(2) + "%");
        surf.el.style.setProperty("--py2", ((trail[0].y + wobY * 0.7) * 100).toFixed(2) + "%");
        surf.el.style.setProperty("--px3", ((trail[1].x + wobX * 0.5) * 100).toFixed(2) + "%");
        surf.el.style.setProperty("--py3", ((trail[1].y + wobY * 0.5) * 100).toFixed(2) + "%");
        surf.el.style.setProperty("--px4", ((trail[2].x + wobX * 0.35) * 100).toFixed(2) + "%");
        surf.el.style.setProperty("--py4", ((trail[2].y + wobY * 0.35) * 100).toFixed(2) + "%");
      }
    }

    window.requestAnimationFrame(loop);
  };
  window.requestAnimationFrame(loop);

  /* ---------- 背景滚动视差 ---------- */
  var raf = 0;
  var onScrollBg = function () {
    if (raf) return;
    raf = window.requestAnimationFrame(function () {
      root.style.setProperty("--sy", String(window.scrollY));
      raf = 0;
    });
  };
  window.addEventListener("scroll", onScrollBg, { passive: true });
  onScrollBg();
})();
