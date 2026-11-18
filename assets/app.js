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

  /* sticky header state */
  var onScroll = function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* mobile nav */
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

  /* reveal on scroll */
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

  /* mod filters + search */
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

  /* footer year */
  var year = doc.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* 跟随光标的环境光：放在玻璃后面，被模糊成流动的光 */
  if (!reduce) {
    doc.addEventListener("pointermove", function (e) {
      root.style.setProperty("--mx", e.clientX + "px");
      root.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });
  }

  /* 玻璃材质：光标跟手高光 + 卡片轻微倾斜 */
  if (fine && !reduce) {
    var SURF = ".glass, .header-inner, .hero > .wrap, .page-head .wrap, .cta > .wrap," +
               ".item, .works-block, .caps, .about-teaser, .filters, .member, .hiring," +
               ".services, .contact-center, .article-narrow, .doc, .error .wrap, .btn, .chip";
    var active = null;

    var reset = function (el) {
      if (!el) return;
      el.style.setProperty("--px", "140%");
      el.style.setProperty("--py", "-30%");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };

    doc.addEventListener("pointermove", function (e) {
      var el = e.target.closest ? e.target.closest(SURF) : null;
      if (el !== active) {
        reset(active);
        active = el;
      }
      if (!el) return;
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / Math.max(r.width, 1);
      var y = (e.clientY - r.top) / Math.max(r.height, 1);
      el.style.setProperty("--px", (x * 100).toFixed(1) + "%");
      el.style.setProperty("--py", (y * 100).toFixed(1) + "%");
      if (el.classList.contains("item") || el.classList.contains("works-block") ||
          el.classList.contains("member") || el.classList.contains("hiring")) {
        el.style.setProperty("--rx", ((0.5 - y) * 2.2).toFixed(2) + "deg");
        el.style.setProperty("--ry", ((x - 0.5) * 2.2).toFixed(2) + "deg");
      }
    }, { passive: true });

    doc.addEventListener("pointerleave", function () {
      reset(active);
      active = null;
    }, { passive: true });

    /* 视觉验收用：?hoverdemo 把所有玻璃的高光定位到固定点 */
    if (/(\?|&)hoverdemo/.test(window.location.search)) {
      Array.prototype.forEach.call(doc.querySelectorAll(SURF), function (el, i) {
        el.style.setProperty("--px", (56 + (i % 4) * 6) + "%");
        el.style.setProperty("--py", "24%");
      });
    }
  }

  /* 背景随滚动轻微视差 */
  if (!reduce) {
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
  }
})();
