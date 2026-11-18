/* Mornfrost Office — small vanilla behaviours, no frameworks */
(function () {
  "use strict";

  var doc = document;
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

  /* ---------- 场景灯：全场唯一光源，玻璃只负责透光 ---------- */
  if (!reduce && fine) {
    var core = doc.createElement("div");
    core.className = "lamp";
    var tail = doc.createElement("div");
    tail.className = "lamp lamp--tail";
    doc.body.appendChild(tail);
    doc.body.appendChild(core);

    var CORE_W = 560, CORE_H = 400, TAIL_W = 820, TAIL_H = 600;
    var pending = false;
    var lastX = -9999, lastY = -9999;
    var raf = 0;

    var place = function (x, y) {
      core.style.transform = "translate3d(" + (x - CORE_W / 2) + "px," + (y - CORE_H / 2) + "px,0)";
      tail.style.transform = "translate3d(" + (x - TAIL_W / 2) + "px," + (y - TAIL_H / 2) + "px,0)";
    };

    var flush = function () {
      raf = 0;
      if (pending) {
        place(lastX, lastY);
        pending = false;
      }
    };

    doc.addEventListener("pointermove", function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      pending = true;
      if (!raf) raf = window.requestAnimationFrame(flush);
    }, { passive: true });

    if (hoverDemo) {
      core.style.transition = "none";
      tail.style.transition = "none";
      place(window.innerWidth * 0.42, window.innerHeight * 0.34);
    }

    /* 卡片倾斜（纯 transform，代价很小） */
    var TILT = ".item, .works-block, .member, .hiring";
    doc.addEventListener("pointermove", function (e) {
      var el = e.target.closest ? e.target.closest(TILT) : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / Math.max(r.width, 1);
      var py = (e.clientY - r.top) / Math.max(r.height, 1);
      el.style.setProperty("--rx", ((0.5 - py) * 1.2).toFixed(2) + "deg");
      el.style.setProperty("--ry", ((px - 0.5) * 1.2).toFixed(2) + "deg");
    }, { passive: true });

    doc.addEventListener("pointerout", function (e) {
      var el = e.target.closest ? e.target.closest(TILT) : null;
      if (!el) return;
      if (el.contains(e.relatedTarget)) return;
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    }, { passive: true });
  }


  /* ---------- 全局个性化 ---------- */
  (function () {
    var KEY_T = "mg-theme", KEY_F = "mg-festival", KEY_TRAIL = "mg-trail";
    function apply() {
      try {
        if (localStorage.getItem(KEY_T) === "day") document.documentElement.setAttribute("data-theme", "day");
        if (localStorage.getItem(KEY_TRAIL) === "1") startTrail();
      } catch (e) {}
    }
    function startTrail() {
      document.documentElement.classList.add("mg-trail");
      var layer = document.getElementById("mgTrail");
      if (!layer) {
        layer = document.createElement("div");
        layer.id = "mgTrail";
        layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:70";
        document.body.appendChild(layer);
        var last = 0;
        document.addEventListener("pointermove", function (e) {
          if (!document.documentElement.classList.contains("mg-trail")) return;
          var now = Date.now();
          if (now - last < 30) return;
          last = now;
          var d = document.createElement("span");
          d.style.cssText = "position:absolute;left:" + (e.clientX - 2) + "px;top:" + (e.clientY - 2) +
            "px;width:4px;height:4px;border-radius:50%;background:#a9cfdd;opacity:.55;transition:opacity .5s,transform .5s";
          layer.appendChild(d);
          requestAnimationFrame(function () { d.style.opacity = "0"; d.style.transform = "scale(.35)"; });
          setTimeout(function () { d.remove(); }, 540);
        }, { passive: true });
      }
    }
    window.__mgPrefs = { apply: apply, startTrail: startTrail };
    apply();
  })();



  /* ---------- 节日：按系统时间自动 ---------- */
  (function () {
    var data = window.__FESTIVALS || [];
    var m = /(?:\?|&)fest=([a-z]+)/.exec(location.search);
    var key = m ? m[1] : null;
    if (!key) {
      var d = new Date();
      var today = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
      for (var i = 0; i < data.length; i++) {
        if (today >= data[i][0] && today <= data[i][1]) { key = data[i][2]; break; }
      }
    }
    if (key) document.documentElement.setAttribute("data-festival", key);
    window.__festApplied = key;
  })();

  /* ---------- 更多菜单 ---------- */
  (function () {
    var toggle = document.getElementById("moreToggle");
    var panel = document.getElementById("moreMenu");
    if (!toggle || !panel) return;

    function setOpen(open) {
      panel.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
    }
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!panel.classList.contains("is-open"));
    });
    panel.addEventListener("click", function (e) { e.stopPropagation(); });
    document.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () { setOpen(false); });
  })();

})();
