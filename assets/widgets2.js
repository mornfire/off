/* Mornfrost 更多 · 第二批工具与个性化 */
(function () {
  "use strict";
  var root = document.getElementById("play");
  if (!root) return;
  var MG = window.MG = window.MG || {};

  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function top(l) { var b = el("div", "play-top"); b.appendChild(el("div", "play-score", l || "")); return b; }
  function btn(t, f) { var b = el("button", "play-btn", t); b.type = "button"; b.addEventListener("click", f); return b; }
  function note(t) { return el("p", "play-note", t); }
  function input(p) { var i = el("input", "play-input"); i.placeholder = p || ""; return i; }
  function row() { var r = el("div"); r.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0"; return r; }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function pre() { var p = document.createElement("pre"); p.className = "article-body"; p.style.cssText = "white-space:pre-wrap;font-family:var(--mono);font-size:12px;line-height:1.85;background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:14px;margin:12px 0;color:#d7f4f0"; return p; }

  var ISSUE = "https://github.com/mornfire/off/issues/new";

  /* ---------- KubeJS 配方生成器 ---------- */
  MG.recipe = function (host) {
    var bar = top("生成 server_scripts 里的配方");
    host.appendChild(bar);
    var r1 = row();
    r1.appendChild(el("span", "play-score", "产物"));
    var outItem = input("mornfrost:glyph"); outItem.style.width = "200px";
    r1.appendChild(outItem);
    r1.appendChild(el("span", "play-score", "数量"));
    var outCount = input("1"); outCount.style.width = "60px";
    r1.appendChild(outCount);
    host.appendChild(r1);
    var r2 = row();
    r2.appendChild(el("span", "play-score", "材料（逗号分隔）"));
    var ins = input("minecraft:diamond, minecraft:gold_ingot");
    ins.style.flex = "1"; ins.style.minWidth = "260px";
    r2.appendChild(ins);
    host.appendChild(r2);
    var out = pre();
    host.appendChild(out);
    function gen() {
      var o = outItem.value.trim() || "minecraft:stone";
      var n = +outCount.value || 1;
      var list = ins.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      if (!list.length) list = ["minecraft:stone"];
      var pattern = "";
      var keyMap = {};
      var ABC = "ABCDEFGHI";
      list.forEach(function (id, i) { keyMap[ABC[i]] = id; });
      var per = Math.ceil(list.length / 3);
      var idx = 0;
      for (var y = 0; y < Math.min(3, per || 1); y++) {
        var line = "";
        for (var x = 0; x < 3; x++) { line += idx < list.length ? ABC[idx] : " "; idx++; }
        pattern += '"' + line + '"\n';
      }
      out.textContent =
        "ServerEvents.recipes(event => {\n" +
        "  event.shaped(\n" +
        "    Item.of('" + o + "', " + n + "),\n" +
        "    [\n      " + pattern.trim().split("\n").join(",\n      ") + "\n    ],\n" +
        "    {\n" +
        Object.keys(keyMap).map(function (k) { return "      " + k + ": '" + keyMap[k] + "'"; }).join(",\n") + "\n" +
        "    }\n  )\n})\n";
    }
    [outItem, outCount, ins].forEach(function (i) { i.addEventListener("input", gen); });
    host.appendChild(btn("生成", gen));
    host.appendChild(note("粘贴到 kubejs/server_scripts/ 下的任意 .js 里，/reload 生效。生成的是有序配方，材料顺序可以再调。"));
    gen();
  };

  /* ---------- 崩溃报告解读器 ---------- */
  MG.crashreader = function (host) {
    var bar = top("粘贴崩溃报告");
    host.appendChild(bar);
    var ta = document.createElement("textarea");
    ta.className = "play-input";
    ta.placeholder = "把 crash-report 里的内容粘进来，或只粘最后 100 行";
    ta.style.cssText = "width:100%;min-height:160px;padding:12px;line-height:1.8;resize:vertical";
    host.appendChild(ta);
    var out = el("div", "play-score", "");
    out.style.cssText = "font-size:13px;line-height:2;margin-top:12px";
    host.appendChild(out);
    host.appendChild(btn("分析", function () {
      var t = ta.value;
      if (!t.trim()) { out.textContent = "先粘点东西。"; return; }
      var res = [];
      var desc = /Description:\s*([^\n]+)/.exec(t);
      if (desc) res.push("问题描述：<b>" + esc(desc[1]) + "</b>");
      var cause = /Caused by:\s*([^\n]+)/.exec(t);
      if (cause) res.push("直接原因：<code>" + esc(cause[1].slice(0, 160)) + "</code>");
      var mods = t.match(/([a-z0-9_]+):\s*\d+\.\d+/g);
      if (mods) res.push("涉及模组：<code>" + esc(mods.slice(0, 6).join("，")) + "</code>");
      var hints = [];
      if (/NoClassDefFoundError|ClassNotFoundException/.test(t)) hints.push("缺类：多半是前置没装或版本不对");
      if (/Mixin apply failed/.test(t)) hints.push("Mixin 冲突：关掉最近装的模组再试");
      if (/OutOfMemoryError/.test(t)) hints.push("内存不足：调大 -Xmx 或排查泄漏");
      if (/Unsupported class file major version/.test(t)) hints.push("Java 版本过低：换 Java 21");
      if (/Duplicate mods/.test(t)) hints.push("重复模组：同一个模组放了多个 jar");
      if (!hints.length) hints.push("先看 Caused by 里第一个自身模组包名，再二分关模组定位");
      res.push("可能原因：<br>· " + hints.join("<br>· "));
      out.innerHTML = res.join("<br><br>");
    }));
    host.appendChild(note("只在本地解析，不上传任何内容。判断是关键词匹配，不能替代人工排查。"));
    function esc(s) { return s.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  };

  /* ---------- 配色生成器 ---------- */
  MG.palette = function (host) {
    var bar = top("从图片提取配色");
    host.appendChild(bar);
    var file = document.createElement("input");
    file.type = "file"; file.accept = "image/*";
    file.style.cssText = "margin:10px 0";
    host.appendChild(file);
    var canvas = document.createElement("canvas");
    canvas.style.cssText = "max-width:100%;margin:10px 0;border-radius:10px;display:none";
    host.appendChild(canvas);
    var out = el("div");
    out.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin:12px 0";
    host.appendChild(out);
    var msg = note("图片只在浏览器里处理，不会上传。");
    host.appendChild(msg);
    file.addEventListener("change", function () {
      var f = file.files[0];
      if (!f) return;
      var img = new Image();
      img.onload = function () {
        var w = Math.min(320, img.width), h = Math.round(img.height * (w / img.width));
        canvas.width = w; canvas.height = h; canvas.style.display = "block";
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        var data = ctx.getImageData(0, 0, w, h).data;
        var buckets = {};
        for (var i = 0; i < data.length; i += 16) {
          var r = data[i], g = data[i + 1], b = data[i + 2];
          if (data[i + 3] < 128) continue;
          var key = [Math.round(r / 32), Math.round(g / 32), Math.round(b / 32)].join(",");
          buckets[key] = buckets[key] || { n: 0, r: 0, g: 0, b: 0 };
          var bk = buckets[key]; bk.n++; bk.r += r; bk.g += g; bk.b += b;
        }
        var list = Object.keys(buckets).map(function (k) {
          var bk = buckets[k];
          return { r: Math.round(bk.r / bk.n), g: Math.round(bk.g / bk.n), b: Math.round(bk.b / bk.n), n: bk.n };
        }).sort(function (a, b) { return b.n - a.n; }).slice(0, 8);
        out.innerHTML = "";
        list.forEach(function (c) {
          var hex = "#" + [c.r, c.g, c.b].map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join("");
          var sw = document.createElement("button");
          sw.type = "button";
          sw.textContent = hex;
          sw.style.cssText = "width:92px;height:56px;border-radius:10px;border:1px solid rgba(255,255,255,.2);cursor:pointer;font-family:var(--mono);font-size:11px;color:" + (c.r + c.g + c.b > 380 ? "#111" : "#fff") + ";background:" + hex;
          sw.addEventListener("click", function () {
            try { navigator.clipboard.writeText(hex); msg.textContent = "已复制 " + hex; } catch (e) {}
          });
          out.appendChild(sw);
        });
        msg.textContent = "点色块复制十六进制。";
      };
      img.src = URL.createObjectURL(f);
    });
  };

  /* ---------- 主题编辑器 ---------- */
  MG.theme = function (host) {
    var bar = top("选一个强调色");
    host.appendChild(bar);
    var r = row();
    [["ice", "冰蓝", "#7fe9e0"], ["green", "青绿", "#9ce89a"], ["amber", "琥珀", "#ffd166"], ["rose", "玫瑰", "#ff9ab5"], ["violet", "紫罗兰", "#c6a8ff"]].forEach(function (o) {
      var b = btn(o[1], function () {
        document.documentElement.setAttribute("data-accent", o[0]);
        store("mg-accent", o[0]);
        r.querySelectorAll("button").forEach(function (x) { x.style.outline = ""; });
        b.style.outline = "2px solid " + o[2];
      });
      b.style.background = o[2];
      b.style.color = "#0b1216";
      r.appendChild(b);
    });
    host.appendChild(r);
    host.appendChild(btn("恢复默认", function () {
      document.documentElement.removeAttribute("data-accent");
      store("mg-accent", null);
    }));
    host.appendChild(note("只改强调色（编号、链接、悬停高亮），不影响背景与文字。选择保存在本地。"));
  };

  /* ---------- 字体与密度 ---------- */
  MG.a11y = function (host) {
    var bar = top("字体大小");
    host.appendChild(bar);
    var r = row();
    [["s", "小"], ["m", "标准"], ["l", "大"]].forEach(function (o) {
      r.appendChild(btn(o[1], function () {
        if (o[0] === "m") document.documentElement.removeAttribute("data-fs");
        else document.documentElement.setAttribute("data-fs", o[0]);
        store("mg-fs", o[0] === "m" ? null : o[0]);
      }));
    });
    host.appendChild(r);
    host.appendChild(note("调的是正文基准字号，标题会按比例跟随。"));
  };

  MG.density = function (host) {
    var bar = top("布局密度");
    host.appendChild(bar);
    var r = row();
    [["normal", "宽松"], ["compact", "紧凑"]].forEach(function (o) {
      r.appendChild(btn(o[1], function () {
        if (o[0] === "normal") document.documentElement.removeAttribute("data-density");
        else document.documentElement.setAttribute("data-density", o[0]);
        store("mg-density", o[0] === "normal" ? null : o[0]);
      }));
    });
    host.appendChild(r);
    host.appendChild(note("紧凑模式会缩小区块间距与卡片内边距，适合大屏快速浏览。"));
  };

  /* ---------- 减少动效 ---------- */
  MG.motion = function (host) {
    var bar = top("动效开关");
    host.appendChild(bar);
    var on = store("mg-motion") === "off";
    var b = btn(on ? "当前：已关闭" : "当前：正常", function () {
      on = !on;
      store("mg-motion", on ? "off" : null);
      if (on) document.documentElement.setAttribute("data-motion", "off");
      else document.documentElement.removeAttribute("data-motion");
      b.textContent = on ? "当前：已关闭" : "当前：正常";
    });
    host.appendChild(b);
    host.appendChild(note("关闭后不再有淡入、光斑与过渡，只保留必要的状态变化。系统层面的「减少动态效果」也会自动生效。"));
  };

  /* ---------- 界面语言（导航级） ---------- */
  MG.lang = function (host) {
    var bar = top("界面语言");
    host.appendChild(bar);
    var r = row();
    [["zh", "中文"], ["en", "English"]].forEach(function (o) {
      r.appendChild(btn(o[1], function () {
        store("mg-lang", o[0] === "zh" ? null : o[0]);
        applyLang(o[0]);
      }));
    });
    host.appendChild(r);
    host.appendChild(note("只切换导航与少量固定文案；文章与页面正文仍是中文。"));
    function applyLang(lang) {
      var map = lang === "en"
        ? { "作品": "Works", "关于": "About", "服务": "Services", "团队": "Team", "联系": "Contact", "更多": "More" }
        : { "作品": "作品", "关于": "关于", "服务": "服务", "团队": "团队", "联系": "联系", "更多": "更多" };
      document.querySelectorAll(".nav-link, .nav-more-toggle").forEach(function (a) {
        var t = a.textContent.trim();
        if (map[t]) a.textContent = map[t];
      });
    }
  };

  /* ---------- 效果开关 ---------- */
  MG.fx = function (host) {
    var bar = top("开或关，随时生效");
    host.appendChild(bar);
    var items = [
      ["mg-fx-fluid", "流体背景", "WebGL 实时噪声，页面背后缓慢流动", true],
      ["mg-fx-particles", "粒子与烟花", "飘落的细尘；点击空白处放一簇", true],
      ["mg-fx-cursor", "自定义光标", "细点 + 跟随的圆环", true],
      ["mg-fx-sound", "音效", "点击时的轻微提示音", false],
      ["mg-fx-transition", "像素转场", "跳转页面时用像素块过渡", true]
    ];
    items.forEach(function (it) {
      var key = it[0];
      var on = store(key) === null ? it[3] : store(key) === "1";
      var r = row();
      var label = el("div", "play-score", it[1] + " — " + it[2]);
      label.style.flex = "1";
      r.appendChild(label);
      var b = btn(on ? "开" : "关", function () {
        on = !on;
        store(key, on ? "1" : "0");
        b.textContent = on ? "开" : "关";
        b.style.background = on ? "rgba(127,233,224,.3)" : "";
        if (window.mgFX) window.mgFX.apply(key.replace("mg-fx-", ""));
      });
      b.style.background = on ? "rgba(127,233,224,.3)" : "";
      r.appendChild(b);
      host.appendChild(r);
    });
    host.appendChild(note("全部存在浏览器本地。流体背景在窄屏默认关闭；系统开启「减少动态效果」时，流动与转场会自动停用。"));
  };

  /* ---------- 分发 ---------- */
  var slug = root.getAttribute("data-widget");
  if (slug && MG[slug]) {
    root.innerHTML = "";
    try { MG[slug](root); }
    catch (e) { root.innerHTML = '<p class="play-hint">这个工具出了点问题：' + e.message + "</p>"; }
  } else if (slug && !MG[slug]) {
    root.innerHTML = '<p class="play-hint">这个工具还在施工。</p>';
  }
})();
