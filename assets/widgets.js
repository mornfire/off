/* Mornfrost 更多 · 工具 / 互动 / 展示 / 个性化 */
(function () {
  "use strict";
  var root = document.getElementById("play");
  if (!root) return;
  var MG = window.MG = window.MG || {};

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function top(label) {
    var bar = el("div", "play-top");
    bar.appendChild(el("div", "play-score", label || ""));
    return bar;
  }
  function btn(text, fn) {
    var b = el("button", "play-btn", text);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  }
  function note(t) { return el("p", "play-note", t); }
  function input(ph, type) {
    var i = el("input", "play-input");
    i.placeholder = ph || "";
    if (type) i.type = type;
    return i;
  }
  function sel(options) {
    var s = document.createElement("select");
    s.className = "play-select";
    options.forEach(function (o) {
      var op = document.createElement("option");
      op.value = o; op.textContent = o;
      s.appendChild(op);
    });
    return s;
  }
  function row() {
    var r = el("div");
    r.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0";
    return r;
  }
  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  var ISSUE = "https://github.com/mornfire/off/issues/new";

  /* ---------- 35 JVM 参数生成器 ---------- */
  MG.jvm = function (host) {
    var bar = top("按内存与人数生成");
    host.appendChild(bar);
    var r1 = row();
    r1.appendChild(el("span", "play-score", "内存"));
    var mem = sel(["2G", "4G", "6G", "8G", "12G", "16G"]);
    mem.value = "4G";
    r1.appendChild(mem);
    r1.appendChild(el("span", "play-score", "人数"));
    var players = sel(["1–5", "6–15", "16–30", "30+"]);
    r1.appendChild(players);
    host.appendChild(r1);

    var out = el("pre", "article-body");
    out.style.cssText = "white-space:pre-wrap;font-family:var(--mono);font-size:12px;line-height:1.9;background:rgba(0,0,0,.32);border:1px solid rgba(255,255,255,.10);border-radius:10px;padding:14px;margin:14px 0;color:#d7f4f0";
    host.appendChild(out);

    function gen() {
      var g = mem.value;
      var gc = players.value === "1–5" ? "G1GC" : "G1GC";
      var heap = g;
      var lines = [
        "-Xms" + g, "-Xmx" + g,
        "-XX:+Use" + gc,
        "-XX:+ParallelRefProcEnabled",
        "-XX:MaxGCPauseMillis=200",
        "-XX:+UnlockExperimentalVMOptions",
        "-XX:+DisableExplicitGC",
        "-XX:+AlwaysPreTouch",
        "-XX:G1NewSizePercent=30",
        "-XX:G1MaxNewSizePercent=40",
        "-XX:G1HeapRegionSize=8M",
        "-XX:G1ReservePercent=20",
        "-XX:G1HeapWastePercent=5",
        "-XX:G1MixedGCCountTarget=4",
        "-XX:InitiatingHeapOccupancyPercent=15",
        "-XX:G1MixedGCLiveThresholdPercent=90",
        "-XX:G1RSetUpdatingPauseTimePercent=5",
        "-XX:SurvivorRatio=32",
        "-XX:+PerfDisableSharedMem",
        "-XX:MaxTenuringThreshold=1"
      ];
      if (players.value === "30+") lines.push("-Dusing.aikars.flags=https://mcflags.emc.gs", "-Daikars.new.flags=true");
      out.textContent = "java " + lines.join(" ") + " -jar server.jar nogui";
    }
    mem.addEventListener("change", gen);
    players.addEventListener("change", gen);
    host.appendChild(note("这些是社区常用的 Aikar 风格参数，按自己机器实测再调。32 位系统或小内存机器不要照抄。"));
    gen();
  };

  /* ---------- 45 服务器状态 ---------- */
  MG.serverstatus = function (host) {
    var bar = top("查询 Java 版服务器");
    host.appendChild(bar);
    var r = row();
    var hostInput = input("play.example.com 或 IP:端口");
    hostInput.style.width = "260px";
    r.appendChild(hostInput);
    var go = btn("查询", query);
    r.appendChild(go);
    host.appendChild(r);
    var out = el("div", "play-score", "");
    out.style.cssText = "font-size:13px;line-height:2;margin-top:10px";
    host.appendChild(out);
    host.appendChild(note("查询走公开接口 api.mcsrvstat.us，不经过本站服务器；被墙或离线时可能查不到。"));

    function query() {
      var h = hostInput.value.trim();
      if (!h) { out.textContent = "填个地址。"; return; }
      out.textContent = "查询中…";
      fetch("https://api.mcsrvstat.us/3/" + encodeURIComponent(h))
        .then(function (r2) { return r2.json(); })
        .then(function (j) {
          if (!j.online) { out.innerHTML = "离线或查不到。"; return; }
          var players = j.players ? (j.players.online + " / " + j.players.max) : "—";
          out.innerHTML = "在线 · 版本 " + ((j.version && j.version.name) || "—") +
            " · 玩家 " + players + " · 延迟 " + (j.debug && j.debug.ping ? j.debug.ping + " ms" : "—") +
            "<br>MOTD：" + ((j.motd && j.motd.clean && j.motd.clean.join(" ")) || "—");
        })
        .catch(function () { out.textContent = "查询失败，可能是网络或接口问题。"; });
    }
  };

  /* ---------- 66 留言板（GitHub Issues 作为后端） ---------- */
  MG.guestbook = function (host) {
    var bar = top("留言走 GitHub Issue");
    host.appendChild(bar);
    var list = el("div");
    list.style.cssText = "display:flex;flex-direction:column;gap:8px;margin:12px 0";
    host.appendChild(list);
    var r = row();
    var name = input("你的名字");
    var msg = input("想说的话");
    msg.style.flex = "1";
    msg.style.minWidth = "220px";
    r.appendChild(name); r.appendChild(msg);
    r.appendChild(btn("去 GitHub 提交", function () {
      var title = "[留言] " + (name.value.trim() || "匿名");
      var body = (msg.value.trim() || "（没写内容）") + "\n\n---\n来自官网留言板";
      window.open(ISSUE + "?title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body), "_blank");
    }));
    host.appendChild(r);
    host.appendChild(note("站点是纯静态的，没有后端。提交会打开 GitHub 的新建 Issue 页面，登录后点提交即可；列表每期从仓库里的 data/guestbook.json 读取。"));
    fetch("/data/guestbook.json").then(function (r2) { return r2.json(); }).then(function (arr) {
      if (!Array.isArray(arr) || !arr.length) { list.innerHTML = '<p class="play-note">还没有留言。</p>'; return; }
      list.innerHTML = arr.slice(0, 30).map(function (g) {
        return '<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.10)">' +
          '<span style="font-family:var(--mono);font-size:10.5px;color:#7fe9e0">' + (g.name || "匿名") + "</span>" +
          (g.date ? '<span style="font-family:var(--mono);font-size:10px;color:var(--dim);margin-left:10px">' + g.date + "</span>" : "") +
          '<p style="margin:6px 0 0;color:var(--muted);font-size:13.5px;line-height:1.9">' + (g.text || "") + "</p></div>";
      }).join("");
    }).catch(function () { list.innerHTML = '<p class="play-note">留言数据还没放上来。</p>'; });
  };

  /* ---------- 67 访客看板 ---------- */
  MG.visitorpanel = function (host) {
    var bar = top("站点访问数据");
    host.appendChild(bar);
    var grid = el("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0";
    grid.innerHTML =
      '<div class="cell" style="width:auto;height:auto;padding:18px;display:block"><div class="play-score">总访问</div>' +
      '<div style="font-family:var(--serif);font-size:26px;margin-top:6px"><span id="bp_site_pv">--</span></div></div>' +
      '<div class="cell" style="width:auto;height:auto;padding:18px;display:block"><div class="play-score">访客</div>' +
      '<div style="font-family:var(--serif);font-size:26px;margin-top:6px"><span id="bp_site_uv">--</span></div></div>' +
      '<div class="cell" style="width:auto;height:auto;padding:18px;display:block"><div class="play-score">本页</div>' +
      '<div style="font-family:var(--serif);font-size:26px;margin-top:6px"><span id="bp_page_pv">--</span></div></div>';
    host.appendChild(grid);
    host.appendChild(note("数据来自 busuanzi。页面加载后几秒内回填；如果一直是 --，说明脚本被拦截或站点还没被统计到。"));
    function sync() {
      var map = {
        bp_site_pv: "busuanzi_value_site_pv",
        bp_site_uv: "busuanzi_value_site_uv",
        bp_page_pv: "busuanzi_value_page_pv"
      };
      Object.keys(map).forEach(function (to) {
        var from = document.getElementById(map[to]);
        var dst = document.getElementById(to);
        if (from && dst) dst.textContent = from.textContent;
      });
    }
    setTimeout(sync, 1500);
    setTimeout(sync, 3500);
  };

  /* ---------- 72 问卷 ---------- */
  MG.survey = function (host) {
    var bar = top("三个问题");
    host.appendChild(bar);
    var qs = [
      ["你最想要哪种模组？", ["内容扩展（武器/装备/成就）", "服务端工具", "剧情与冒险", "不好说"]],
      ["你主要在哪个平台玩？", ["NeoForge 1.21.1", "Fabric", "Forge 1.20.1", "主要玩整合包"]],
      ["你更看重什么？", ["稳定不崩", "内容量大", "轻量不卡", "兼容性好"]]
    ];
    var answers = [];
    qs.forEach(function (q, qi) {
      host.appendChild(el("p", "play-score", (qi + 1) + ". " + q[0]));
      var r = row();
      q[1].forEach(function (opt) {
        var b = btn(opt, function () {
          answers[qi] = opt;
          Array.prototype.forEach.call(r.children, function (c) { c.style.background = ""; });
          b.style.background = "rgba(127,233,224,.25)";
        });
        r.appendChild(b);
      });
      host.appendChild(r);
    });
    var go = btn("提交到 GitHub", function () {
      var body = qs.map(function (q, i) { return q[0] + "\n答：" + (answers[i] || "未选"); }).join("\n\n");
      window.open(ISSUE + "?title=" + encodeURIComponent("[问卷] 想要什么模组") + "&body=" + encodeURIComponent(body + "\n\n---\n来自官网问卷"), "_blank");
    });
    go.style.marginTop = "14px";
    host.appendChild(go);
    host.appendChild(note("提交会打开 GitHub Issue，登录后确认即可。"));
  };

  /* ---------- 73 反馈 ---------- */
  MG.feedback = function (host) {
    var bar = top("报错与建议");
    host.appendChild(bar);
    var r = row();
    var kind = sel(["问题反馈", "功能建议", "内容纠错", "合作"]);
    r.appendChild(kind);
    host.appendChild(r);
    var ta = document.createElement("textarea");
    ta.className = "play-input";
    ta.placeholder = "尽量写清楚：做了什么、期望什么、实际发生了什么；如果是报错，贴上日志最后几十行。";
    ta.style.cssText = "width:100%;min-height:140px;padding:12px;line-height:1.8;resize:vertical";
    host.appendChild(ta);
    var go = btn("去 GitHub 提交", function () {
      window.open(ISSUE + "?title=" + encodeURIComponent("[" + kind.value + "]") + "&body=" + encodeURIComponent(ta.value || "（没写内容）"), "_blank");
    });
    go.style.marginTop = "12px";
    host.appendChild(go);
    host.appendChild(note("站点没有后端，反馈通过 GitHub Issue 提交，公开可查。"));
  };

  /* ---------- 86 动效实验室 ---------- */
  MG.effects = function (host) {
    var bar = top("调参看效果");
    host.appendChild(bar);
    var demo = el("div", "play-card");
    demo.style.cssText = "min-height:160px;margin:12px 0;position:relative;overflow:hidden";
    demo.innerHTML = '<p class="play-score" style="margin:0">这是一块玻璃，参数会实时作用在它身上。</p>';
    host.appendChild(demo);

    function slider(label, min, max, val, step, apply) {
      var r = row();
      r.appendChild(el("span", "play-score", label));
      var i = document.createElement("input");
      i.type = "range"; i.min = min; i.max = max; i.value = val; i.step = step || 1;
      i.style.cssText = "flex:1;min-width:160px";
      r.appendChild(i);
      var v = el("span", "play-score", val);
      r.appendChild(v);
      i.addEventListener("input", function () { v.textContent = i.value; apply(i.value); });
      host.appendChild(r);
      apply(val);
    }
    slider("模糊", 0, 40, 16, 1, function (v) { demo.style.backdropFilter = "blur(" + v + "px) saturate(170%)"; demo.style.webkitBackdropFilter = "blur(" + v + "px) saturate(170%)"; });
    slider("背景亮度", 0, 100, 50, 1, function (v) { demo.style.background = "rgba(255,255,255," + (v / 200) + ")"; });
    slider("圆角", 0, 40, 20, 1, function (v) { demo.style.borderRadius = v + "px"; });

    var r2 = row();
    r2.appendChild(el("span", "play-score", "光斑颜色"));
    var color = document.createElement("input");
    color.type = "color"; color.value = "#a9cfdd";
    color.style.cssText = "width:44px;height:28px;background:none;border:0";
    r2.appendChild(color);
    host.appendChild(r2);
    var lamp = el("div");
    lamp.style.cssText = "position:absolute;right:16px;bottom:8px;width:140px;height:100px;border-radius:50%;pointer-events:none;filter:blur(2px)";
    demo.appendChild(lamp);
    function syncLamp() {
      lamp.style.background = "radial-gradient(closest-side," + color.value + "aa,transparent 70%)";
    }
    color.addEventListener("input", syncLamp);
    syncLamp();
    host.appendChild(note("这些参数只是演示，不会保存到站点。"));
  };

  /* ---------- 93 鼠标轨迹 ---------- */
  MG.trail = function (host) {
    var on = store("mg-trail") === "1";
    var bar = top("拖动鼠标看看");
    host.appendChild(bar);
    var r = row();
    var b = btn(on ? "关闭" : "开启", function () {
      on = !on;
      store("mg-trail", on ? "1" : null);
      b.textContent = on ? "关闭" : "开启";
      if (on) applyTrail(); else document.documentElement.classList.remove("mg-trail");
    });
    r.appendChild(b);
    host.appendChild(r);
    host.appendChild(note("开启后，所有页面都会在鼠标后面拖出细小的霜点。设置保存在浏览器本地。"));
    if (on) applyTrail();
    function applyTrail() {
      if (!document.getElementById("mgTrailStyle")) {
        var s = document.createElement("style");
        s.id = "mgTrailStyle";
        s.textContent = ".mg-trail #mgTrail{display:block}";
        document.head.appendChild(s);
      }
      document.documentElement.classList.add("mg-trail");
      if (!window.__mgTrailInit) {
        window.__mgTrailInit = true;
        var layer = document.createElement("div");
        layer.id = "mgTrail";
        layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:70;display:none";
        document.body.appendChild(layer);
        var last = 0;
        document.addEventListener("pointermove", function (e) {
          if (!document.documentElement.classList.contains("mg-trail")) return;
          var now = Date.now();
          if (now - last < 28) return;
          last = now;
          var d = document.createElement("span");
          d.style.cssText = "position:absolute;left:" + (e.clientX - 2) + "px;top:" + (e.clientY - 2) +
            "px;width:4px;height:4px;border-radius:50%;background:#a9cfdd;opacity:.6;transition:opacity .5s,transform .5s";
          layer.appendChild(d);
          requestAnimationFrame(function () { d.style.opacity = "0"; d.style.transform = "scale(.4)"; });
          setTimeout(function () { d.remove(); }, 520);
        }, { passive: true });
      }
      document.getElementById("mgTrail").style.display = "block";
    }
  };

  /* ---------- 94 随机模组 ---------- */
  MG.randommod = function (host) {
    var MODS = [
      ["achievements", "Mornfrost Achievements"], ["soulglyph", "SoulGlyph 灵铭"],
      ["soulbound", "Soulbound Blades 缚魂之刃"], ["arsenal", "Arsenal"],
      ["echoes", "Echoes of the Unbound"], ["ascension", "Forge of Ascension"],
      ["chinesecanfly", "中国人能飞"], ["ymondf", "Ymondf · 月神"],
      ["memorymaster", "MemoryMaster"], ["banitemblock", "BanItemBlock"],
      ["enchantremover", "Enchantment Remover"], ["perdimrespawn", "Per-Dimension Respawn"],
      ["loginmod", "Login Mod"], ["kipl", "KIPL · Kill Inspector"],
      ["oreguard", "OreGuard"], ["lmlly", "Let Me Look Look You"],
      ["factionzones", "FactionZones"], ["deleteportal", "DeletePortal"],
      ["sqdclib", "SQDCLib"], ["fixsodium", "Fix sodium ShaderLoader"]
    ];
    var bar = top("抽一个");
    host.appendChild(bar);
    var out = el("p", "play-score", "点击下面按钮");
    out.style.cssText = "font-family:var(--serif);font-size:24px;margin:22px 0;text-align:center";
    host.appendChild(out);
    var go = btn("抽一个模组", function () {
      var m = MODS[Math.floor(Math.random() * MODS.length)];
      out.innerHTML = '<a href="/work/mcmod/' + m[0] + '/" style="color:#a8f0ea;border-bottom:1px solid rgba(168,240,234,.4)">' + m[1] + "</a>";
    });
    go.style.display = "block";
    go.style.margin = "0 auto";
    host.appendChild(go);
  };

  /* ---------- 96 昼夜主题 ---------- */
  MG.daynight = function (host) {
    var bar = top("切换配色");
    host.appendChild(bar);
    var r = row();
    r.appendChild(btn("晨（亮）", function () { setTheme("day"); }));
    r.appendChild(btn("夜（默认）", function () { setTheme("night"); }));
    host.appendChild(r);
    host.appendChild(note("选择保存在本地，全站生效。亮色主题目前是实验性的，部分玻璃细节可能不如暗色稳。"));
    function setTheme(v) {
      if (v === "day") document.documentElement.setAttribute("data-theme", "day");
      else document.documentElement.removeAttribute("data-theme");
      store("mg-theme", v === "day" ? "day" : null);
    }
  };

  /* ---------- 100 我该玩什么 ---------- */
  MG.whattoplay = function (host) {
    var bar = top("三个问题");
    host.appendChild(bar);
    var QS = [
      ["你现在有服务器要管吗？", ["有", "没有"]],
      ["你更喜欢哪种玩法？", ["战斗与装备", "探索与剧情", "慢节奏收集"]],
      ["你能接受多大体量？", ["轻量", "中等", "越大越好"]]
    ];
    var ans = [];
    QS.forEach(function (q, i) {
      host.appendChild(el("p", "play-score", (i + 1) + ". " + q[0]));
      var r = row();
      q[1].forEach(function (o) {
        var b = btn(o, function () {
          ans[i] = o;
          Array.prototype.forEach.call(r.children, function (c) { c.style.background = ""; });
          b.style.background = "rgba(127,233,224,.25)";
        });
        r.appendChild(b);
      });
      host.appendChild(r);
    });
    var go = btn("给个建议", function () {
      var mod = "Mornfrost Achievements";
      var slug = "achievements";
      if (ans[0] === "有") { mod = "OreGuard"; slug = "oreguard"; }
      else if (ans[1] === "战斗与装备") { mod = "Arsenal"; slug = "arsenal"; }
      else if (ans[1] === "探索与剧情") { mod = "Ymondf · 月神"; slug = "ymondf"; }
      else if (ans[2] === "轻量") { mod = "中国人能飞"; slug = "chinesecanfly"; }
      var out = el("p", "play-score", "");
      out.style.cssText = "font-family:var(--serif);font-size:22px;margin:18px 0";
      out.innerHTML = '去玩 <a href="/work/mcmod/' + slug + '/" style="color:#a8f0ea">' + mod + "</a>";
      host.appendChild(out);
    });
    go.style.marginTop = "12px";
    host.appendChild(go);
  };

  /* ---------- 分发 ---------- */
  var slug = root.getAttribute("data-widget");
  if (slug && MG[slug]) {
    root.innerHTML = "";
    try { MG[slug](root); }
    catch (e) { root.innerHTML = '<p class="play-hint">这个工具出了点问题：' + e.message + "</p>"; }
  } else if (slug) {
    root.innerHTML = '<p class="play-hint">这个工具还在施工。</p>';
  }
})();
