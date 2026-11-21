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
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0 });
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
        var acc = localStorage.getItem("mg-accent");
        if (acc) document.documentElement.setAttribute("data-accent", acc);
        var fs = localStorage.getItem("mg-fs");
        if (fs) document.documentElement.setAttribute("data-fs", fs);
        var dn = localStorage.getItem("mg-density");
        if (dn) document.documentElement.setAttribute("data-density", dn);
        if (localStorage.getItem("mg-motion") === "off") document.documentElement.setAttribute("data-motion", "off");
        if (localStorage.getItem("mg-lang") === "en") {
          var map = { "作品": "Works", "关于": "About", "服务": "Services", "团队": "Team", "联系": "Contact", "更多": "More" };
          document.querySelectorAll(".nav-link, .nav-more-toggle").forEach(function (el) {
            var t = el.textContent.trim();
            if (map[t]) el.textContent = map[t];
          });
        }
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

  /* ---------- 隐藏彩蛋（不对外说明） ---------- */
  (function () {
    if (window.__konami) return;
    window.__konami = true;
    var seq = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    var pos = 0;
    document.addEventListener("keydown", function (e) {
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === seq[pos]) {
        pos++;
        if (pos === seq.length) { pos = 0; snow(); }
      } else {
        pos = k === seq[0] ? 1 : 0;
      }
    });
    function snow() {
      var layer = document.createElement("div");
      layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:80;overflow:hidden";
      document.body.appendChild(layer);
      for (var i = 0; i < 70; i++) {
        var s = document.createElement("span");
        var size = 2 + Math.random() * 4;
        s.style.cssText = "position:absolute;top:-12px;left:" + (Math.random() * 100) + "%;width:" + size + "px;height:" + size +
          "px;border-radius:50%;background:#dff6fb;opacity:" + (0.3 + Math.random() * 0.6) + ";" +
          "animation:mgSnow " + (4 + Math.random() * 5) + "s linear " + (Math.random() * 3) + "s forwards";
        layer.appendChild(s);
      }
      setTimeout(function () { layer.remove(); }, 9000);
    }
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



  /* ---------- 阅读进度 + 回到顶部 ---------- */
  (function () {
    var bar = document.createElement("div");
    bar.id = "mgProgress";
    document.body.appendChild(bar);
    var top = document.createElement("button");
    top.id = "mgTop"; top.type = "button"; top.title = "回到顶部"; top.textContent = "↑";
    document.body.appendChild(top);
    function upd() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? window.scrollY / h : 0;
      bar.style.width = (p * 100).toFixed(2) + "%";
      top.classList.toggle("show", window.scrollY > 600);
    }
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
    top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  })();

  /* ---------- 命令面板（Ctrl+K 或 /） ---------- */
  (function () {
    var box = document.createElement("div");
    box.id = "mgPalette";
    box.innerHTML = '<div class="palette-box"><input class="palette-input" placeholder="搜索模组、页面、小游戏…（Ctrl+K）"><div class="palette-list"></div><div class="palette-hint">↑↓ 选择 · Enter 打开 · Esc 关闭</div></div>';
    document.body.appendChild(box);
    var input = box.querySelector(".palette-input");
    var list = box.querySelector(".palette-list");
    var data = window.__SEARCH || [];
    var idx = 0;
    function render(q) {
      var items = data.filter(function (it) {
        return !q || (it.t + it.d).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 40);
      list.innerHTML = items.map(function (it, i) {
        return '<a class="palette-item' + (i === 0 ? " on" : "") + '" href="' + it.u + '"><b>' + it.t + "</b>" +
          (it.d ? "<span>" + it.d + "</span>" : "") + "</a>";
      }).join("");
      idx = 0;
    }
    function open() { box.classList.add("open"); input.value = ""; render(""); input.focus(); }
    function close() { box.classList.remove("open"); }
    function move(d) {
      var els = list.querySelectorAll(".palette-item");
      if (!els.length) return;
      if (els[idx]) els[idx].classList.remove("on");
      idx = (idx + d + els.length) % els.length;
      els[idx].classList.add("on");
      els[idx].scrollIntoView({ block: "nearest" });
    }
    input.addEventListener("input", function () { render(input.value.trim().toLowerCase()); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") {
        var els = list.querySelectorAll(".palette-item");
        if (els[idx]) location.href = els[idx].getAttribute("href");
      } else if (e.key === "Escape") close();
    });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(); return; }
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      if (e.key === "/" && !/INPUT|TEXTAREA/.test(tag)) { e.preventDefault(); open(); }
    });
  })();

  /* ---------- 代码块复制 ---------- */
  (function () {
    var pres = document.querySelectorAll(".article-body pre");
    Array.prototype.forEach.call(pres, function (p) {
      var b = document.createElement("button");
      b.className = "copy-code"; b.type = "button"; b.textContent = "复制";
      b.addEventListener("click", function () {
        var code = p.querySelector("code");
        var text = code ? code.textContent : p.textContent;
        try {
          navigator.clipboard.writeText(text);
          b.textContent = "已复制";
          setTimeout(function () { b.textContent = "复制"; }, 1200);
        } catch (err) {}
      });
      p.appendChild(b);
    });
  })();

  /* ---------- Toast + 复制邮箱 ---------- */
  (function () {
    var t = document.createElement("div");
    t.id = "mgToast";
    document.body.appendChild(t);
    var timer = 0;
    window.mgToast = function (msg) {
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(timer);
      timer = setTimeout(function () { t.classList.remove("show"); }, 1700);
    };
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href^="mailto:"]') : null;
      if (!a) return;
      var mail = a.getAttribute("href").replace("mailto:", "").split("?")[0];
      try {
        navigator.clipboard.writeText(mail);
        window.mgToast("邮箱已复制：" + mail);
      } catch (err) {}
    });
  })();

  /* ---------- 页脚：时间与停留时长 ---------- */
  (function () {
    var foot = document.querySelector(".footer-bottom");
    if (!foot) return;
    var el = document.createElement("span");
    el.className = "footer-stats";
    el.style.marginLeft = "12px";
    foot.appendChild(el);
    var start = Date.now();
    function tick() {
      var d = new Date();
      var hh = ("0" + d.getHours()).slice(-2);
      var mm = ("0" + d.getMinutes()).slice(-2);
      var mins = Math.floor((Date.now() - start) / 60000);
      el.textContent = hh + ":" + mm + " · 本次已停留 " + mins + " 分钟";
    }
    tick();
    setInterval(tick, 30000);
  })();



  /* ---------- 逐字浮现 / 数字滚动 / 交错 / 视差 / 快捷键 ---------- */
  (function () {
    /* 1. 首屏标题逐字浮现 */
    var title = document.querySelector(".hero-title");
    if (title && !reduce) {
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split("").forEach(function (ch) {
              if (ch === " ") { frag.appendChild(document.createTextNode(" ")); return; }
              var s = document.createElement("span");
              s.className = "ch";
              s.textContent = ch;
              s.style.animationDelay = (frag.childNodes.length * 0.028) + "s";
              frag.appendChild(s);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && child.tagName !== "BR") {
            walk(child);
          }
        });
      };
      walk(title);
    }

    /* 2. 数字滚动 */
    var nums = document.querySelectorAll(".fact-num");
    Array.prototype.forEach.call(nums, function (el) {
      var v = parseInt(el.textContent.trim(), 10);
      if (!v || String(v) !== el.textContent.trim() || reduce) return;
      var start = 0, dur = 900, t0 = 0;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        el.textContent = Math.round(start + (v - start) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    /* 3. 列表交错入场 */
    Array.prototype.forEach.call(document.querySelectorAll(".items, .caps, .feat-grid"), function (box) {
      Array.prototype.forEach.call(box.children, function (child, i) {
        child.style.setProperty("--d", (i * 0.06).toFixed(2) + "s");
      });
    });

    /* 4. 更新日志逐条展开 */
    var rows = document.querySelectorAll(".update-row");
    if (rows.length && "IntersectionObserver" in window) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          Array.prototype.forEach.call(rows, function (r, i) {
            setTimeout(function () { r.classList.add("in"); }, i * 70);
          });
          io2.disconnect();
        });
      }, { threshold: 0.2 });
      io2.observe(rows[0]);
    } else {
      Array.prototype.forEach.call(rows, function (r) { r.classList.add("in"); });
    }

    /* 5. 背景视差 */
    if (!reduce) {
      var raf = 0;
      var para = function () {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          document.documentElement.style.setProperty("--sy", String(window.scrollY));
          raf = 0;
        });
      };
      window.addEventListener("scroll", para, { passive: true });
      para();
    }

    /* 6. 快捷键面板 */
    var panel = document.createElement("div");
    panel.id = "mgShortcuts";
    panel.innerHTML = '<div class="shortcuts-box"><div class="shortcuts-title">键盘快捷键</div>' +
      '<div class="shortcut"><span>打开命令面板 / 搜索</span><b>Ctrl + K</b></div>' +
      '<div class="shortcut"><span>打开搜索</span><b>/</b></div>' +
      '<div class="shortcut"><span>面板内上下选择</span><b>↑ ↓</b></div>' +
      '<div class="shortcut"><span>面板内打开 / 关闭</span><b>Enter / Esc</b></div>' +
      '<div class="shortcut"><span>随机打开一个小游戏</span><b>G</b></div>' +
      '<div class="shortcut"><span>显示本面板</span><b>?</b></div>' +
      '<div class="shortcut"><span>回到顶部</span><b>Home</b></div></div>';
    document.body.appendChild(panel);
    function toggle(open) { panel.classList.toggle("open", open); }
    panel.addEventListener("click", function (e) { if (e.target === panel) toggle(false); });
    var GAMES = ["minesweeper", "g2048", "snake", "tetris", "breakout", "memory", "slidepuzzle", "clicker",
      "gomoku", "tictactoe", "rps", "twentyfour", "sudoku", "klotski", "sokoban", "maze", "typing",
      "rhythm", "reaction", "guessnumber", "guessmod", "guessrecipe", "trivia", "dodger", "voidjump",
      "lianliankan", "match3", "reversi", "checkers", "nonogram", "slitherlink", "mazeseed", "hexmine",
      "g2048x5", "twosnake", "typedefense", "rhythmclick", "simon", "wordle", "idiom", "elements",
      "homophone", "cubetimer", "picpuzzle", "pinball", "whack", "racer", "platformer", "towerdefense", "solitaire"];
    document.addEventListener("keydown", function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || "";
      var typing = /INPUT|TEXTAREA|SELECT/.test(tag);
      if (e.key === "?" && !typing) { e.preventDefault(); toggle(!panel.classList.contains("open")); }
      if (e.key === "Escape") toggle(false);
      if ((e.key === "g" || e.key === "G") && !typing && !e.ctrlKey && !e.metaKey) {
        location.href = "/more/games/" + GAMES[Math.floor(Math.random() * GAMES.length)] + "/";
      }
      if (e.key === "Home") { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }
    });
  })();

})();
