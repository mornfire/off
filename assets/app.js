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
})();
