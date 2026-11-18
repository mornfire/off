/* Mornfrost 更多 · 小游戏（第三批：26–50） */
(function () {
  "use strict";
  var MG = window.MG = window.MG || {};
  var H = MG._;
  var root = document.getElementById("play");
  if (!root) return;

  function mkCanvas(w, h) {
    var c = document.createElement("canvas");
    c.className = "game-canvas";
    c.width = w; c.height = h;
    return c;
  }
  function keys(map) {
    document.addEventListener("keydown", function (e) {
      var f = map[e.key];
      if (f) { e.preventDefault(); f(); }
    });
  }

  /* ---------- 26 连连看 ---------- */
  MG.lianliankan = function (host) {
    var ICONS = ["◆", "✦", "✧", "❋", "✺", "❂", "✹", "❖"];
    var cells, first, left, moves;
    var bar = H.top("");
    var reset = H.button("重开", init); bar.appendChild(reset);
    host.appendChild(bar);
    var grid = H.el("div", "board"); grid.style.gridTemplateColumns = "repeat(8, 48px)";
    host.appendChild(grid);
    host.appendChild(H.note("点两个相同图标，若同行/同列之间无遮挡即可消除。"));

    function init() {
      var vals = H.shuffle(ICONS.concat(ICONS));
      cells = []; first = null; left = 16; moves = 0;
      grid.innerHTML = ""; bar.querySelector(".play-score").textContent = "剩余 16 对";
      vals.forEach(function (v) {
        var c = H.el("button", "cell", v);
        c.type = "button";
        c.style.width = c.style.height = "48px"; c.style.fontSize = "17px";
        c.dataset.v = v;
        c.addEventListener("click", function () { pick(c); });
        grid.appendChild(c); cells.push(c);
      });
    }
    function pick(c) {
      if (c.classList.contains("on")) return;
      if (!first) { first = c; c.style.background = "rgba(127,233,224,.3)"; return; }
      if (first === c) { first.style.background = ""; first = null; return; }
      if (first.dataset.v !== c.dataset.v) {
        first.style.background = ""; first = c; c.style.background = "rgba(127,233,224,.3)"; return;
      }
      if (clear(first, c)) {
        first.classList.add("on"); c.classList.add("on");
        first.textContent = ""; c.textContent = "";
        left--; moves++;
        bar.querySelector(".play-score").textContent = left ? "剩余 " + left + " 对" : "清完了 · " + moves + " 步";
      }
      first.style.background = ""; first = null;
    }
    function pos(c) { return cells.indexOf(c); }
    function clear(a, b) {
      var ia = pos(a), ib = pos(b);
      var ax = ia % 8, ay = Math.floor(ia / 8), bx = ib % 8, by = Math.floor(ib / 8);
      if (ax === bx) {
        var y1 = Math.min(ay, by) + 1, y2 = Math.max(ay, by);
        for (var y = y1; y < y2; y++) if (!cells[y * 8 + ax].classList.contains("on") && cells[y * 8 + ax].textContent) return false;
        return true;
      }
      if (ay === by) {
        var x1 = Math.min(ax, bx) + 1, x2 = Math.max(ax, bx);
        for (var x = x1; x < x2; x++) if (!cells[ay * 8 + x].classList.contains("on") && cells[ay * 8 + x].textContent) return false;
        return true;
      }
      return false;
    }
    init();
  };

  /* ---------- 27 三消 ---------- */
  MG.match3 = function (host) {
    var N = 6, ICONS = ["◆", "✦", "✧", "❋", "✺", "❂"];
    var g, sel, score, cells;
    var bar = H.top("得分 0"); bar.appendChild(H.button("重开", init));
    host.appendChild(bar);
    var grid = H.el("div", "board"); grid.style.gridTemplateColumns = "repeat(6, 50px)";
    host.appendChild(grid);
    host.appendChild(H.note("点两个相邻方块交换，凑成三个连成线就消除。"));

    function init() {
      g = []; sel = null; score = 0; cells = [];
      grid.innerHTML = ""; bar.querySelector(".play-score").textContent = "得分 0";
      for (var i = 0; i < N * N; i++) g.push(ICONS[Math.floor(Math.random() * ICONS.length)]);
      for (var k = 0; k < N * N; k++) {
        var c = H.el("button", "cell", g[k]);
        c.type = "button"; c.style.width = c.style.height = "50px"; c.style.fontSize = "18px";
        c.dataset.i = k;
        c.addEventListener("click", function (e) { tap(+e.currentTarget.dataset.i); });
        grid.appendChild(c); cells.push(c);
      }
    }
    function tap(i) {
      if (sel === null) { sel = i; cells[i].classList.add("on"); return; }
      if (sel === i) { cells[i].classList.remove("on"); sel = null; return; }
      var a = sel, b = i;
      cells[a].classList.remove("on");
      var ax = a % N, ay = Math.floor(a / N), bx = b % N, by = Math.floor(b / N);
      var adj = Math.abs(ax - bx) + Math.abs(ay - by) === 1;
      sel = null;
      if (!adj) return;
      var t = g[a]; g[a] = g[b]; g[b] = t;
      draw();
      if (resolve()) { draw(); }
    }
    function draw() {
      for (var i = 0; i < N * N; i++) { cells[i].textContent = g[i]; }
    }
    function resolve() {
      var removed = 0;
      for (var y = 0; y < N; y++) for (var x = 0; x < N - 2; x++) {
        var i = y * N + x;
        if (g[i] && g[i] === g[i + 1] && g[i] === g[i + 2]) {
          g[i] = g[i + 1] = g[i + 2] = "";
          removed += 3;
        }
      }
      for (var x2 = 0; x2 < N; x2++) for (var y2 = 0; y2 < N - 2; y2++) {
        var j = y2 * N + x2;
        if (g[j] && g[j] === g[j + N] && g[j] === g[j + N * 2]) {
          g[j] = g[j + N] = g[j + N * 2] = "";
          removed += 3;
        }
      }
      if (removed) {
        score += removed * 10;
        bar.querySelector(".play-score").textContent = "得分 " + score;
        for (var k = 0; k < N * N; k++) if (!g[k]) g[k] = ICONS[Math.floor(Math.random() * ICONS.length)];
        draw();
      }
      return !!removed;
    }
    init();
  };

  /* ---------- 28 黑白棋 ---------- */
  MG.reversi = function (host) {
    var N = 6, g, turn, over;
    var bar = H.top("你执黑"); bar.appendChild(H.button("重开", init));
    host.appendChild(bar);
    var grid = H.el("div", "board"); grid.style.gridTemplateColumns = "repeat(6, 50px)";
    host.appendChild(grid);
    host.appendChild(H.note("夹住对方棋子即可翻面，最后棋子多者胜。"));

    function init() {
      g = []; turn = 1; over = false; grid.innerHTML = "";
      for (var i = 0; i < N * N; i++) g.push(0);
      g[2 * N + 2] = 1; g[3 * N + 3] = 1; g[2 * N + 3] = 2; g[3 * N + 2] = 2;
      for (var k = 0; k < N * N; k++) {
        var c = H.el("button", "cell", "");
        c.type = "button"; c.style.width = c.style.height = "50px"; c.style.fontSize = "20px";
        c.dataset.i = k;
        c.addEventListener("click", function (e) { play(+e.currentTarget.dataset.i); });
        grid.appendChild(c);
      }
      bar.querySelector(".play-score").textContent = "你执黑";
      draw();
    }
    function draw() {
      var b = 0, w = 0;
      for (var i = 0; i < N * N; i++) {
        var c = grid.children[i];
        c.textContent = g[i] === 1 ? "●" : g[i] === 2 ? "○" : "";
        c.style.color = g[i] === 1 ? "#0b1216" : "#e8f0f2";
        if (g[i] === 1) b++; if (g[i] === 2) w++;
      }
      bar.querySelector(".play-score").textContent = "黑 " + b + " · 白 " + w;
      if (!over && !hasMove(1) && !hasMove(2)) {
        over = true;
        bar.querySelector(".play-score").textContent = "结束 · 黑 " + b + " 白 " + w;
      }
    }
    function dirs() { return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]; }
    function flips(i, p) {
      var x = i % N, y = Math.floor(i / N), out = [];
      if (g[i]) return out;
      dirs().forEach(function (d) {
        var cx = x + d[0], cy = y + d[1], line = [];
        while (cx >= 0 && cy >= 0 && cx < N && cy < N && g[cy * N + cx] === 3 - p) {
          line.push(cy * N + cx); cx += d[0]; cy += d[1];
        }
        if (line.length && cx >= 0 && cy >= 0 && cx < N && cy < N && g[cy * N + cx] === p) out.push.apply(out, line);
      });
      return out;
    }
    function hasMove(p) {
      for (var i = 0; i < N * N; i++) if (flips(i, p).length) return true;
      return false;
    }
    function play(i) {
      if (over) return;
      var f = flips(i, 1);
      if (!f.length) return;
      g[i] = 1; f.forEach(function (k) { g[k] = 1; });
      draw();
      setTimeout(ai, 220);
    }
    function ai() {
      if (over) return;
      var best = -1, bestN = 0;
      for (var i = 0; i < N * N; i++) {
        var f = flips(i, 2);
        if (f.length > bestN) { bestN = f.length; best = i; }
      }
      if (best >= 0) {
        var f2 = flips(best, 2);
        g[best] = 2; f2.forEach(function (k) { g[k] = 2; });
      }
      turn = 1; draw();
    }
    init();
  };

  /* ---------- 29 跳棋 ---------- */
  MG.checkers = function (host) {
    var N = 6, g, turn;
    var bar = H.top("黑方回合"); bar.appendChild(H.button("重开", init));
    host.appendChild(bar);
    var grid = H.el("div", "board"); grid.style.gridTemplateColumns = "repeat(6, 52px)";
    host.appendChild(grid);
    host.appendChild(H.note("两人同屏：黑先。斜走一步，跳过对方棋子可吃掉它。"));

    function init() {
      g = []; turn = 1; grid.innerHTML = "";
      for (var i = 0; i < N * N; i++) g.push(0);
      for (var y = 0; y < 2; y++) for (var x = 0; x < N; x++) if ((x + y) % 2) g[y * N + x] = 2;
      for (var y2 = N - 2; y2 < N; y2++) for (var x2 = 0; x2 < N; x2++) if ((x2 + y2) % 2) g[y2 * N + x2] = 1;
      for (var k = 0; k < N * N; k++) {
        var c = H.el("button", "cell", "");
        c.type = "button"; c.style.width = c.style.height = "52px"; c.style.fontSize = "20px";
        c.dataset.i = k;
        c.addEventListener("click", function (e) { tap(+e.currentTarget.dataset.i); });
        grid.appendChild(c);
      }
      draw();
    }
    var sel = null;
    function draw() {
      for (var i = 0; i < N * N; i++) {
        var c = grid.children[i];
        c.textContent = g[i] === 1 ? "●" : g[i] === 2 ? "○" : "";
        c.style.color = g[i] === 1 ? "#0b1216" : "#e8f0f2";
        c.style.background = sel === i ? "rgba(127,233,224,.30)" : "";
      }
      bar.querySelector(".play-score").textContent = (turn === 1 ? "黑方" : "白方") + "回合";
    }
    function tap(i) {
      if (g[i] === turn) { sel = i; draw(); return; }
      if (sel === null) return;
      var from = sel, x0 = from % N, y0 = Math.floor(from / N), x1 = i % N, y1 = Math.floor(i / N);
      var dx = x1 - x0, dy = y1 - y0, dir = turn === 1 ? -1 : 1;
      if (Math.abs(dx) === 1 && dy === dir && !g[i]) {
        g[i] = turn; g[from] = 0; sel = null; turn = 3 - turn; draw(); return;
      }
      if (Math.abs(dx) === 2 && dy === dir * 2 && !g[i]) {
        var mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        var mid = g[my * N + mx];
        if (mid === 3 - turn) { g[my * N + mx] = 0; g[i] = turn; g[from] = 0; sel = null; turn = 3 - turn; draw(); return; }
      }
    }
    init();
  };

  /* ---------- 30 数织 ---------- */
  MG.nonogram = function (host) {
    var SOL = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1]
    ];
    var state, cells;
    var bar = H.top("涂满即胜"); bar.appendChild(H.button("重开", init));
    host.appendChild(bar);
    var wrap = document.createElement("div");
    wrap.style.cssText = "display:grid;grid-template-columns:48px 1fr;gap:4px;justify-content:center;max-width:420px;margin:0 auto";
    host.appendChild(wrap);
    host.appendChild(H.note("每行左侧是连续格数提示，点格子涂色。"));

    function clue(row) {
      var out = [], run = 0;
      row.forEach(function (v) { if (v) run++; else if (run) { out.push(run); run = 0; } });
      if (run) out.push(run);
      return out.length ? out.join(" ") : "0";
    }
    function init() {
      state = [];
      wrap.innerHTML = "";
      for (var y = 0; y < 5; y++) {
        var cl = H.el("div", "play-score", clue(SOL[y]));
        cl.style.cssText = "display:flex;align-items:center;justify-content:flex-end;font-size:11px";
        wrap.appendChild(cl);
        var rowEl = document.createElement("div");
        rowEl.style.cssText = "display:grid;grid-template-columns:repeat(5,42px);gap:3px";
        for (var x = 0; x < 5; x++) {
          (function (y, x) {
            var c = H.el("button", "cell", "");
            c.type = "button"; c.style.width = c.style.height = "42px";
            c.dataset.y = y; c.dataset.x = x;
            c.addEventListener("click", function () {
              c.classList.toggle("on");
              var v = c.classList.contains("on") ? 1 : 0;
              state[y * 5 + x] = v;
              check();
            });
            rowEl.appendChild(c);
          })(y, x);
        }
        wrap.appendChild(rowEl);
      }
      state = new Array(25).fill(0);
      bar.querySelector(".play-score").textContent = "涂满即胜";
    }
    function check() {
      var ok = true;
      for (var i = 0; i < 25; i++) if (!!state[i] !== !!SOL[Math.floor(i / 5)][i % 5]) ok = false;
      if (ok) bar.querySelector(".play-score").textContent = "对了";
    }
    init();
  };

  /* ---------- 31 数回（简化） ---------- */
  MG.slitherlink = function (host) {
    var N = 5, CLUES = [
      [1, 2, 1, 2, 1],
      [2, 0, 2, 0, 2],
      [1, 2, 1, 2, 1],
      [2, 0, 2, 0, 2],
      [1, 2, 1, 2, 1]
    ];
    var hEdges, vEdges;
    var bar = H.top("让每格边数符合数字"); bar.appendChild(H.button("重开", init));
    host.appendChild(bar);
    var board = document.createElement("div");
    board.style.cssText = "position:relative;width:260px;height:260px;margin:10px auto";
    host.appendChild(board);
    host.appendChild(H.note("点格子之间的短线开/关，最终让每个数字格的边数等于数字。"));

    function init() {
      hEdges = {}; vEdges = {};
      board.innerHTML = "";
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var d = H.el("div", "play-score", String(CLUES[y][x]));
        d.style.cssText = "position:absolute;left:" + (x * 52 + 14) + "px;top:" + (y * 52 + 12) + "px;font-size:12px";
        board.appendChild(d);
      }
      for (var yy = 0; yy <= N; yy++) for (var xx = 0; xx < N; xx++) edge("h", yy, xx);
      for (var xx2 = 0; xx2 <= N; xx2++) for (var yy2 = 0; yy2 < N; yy2++) edge("v", yy2, xx2);
    }
    function edge(type, y, x) {
      var b = H.el("button", "", "");
      b.type = "button";
      if (type === "h") {
        b.style.cssText = "position:absolute;left:" + (x * 52 + 4) + "px;top:" + (y * 52 - 1) + "px;width:48px;height:6px;background:rgba(255,255,255,.10);border:0;border-radius:3px;cursor:pointer";
        b.dataset.k = "h" + y + "_" + x;
        b.addEventListener("click", function () { b.classList.toggle("on"); b.style.background = b.classList.contains("on") ? "#7fe9e0" : "rgba(255,255,255,.10)"; check(); });
      } else {
        b.style.cssText = "position:absolute;left:" + (x * 52 - 1) + "px;top:" + (y * 52 + 4) + "px;width:6px;height:48px;background:rgba(255,255,255,.10);border:0;border-radius:3px;cursor:pointer";
        b.dataset.k = "v" + y + "_" + x;
        b.addEventListener("click", function () { b.classList.toggle("on"); b.style.background = b.classList.contains("on") ? "#7fe9e0" : "rgba(255,255,255,.10)"; check(); });
      }
      board.appendChild(b);
    }
    function count(y, x) {
      var c = 0;
      if (board.querySelector('[data-k="h' + y + "_" + x + '"]').classList.contains("on")) c++;
      if (board.querySelector('[data-k="h' + (y + 1) + "_" + x + '"]').classList.contains("on")) c++;
      if (board.querySelector('[data-k="v' + y + "_" + x + '"]').classList.contains("on")) c++;
      if (board.querySelector('[data-k="v' + y + "_" + (x + 1) + '"]').classList.contains("on")) c++;
      return c;
    }
    function check() {
      var ok = true;
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) if (count(y, x) !== CLUES[y][x]) ok = false;
      if (ok) bar.querySelector(".play-score").textContent = "全部符合";
    }
    init();
  };

  /* ---------- 32 种子迷宫 ---------- */
  MG.mazeseed = function (host) {
    var N = 15, cell = 20;
    var cv = mkCanvas(N * cell, N * cell);
    var bar = H.top("种子：");
    var seedInput = document.createElement("input");
    seedInput.className = "play-input"; seedInput.style.width = "120px"; seedInput.value = "2026";
    var go = H.button("生成", function () { build(+seedInput.value || 1); });
    var share = H.button("复制链接", function () {
      var url = location.origin + location.pathname + "?seed=" + seedInput.value;
      try { navigator.clipboard.writeText(url); bar.querySelector(".play-score").textContent = "链接已复制"; } catch (e) {}
    });
    bar.appendChild(seedInput); bar.appendChild(go); bar.appendChild(share);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("相同种子生成同一座迷宫，方向键行走。"));
    var ctx = cv.getContext("2d"), grid, px, py, dead;

    function rng(seed) {
      var s = seed >>> 0;
      return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    }
    function build(seed) {
      seedInput.value = seed;
      var rand = rng(seed);
      grid = [];
      for (var y = 0; y < N; y++) { grid.push([]); for (var x = 0; x < N; x++) grid[y].push(1); }
      function carve(x, y) {
        grid[y][x] = 0;
        var dirs = [[2, 0], [-2, 0], [0, 2], [0, -2]];
        for (var i = dirs.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = dirs[i]; dirs[i] = dirs[j]; dirs[j] = t; }
        dirs.forEach(function (d) {
          var nx = x + d[0], ny = y + d[1];
          if (nx > 0 && ny > 0 && nx < N - 1 && ny < N - 1 && grid[ny][nx] === 1) {
            grid[y + d[1] / 2][x + d[0] / 2] = 0; carve(nx, ny);
          }
        });
      }
      carve(1, 1);
      px = 1; py = 1; dead = false;
      draw();
      bar.querySelector(".play-score").textContent = "种子：" + seed;
    }
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        if (!grid[y][x]) continue;
        ctx.fillStyle = "rgba(255,255,255,.10)";
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
      ctx.fillStyle = "#a8f0ea";
      ctx.fillRect(px * cell + 3, py * cell + 3, cell - 6, cell - 6);
      ctx.fillStyle = "rgba(127,233,224,.5)";
      ctx.fillRect((N - 2) * cell + 3, (N - 2) * cell + 3, cell - 6, cell - 6);
    }
    function move(dx, dy) {
      if (!grid) return;
      var nx = px + dx, ny = py + dy;
      if (!grid[ny] || grid[ny][nx] !== 0) return;
      px = nx; py = ny; draw();
      if (px === N - 2 && py === N - 2) bar.querySelector(".play-score").textContent = "到了 · 种子 " + seedInput.value;
    }
    keys({ ArrowUp: function () { move(0, -1); }, ArrowDown: function () { move(0, 1); }, ArrowLeft: function () { move(-1, 0); }, ArrowRight: function () { move(1, 0); } });
    var q = /(?:\\?|&)seed=(\\d+)/.exec(location.search);
    build(q ? +q[1] : 2026);
  };

  /* ---------- 33 六边形扫雷 ---------- */
  MG.hexmine = function (host) {
    var N = 6, MINES = 6, g, open, over;
    var bar = H.top("踩雷为止"); bar.appendChild(H.button("重开", init));
    host.appendChild(bar);
    var board = document.createElement("div");
    board.style.cssText = "position:relative;width:360px;height:330px;margin:10px auto";
    host.appendChild(board);
    host.appendChild(H.note("六方向的扫雷。点开格子，数字是周围雷数。"));

    function neighbors(x, y) {
      var odd = y % 2 === 1;
      var d = odd
        ? [[1, 0], [-1, 0], [0, -1], [1, -1], [0, 1], [1, 1]]
        : [[1, 0], [-1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]];
      return d.map(function (v) { return [x + v[0], y + v[1]]; })
        .filter(function (p) { return p[0] >= 0 && p[1] >= 0 && p[0] < N && p[1] < N; });
    }
    function init() {
      g = []; open = []; over = false;
      for (var i = 0; i < N * N; i++) { g.push(0); open.push(false); }
      var placed = 0;
      while (placed < MINES) { var p = Math.floor(Math.random() * N * N); if (!g[p]) { g[p] = 1; placed++; } }
      board.innerHTML = "";
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        (function (x, y) {
          var b = H.el("button", "cell", "");
          b.type = "button";
          b.style.cssText = "position:absolute;width:44px;height:44px;left:" + (x * 46 + (y % 2 ? 23 : 0) + 10) + "px;top:" + (y * 40 + 10) + "px;clip-path:polygon(25% 3%,75% 3%,100% 50%,75% 97%,25% 97%,0 50%)";
          b.addEventListener("click", function () { reveal(x, y, b); });
          board.appendChild(b);
        })(x, y);
      }
      bar.querySelector(".play-score").textContent = "踩雷为止";
    }
    function idx(x, y) { return y * N + x; }
    function reveal(x, y, b) {
      if (over || open[idx(x, y)]) return;
      if (g[idx(x, y)]) {
        over = true; b.textContent = "✹"; b.classList.add("hit");
        bar.querySelector(".play-score").textContent = "踩雷了";
        return;
      }
      open[idx(x, y)] = true;
      b.classList.add("on");
      var n = neighbors(x, y).filter(function (p) { return g[idx(p[0], p[1])]; }).length;
      b.textContent = n ? String(n) : "";
      if (!n) neighbors(x, y).forEach(function (p) {
        var b2 = board.children[idx(p[0], p[1])];
        if (b2) reveal(p[0], p[1], b2);
      });
    }
    init();
  };

  /* ---------- 34 2048 · 5×5 ---------- */
  MG.g2048x5 = function (host) {
    var N = 5, g, score, over, cells;
    var bar = H.top("分数 0"); bar.appendChild(H.button("重开", init));
    host.appendChild(bar);
    var grid = H.el("div", "board"); grid.style.gridTemplateColumns = "repeat(5, 60px)";
    host.appendChild(grid);
    host.appendChild(H.note("方向键移动，5×5 棋盘，合并到 2048 算赢。"));

    function init() {
      g = []; score = 0; over = false; cells = [];
      grid.innerHTML = ""; bar.querySelector(".play-score").textContent = "分数 0";
      for (var i = 0; i < N * N; i++) {
        var c = H.el("div", "cell", "");
        c.style.width = c.style.height = "60px"; c.style.fontSize = "17px";
        grid.appendChild(c); cells.push(c);
      }
      spawn(); spawn(); draw();
    }
    function spawn() {
      var free = []; for (var i = 0; i < N * N; i++) if (!g[i]) free.push(i);
      if (!free.length) return;
      g[free[Math.floor(Math.random() * free.length)]] = Math.random() < 0.9 ? 2 : 4;
    }
    function draw() {
      for (var i = 0; i < N * N; i++) {
        cells[i].textContent = g[i] || "";
        cells[i].classList.toggle("on", !!g[i]);
        cells[i].style.background = g[i] ? "rgba(127,233,224," + Math.min(0.55, 0.08 + Math.log2(g[i]) * 0.05) + ")" : "";
      }
      bar.querySelector(".play-score").textContent = "分数 " + score;
    }
    function move(dir) {
      if (over) return;
      var moved = false;
      for (var line = 0; line < N; line++) {
        var idxs = [];
        for (var i = 0; i < N; i++) {
          idxs.push(dir === 0 ? line * N + i : dir === 1 ? line * N + (N - 1 - i) : dir === 2 ? i * N + line : (N - 1 - i) * N + line);
        }
        var vals = idxs.map(function (k) { return g[k]; }).filter(Boolean), out = [];
        for (var j = 0; j < vals.length; j++) {
          if (j + 1 < vals.length && vals[j] === vals[j + 1]) { out.push(vals[j] * 2); score += vals[j] * 2; j++; }
          else out.push(vals[j]);
        }
        while (out.length < N) out.push(0);
        idxs.forEach(function (k, m) { if (g[k] !== out[m]) moved = true; g[k] = out[m]; });
      }
      if (moved) { spawn(); draw(); }
    }
    keys({ ArrowLeft: function () { move(0); }, ArrowRight: function () { move(1); }, ArrowUp: function () { move(2); }, ArrowDown: function () { move(3); } });
    init();
  };

  /* ---------- 35 双人贪吃蛇 ---------- */
  MG.twosnake = function (host) {
    var N = 18, cell = 18;
    var cv = mkCanvas(N * cell, N * cell);
    var bar = H.top("黑用 WASD，白用方向键");
    var reset = H.button("重开", init); bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("两条蛇抢食物，撞墙或撞到任意一条蛇就结束。"));

    var ctx = cv.getContext("2d"), s1, s2, d1, d2, food, timer, dead;
    function init() {
      s1 = [{ x: 4, y: 9 }, { x: 3, y: 9 }];
      s2 = [{ x: 13, y: 9 }, { x: 14, y: 9 }];
      d1 = { x: 1, y: 0 }; d2 = { x: -1, y: 0 };
      dead = false; food = { x: 9, y: 9 };
      bar.querySelector(".play-score").textContent = "黑用 WASD，白用方向键";
      clearInterval(timer); timer = setInterval(step, 140);
      draw();
    }
    function step() {
      if (dead) return;
      var h1 = { x: s1[0].x + d1.x, y: s1[0].y + d1.y };
      var h2 = { x: s2[0].x + d2.x, y: s2[0].y + d2.y };
      function bad(p, own, other) {
        if (p.x < 0 || p.y < 0 || p.x >= N || p.y >= N) return true;
        return own.concat(other).some(function (s) { return s.x === p.x && s.y === p.y; });
      }
      if (bad(h1, s1, s2) || bad(h2, s2, s1)) {
        dead = true; clearInterval(timer);
        bar.querySelector(".play-score").textContent = "撞了";
        return;
      }
      s1.unshift(h1); s2.unshift(h2);
      if (h1.x === food.x && h1.y === food.y) {
        food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
      } else s1.pop();
      if (h2.x === food.x && h2.y === food.y) {
        food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
      } else s2.pop();
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#a8f0ea";
      s1.forEach(function (s) { ctx.fillRect(s.x * cell + 2, s.y * cell + 2, cell - 4, cell - 4); });
      ctx.fillStyle = "rgba(255,255,255,.65)";
      s2.forEach(function (s) { ctx.fillRect(s.x * cell + 2, s.y * cell + 2, cell - 4, cell - 4); });
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(food.x * cell + 4, food.y * cell + 4, cell - 8, cell - 8);
    }
    document.addEventListener("keydown", function (e) {
      var m1 = { w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0] }[e.key.toLowerCase()];
      if (m1 && !(m1[0] === -d1.x && m1[1] === -d1.y)) { d1 = { x: m1[0], y: m1[1] }; e.preventDefault(); }
      var m2 = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (m2 && !(m2[0] === -d2.x && m2[1] === -d2.y)) { d2 = { x: m2[0], y: m2[1] }; e.preventDefault(); }
    });
    init();
  };

  /* ---------- 36 打字防御 ---------- */
  MG.typedefense = function (host) {
    var WORDS = ["arsenal", "soulglyph", "ymondf", "kipl", "oreguard", "lmlly", "sqdclib", "forge", "echoes", "loginmod"];
    var W = 360, H2 = 300;
    var cv = mkCanvas(W, H2);
    var bar = H.top("存活 0");
    var reset = H.button("重开", init); bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    var input = document.createElement("input");
    input.className = "play-input"; input.placeholder = "打字消灭最低的单词，回车提交";
    input.style.cssText = "display:block;width:100%;max-width:420px;margin:10px auto";
    host.appendChild(input);
    host.appendChild(H.note("单词落到最底部就结束。打对即消除。"));

    var ctx = cv.getContext("2d"), words, score, raf, spawnT, dead;
    function init() {
      words = []; score = 0; dead = false; spawnT = 0; input.value = "";
      bar.querySelector(".play-score").textContent = "存活 0";
      loop(0);
    }
    function loop(t) {
      if (dead) return;
      if (t - spawnT > 1400) {
        spawnT = t;
        words.push({ w: WORDS[Math.floor(Math.random() * WORDS.length)], x: 30 + Math.random() * (W - 120), y: -10, v: 0.5 + score * 0.02 });
      }
      words.forEach(function (o) { o.y += o.v; });
      if (words.some(function (o) { return o.y > H2 - 14; })) {
        dead = true; bar.querySelector(".play-score").textContent = "结束 · 得分 " + score; draw(); return;
      }
      draw(); raf = requestAnimationFrame(loop);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H2);
      ctx.font = "13px ui-monospace, monospace";
      words.forEach(function (o) {
        ctx.fillStyle = o.y > H2 - 60 ? "rgba(255,130,130,.9)" : "rgba(168,240,234,.9)";
        ctx.fillText(o.w, o.x, o.y);
      });
      ctx.fillStyle = "rgba(255,255,255,.15)";
      ctx.fillRect(0, H2 - 12, W, 2);
    }
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || dead) return;
      var v = input.value.trim().toLowerCase();
      input.value = "";
      var hit = -1;
      words.forEach(function (o, i) { if (o.w === v && (hit < 0 || o.y > words[hit].y)) hit = i; });
      if (hit >= 0) { words.splice(hit, 1); score += 10; bar.querySelector(".play-score").textContent = "得分 " + score; }
    });
    init();
  };

  /* ---------- 37 节奏点击 ---------- */
  MG.rhythmclick = function (host) {
    var bar = H.top("等待开始");
    var start = H.button("开始", function () { run(); }); bar.appendChild(start);
    host.appendChild(bar);
    var pad = H.button("点我", function () { tap(); });
    pad.style.cssText = "display:block;width:100%;height:150px;margin:12px 0;font-size:16px";
    host.appendChild(pad);
    host.appendChild(H.note("每 700ms 一拍，尽量踩在拍点上点击。"));
    var t0 = 0, beat = 700, score = 0, hits = 0, timer, audio;
    function beep(f) {
      try { audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        var o = audio.createOscillator(), g = audio.createGain();
        o.frequency.value = f; g.gain.value = 0.06; o.connect(g); g.connect(audio.destination);
        o.start(); o.stop(audio.currentTime + 0.06);
      } catch (e) {}
    }
    function run() {
      t0 = performance.now(); score = 0; hits = 0; clearInterval(timer);
      bar.querySelector(".play-score").textContent = "开始";
      timer = setInterval(function () { beep(880); }, beat);
      setTimeout(function () { clearInterval(timer); bar.querySelector(".play-score").textContent = "得分 " + score + " · 命中 " + hits; }, 14000);
    }
    function tap() {
      if (!t0) return;
      var now = performance.now() - t0;
      var off = Math.abs((now % beat) - beat / 2);
      off = Math.min(off, beat - off);
      if (off < 90) { score += Math.round(100 - off); hits++; beep(1200); }
      else beep(220);
      bar.querySelector(".play-score").textContent = "得分 " + score + " · 偏移 " + Math.round(off) + "ms";
    }
  };

  /* ---------- 38 记忆序列 ---------- */
  MG.simon = function (host) {
    var PADS = ["#7fe9e0", "#a8f0ea", "#d6a8ff", "#ffd166"];
    var seq, input, playing, round;
    var bar = H.top("第 1 轮"); bar.appendChild(H.button("重开", init));
    host.appendChild(bar);
    var grid = H.el("div", "board"); grid.style.gridTemplateColumns = "repeat(2, 110px)";
    host.appendChild(grid);
    host.appendChild(H.note("看清闪烁顺序，然后按顺序点回去。"));
    var pads = [];
    function init() {
      seq = []; input = 0; playing = false; round = 1;
      grid.innerHTML = ""; pads = [];
      bar.querySelector(".play-score").textContent = "第 1 轮";
      PADS.forEach(function (c, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.style.cssText = "width:110px;height:110px;border-radius:14px;border:1px solid rgba(255,255,255,.2);background:" + c + ";opacity:.35;cursor:pointer";
        b.addEventListener("click", function () { press(i); });
        grid.appendChild(b); pads.push(b);
      });
      setTimeout(next, 500);
    }
    function flash(i) {
      pads[i].style.opacity = "1";
      setTimeout(function () { pads[i].style.opacity = ".35"; }, 320);
    }
    function next() {
      seq.push(Math.floor(Math.random() * 4));
      playing = true; input = 0;
      seq.forEach(function (v, k) { setTimeout(function () { flash(v); }, 420 * (k + 1)); });
      setTimeout(function () { playing = false; }, 420 * (seq.length + 1));
      bar.querySelector(".play-score").textContent = "第 " + round + " 轮 · 轮到你了";
    }
    function press(i) {
      if (playing) return;
      flash(i);
      if (seq[input] === i) {
        input++;
        if (input === seq.length) { round++; setTimeout(next, 600); }
      } else {
        bar.querySelector(".play-score").textContent = "错了 · 第 " + round + " 轮结束";
        playing = true;
      }
    }
    init();
  };

  /* ---------- 39 猜词 ---------- */
  MG.wordle = function (host) {
    var WORDS = ["游戏", "模组", "方块", "红石", "下界", "末地", "附魔", "锻造", "村庄", "苦力"];
    var answer = WORDS[Math.floor(Math.random() * WORDS.length)];
    var tries = 0;
    var bar = H.top("六次机会"); bar.appendChild(H.button("重开", function () { answer = WORDS[Math.floor(Math.random() * WORDS.length)]; tries = 0; rows.innerHTML = ""; out.textContent = "输入两个字的词"; bar.querySelector(".play-score").textContent = "六次机会"; }));
    host.appendChild(bar);
    var input = document.createElement("input");
    input.className = "play-input"; input.placeholder = "两个字，回车提交";
    input.style.cssText = "display:block;width:160px;margin:14px auto";
    host.appendChild(input);
    var rows = document.createElement("div");
    rows.style.cssText = "display:flex;flex-direction:column;gap:6px;align-items:center;margin:10px 0";
    host.appendChild(rows);
    var out = H.note("输入两个字的词");
    host.appendChild(out);
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var v = input.value.trim();
      if (v.length !== 2) { out.textContent = "要两个字。"; return; }
      input.value = "";
      tries++;
      var row = document.createElement("div");
      row.style.cssText = "display:flex;gap:6px";
      for (var i = 0; i < 2; i++) {
        var c = H.el("div", "cell", v[i]);
        c.style.cssText = "width:44px;height:44px;display:grid;place-items:center;font-size:16px";
        if (v[i] === answer[i]) c.style.background = "rgba(127,233,224,.55)";
        else if (answer.indexOf(v[i]) >= 0) c.style.background = "rgba(255,209,102,.45)";
        row.appendChild(c);
      }
      rows.appendChild(row);
      if (v === answer) { out.textContent = "对了，用了 " + tries + " 次。"; return; }
      if (tries >= 6) { out.textContent = "机会用完，答案是「" + answer + "」。"; return; }
      bar.querySelector(".play-score").textContent = "还剩 " + (6 - tries) + " 次";
    });
  };

  /* ---------- 40 成语接龙 ---------- */
  MG.idiom = function (host) {
    var POOL = ["一心一意", "意气风发", "发扬光大", "大公无私", "私心杂念", "念念不忘", "忘乎所以", "以身作则", "则无旁贷", "待人接物", "物极必反", "反复无常", "常来常往", "往事如烟", "烟消云散", "散兵游勇", "勇往直前", "前所未有", "有始有终", "终身大事"];
    var current = POOL[Math.floor(Math.random() * POOL.length)];
    var score = 0;
    var bar = H.top("接龙：0 个");
    var say = H.el("p", "play-score", "");
    say.style.cssText = "font-family:var(--serif);font-size:22px;text-align:center;margin:16px 0";
    host.appendChild(bar); host.appendChild(say);
    var input = document.createElement("input");
    input.className = "play-input"; input.placeholder = "接一个成语，回车";
    input.style.cssText = "display:block;width:220px;margin:0 auto";
    host.appendChild(input);
    var out = H.note("规则：下一个成语的第一个字，要接上一个的最后一个字。");
    host.appendChild(out);
    say.textContent = current;
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var v = input.value.trim();
      input.value = "";
      if (v.length < 2) { out.textContent = "至少两个字。"; return; }
      if (v[0] !== current[current.length - 1]) { out.textContent = "第一个字要接「" + current[current.length - 1] + "」。"; return; }
      if (POOL.indexOf(v) === -1) { out.textContent = "这个词不在词库里，换个常见的。"; return; }
      current = v; score++;
      say.textContent = current;
      bar.querySelector(".play-score").textContent = "接龙：" + score + " 个";
      out.textContent = "接上了。";
    });
  };

  /* ---------- 41 元素配对 ---------- */
  MG.elements = function (host) {
    var PAIRS = [["H", "氢"], ["O", "氧"], ["Fe", "铁"], ["Cu", "铜"], ["Au", "金"], ["C", "碳"], ["N", "氮"], ["Na", "钠"]];
    var left = H.shuffle(PAIRS.slice()), right = H.shuffle(PAIRS.slice()), sel = null, done = 0;
    var bar = H.top("配对 0 / 8"); bar.appendChild(H.button("重开", init));
    host.appendChild(bar);
    var wrap = document.createElement("div");
    wrap.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:420px;margin:0 auto";
    host.appendChild(wrap);
    host.appendChild(H.note("先点左边的元素符号，再点右边的中文名。"));

    function init() { left = H.shuffle(PAIRS.slice()); right = H.shuffle(PAIRS.slice()); sel = null; done = 0; render(); }
    function render() {
      wrap.innerHTML = "";
      left.forEach(function (p) { wrap.appendChild(cell(p[0], p, "L")); });
      right.forEach(function (p) { wrap.appendChild(cell(p[1], p, "R")); });
      bar.querySelector(".play-score").textContent = "配对 " + done + " / 8";
    }
    function cell(text, pair, side) {
      var b = H.button(text, function () {
        if (side === "L") { sel = { pair: pair, b: b }; return; }
        if (!sel) return;
        if (sel.pair[0] === pair[0]) { sel.b.classList.add("on"); b.classList.add("on"); done++; sel = null; render(); }
        else { sel.b.style.background = ""; sel = null; }
      });
      b.style.cssText = "padding:12px 0;width:100%";
      return b;
    }
    init();
  };

  /* ---------- 42 谐音梗 ---------- */
  MG.homophone = function (host) {
    var QS = [
      ["请问什么东西最爱偷吃？", ["猫", "老鼠", "零食", "时间"], 2],
      ["什么动物最容易摔倒？", ["狐狸", "企鹅", "猪", "猴子"], 0],
      ["哪个字最难写？", ["错", "难", "繁", "写"], 1],
      ["什么东西越洗越脏？", ["衣服", "水", "手", "碗"], 1],
      ["什么车最慢？", ["自行车", "三轮车", "风车", "堵车"], 2]
    ];
    var i = 0, score = 0;
    var bar = H.top("得分 0"); host.appendChild(bar);
    var q = H.el("p", "play-score", ""); q.style.cssText = "font-size:15px;margin:14px 0";
    host.appendChild(q);
    var opts = document.createElement("div"); opts.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px";
    host.appendChild(opts);
    var out = H.note(""); host.appendChild(out);
    function ask() {
      if (i >= QS.length) { q.textContent = "结束，得分 " + score; opts.innerHTML = ""; return; }
      var item = QS[i]; q.textContent = item[0]; opts.innerHTML = "";
      item[1].forEach(function (t, k) {
        var b = H.button(t, function () {
          if (k === item[2]) { score++; out.textContent = "对了。"; } else out.textContent = "答案是「" + item[1][item[2]] + "」。";
          bar.querySelector(".play-score").textContent = "得分 " + score + " · " + (i + 1) + "/5";
          i++; setTimeout(ask, 600);
        });
        opts.appendChild(b);
      });
    }
    ask();
  };

  /* ---------- 43 魔方计时器 ---------- */
  MG.cubetimer = function (host) {
    var times = [], running = false, t0 = 0, timer;
    var bar = H.top("按空格开始 / 停止");
    host.appendChild(bar);
    var show = H.el("p", "play-score", "0.00");
    show.style.cssText = "font-family:var(--mono);font-size:42px;text-align:center;margin:24px 0";
    host.appendChild(show);
    var list = H.note("");
    host.appendChild(list);
    host.appendChild(H.note("适合配合实体魔方使用。记录只保存在浏览器本地。"));
    document.addEventListener("keydown", function (e) {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (!running) {
        running = true; t0 = performance.now();
        timer = setInterval(function () { show.textContent = ((performance.now() - t0) / 1000).toFixed(2); }, 30);
        bar.querySelector(".play-score").textContent = "计时中…";
      } else {
        running = false; clearInterval(timer);
        var sec = (performance.now() - t0) / 1000;
        times.push(sec);
        show.textContent = sec.toFixed(2);
        var best = Math.min.apply(null, times);
        list.innerHTML = "次数 " + times.length + " · 最佳 " + best.toFixed(2) + "s · 平均 " + (times.reduce(function (a, b) { return a + b; }, 0) / times.length).toFixed(2) + "s";
        bar.querySelector(".play-score").textContent = "按空格开始";
      }
    });
  };

  /* ---------- 44 图片拼图（交换式） ---------- */
  MG.picpuzzle = function (host) {
    var N = 3, tiles, sel;
    var bar = H.top("把它排回 1–8"); bar.appendChild(H.button("打乱", init));
    host.appendChild(bar);
    var grid = H.el("div", "board"); grid.style.gridTemplateColumns = "repeat(3, 74px)";
    host.appendChild(grid);
    host.appendChild(H.note("点两块交换位置，按 1–8 顺序排好。"));

    function init() {
      tiles = H.shuffle([1, 2, 3, 4, 5, 6, 7, 8]);
      sel = null; render();
    }
    function render() {
      grid.innerHTML = "";
      tiles.forEach(function (v, i) {
        var b = H.el("button", "cell", String(v));
        b.type = "button"; b.style.width = b.style.height = "74px"; b.style.fontSize = "18px";
        if (sel === i) b.classList.add("on");
        b.addEventListener("click", function () { tap(i); });
        grid.appendChild(b);
      });
    }
    function tap(i) {
      if (sel === null) { sel = i; render(); return; }
      var t = tiles[sel]; tiles[sel] = tiles[i]; tiles[i] = t;
      sel = null; render();
      if (tiles.every(function (v, k) { return v === k + 1; })) bar.querySelector(".play-score").textContent = "排好了";
    }
    init();
  };

  /* ---------- 45 弹球 ---------- */
  MG.pinball = function (host) {
    var W = 320, H2 = 360;
    var cv = mkCanvas(W, H2);
    var bar = H.top("得分 0"); var reset = H.button("重开", init); bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("鼠标左右移动挡板，把球弹回去打亮弹柱。"));
    var ctx = cv.getContext("2d"), ball, px, bumps, score, dead;
    function init() {
      ball = { x: W / 2, y: 60, vx: 2.4, vy: 2.6, r: 7 };
      px = W / 2; score = 0; dead = false;
      bumps = [];
      for (var i = 0; i < 5; i++) bumps.push({ x: 60 + i * 50, y: 120 + (i % 2) * 60, r: 12 });
      bar.querySelector(".play-score").textContent = "得分 0";
      loop();
    }
    function loop() {
      if (dead) return;
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
      if (ball.y < ball.r) ball.vy *= -1;
      if (ball.y > H2 - 22 && ball.x > px - 34 && ball.x < px + 34) {
        ball.vy = -Math.abs(ball.vy); ball.vx += (ball.x - px) * 0.03;
      }
      if (ball.y > H2 + 20) { dead = true; bar.querySelector(".play-score").textContent = "结束 · 得分 " + score; return; }
      bumps.forEach(function (b) {
        var dx = ball.x - b.x, dy = ball.y - b.y;
        if (Math.sqrt(dx * dx + dy * dy) < b.r + ball.r) {
          var ang = Math.atan2(dy, dx);
          ball.vx = Math.cos(ang) * 3.2; ball.vy = Math.sin(ang) * 3.2;
          score += 10; bar.querySelector(".play-score").textContent = "得分 " + score;
        }
      });
      draw(); requestAnimationFrame(loop);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H2);
      ctx.fillStyle = "rgba(127,233,224,.45)";
      bumps.forEach(function (b) { ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = "#a8f0ea"; ctx.fillRect(px - 34, H2 - 16, 68, 8);
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    }
    cv.addEventListener("mousemove", function (e) {
      var r = cv.getBoundingClientRect();
      px = (e.clientX - r.left) * (W / r.width);
    });
    init();
  };

  /* ---------- 46 打地鼠 ---------- */
  MG.whack = function (host) {
    var bar = H.top("30 秒");
    var start = H.button("开始", run); bar.appendChild(start);
    host.appendChild(bar);
    var grid = H.el("div", "board"); grid.style.gridTemplateColumns = "repeat(3, 80px)";
    host.appendChild(grid);
    host.appendChild(H.note("点冒出来的地鼠，30 秒内得分。"));
    var holes = [], score, left, timer, mole;
    for (var i = 0; i < 9; i++) {
      (function (i) {
        var b = H.el("button", "cell", "");
        b.type = "button"; b.style.width = b.style.height = "80px"; b.style.fontSize = "22px";
        b.addEventListener("click", function () {
          if (+b.dataset.mole) { score++; bar.querySelector(".play-score").textContent = "得分 " + score + " · " + left + "s"; pop(); }
        });
        grid.appendChild(b); holes.push(b);
      })(i);
    }
    function run() {
      score = 0; left = 30; bar.querySelector(".play-score").textContent = "得分 0 · 30s";
      clearInterval(timer);
      timer = setInterval(function () {
        left--; bar.querySelector(".play-score").textContent = "得分 " + score + " · " + left + "s";
        if (left <= 0) { clearInterval(timer); pop(true); }
      }, 1000);
      pop();
    }
    function pop() {
      holes.forEach(function (h) { h.textContent = ""; h.dataset.mole = "0"; });
      if (left <= 0) return;
      var h = holes[Math.floor(Math.random() * 9)];
      h.textContent = "◆"; h.dataset.mole = "1";
      clearTimeout(mole);
      mole = setTimeout(pop, 700);
    }
  };

  /* ---------- 47 赛车躲避 ---------- */
  MG.racer = function (host) {
    var W = 300, H2 = 380, lanes = 3, lw = W / lanes;
    var cv = mkCanvas(W, H2);
    var bar = H.top("得分 0"); var reset = H.button("重开", init); bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("← → 换道，躲开迎面来的车。"));
    var ctx = cv.getContext("2d"), lane, cars, score, raf, last, dead, v;
    function init() {
      lane = 1; cars = []; score = 0; dead = false; last = 0; v = 3;
      bar.querySelector(".play-score").textContent = "得分 0";
      loop(0);
    }
    function loop(t) {
      if (dead) return;
      if (t - last > 700) {
        last = t;
        var l = Math.floor(Math.random() * lanes);
        cars.push({ l: l, y: -40, v: v });
        v = Math.min(7, v + 0.08);
      }
      cars.forEach(function (c) { c.y += c.v; });
      if (cars.some(function (c) { return c.y > H2 - 90 && c.y < H2 - 20 && c.l === lane; })) {
        dead = true; bar.querySelector(".play-score").textContent = "撞车 · 得分 " + score; draw(); return;
      }
      score += 0.05;
      bar.querySelector(".play-score").textContent = "得分 " + Math.floor(score);
      cars = cars.filter(function (c) { return c.y < H2 + 40; });
      draw(); raf = requestAnimationFrame(loop);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H2);
      ctx.fillStyle = "rgba(255,255,255,.06)";
      for (var i = 1; i < lanes; i++) ctx.fillRect(i * lw, 0, 1, H2);
      ctx.fillStyle = "#a8f0ea";
      ctx.fillRect(lane * lw + 14, H2 - 80, lw - 28, 60);
      ctx.fillStyle = "rgba(255,130,130,.85)";
      cars.forEach(function (c) { ctx.fillRect(c.l * lw + 16, c.y, lw - 32, 56); });
    }
    keys({ ArrowLeft: function () { lane = Math.max(0, lane - 1); }, ArrowRight: function () { lane = Math.min(lanes - 1, lane + 1); } });
    init();
  };

  /* ---------- 48 平台跳跃 ---------- */
  MG.platformer = function (host) {
    var W = 420, H2 = 300;
    var cv = mkCanvas(W, H2);
    var bar = H.top("第 1 关"); var reset = H.button("重开", init); bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("← → 移动，空格跳。碰到旗子过关，掉下去重来。"));
    var ctx = cv.getContext("2d"), lvl, px, py, vy, onGround, plats, goal, dead, raf;
    var LEVELS = [
      { p: [[0, 260, 120], [180, 220, 90], [320, 250, 90]], goal: [380, 230] },
      { p: [[0, 260, 90], [120, 210, 70], [230, 170, 70], [330, 250, 90]], goal: [390, 230] },
      { p: [[0, 260, 70], [100, 200, 60], [200, 150, 60], [300, 200, 60], [360, 120, 60]], goal: [390, 100] }
    ];
    function init() { lvl = 0; load(0); }
    function load(i) {
      lvl = i; px = 30; py = 220; vy = 0; onGround = false; dead = false;
      plats = LEVELS[i].p.map(function (a) { return { x: a[0], y: a[1], w: a[2] }; });
      goal = { x: LEVELS[i].goal[0], y: LEVELS[i].goal[1] };
      bar.querySelector(".play-score").textContent = "第 " + (i + 1) + " 关";
      cancelAnimationFrame(raf); loop();
    }
    var left = false, right = false, jump = false;
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") left = true;
      if (e.key === "ArrowRight") right = true;
      if (e.key === " ") { jump = true; e.preventDefault(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") e.preventDefault();
    });
    document.addEventListener("keyup", function (e) {
      if (e.key === "ArrowLeft") left = false;
      if (e.key === "ArrowRight") right = false;
      if (e.key === " ") jump = false;
    });
    function loop() {
      if (dead) return;
      px += (right ? 3 : 0) - (left ? 3 : 0);
      px = Math.max(10, Math.min(W - 10, px));
      vy += 0.45; py += vy;
      onGround = false;
      plats.forEach(function (p) {
        if (px > p.x && px < p.x + p.w && py >= p.y && py <= p.y + 12 + vy && vy > 0) {
          py = p.y; vy = 0; onGround = true;
        }
      });
      if (jump && onGround) { vy = -8.6; }
      if (py > H2) { dead = true; setTimeout(function () { load(lvl); }, 500); }
      if (Math.abs(px - goal.x) < 14 && Math.abs(py - goal.y) < 20) {
        if (lvl + 1 < LEVELS.length) load(lvl + 1);
        else bar.querySelector(".play-score").textContent = "全部通过";
      }
      draw(); raf = requestAnimationFrame(loop);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H2);
      ctx.fillStyle = "rgba(255,255,255,.10)";
      plats.forEach(function (p) { ctx.fillRect(p.x, p.y, p.w, 10); });
      ctx.fillStyle = "#a8f0ea"; ctx.fillRect(px - 7, py - 18, 14, 18);
      ctx.fillStyle = "#ffd166"; ctx.fillRect(goal.x, goal.y, 3, 24); ctx.fillRect(goal.x, goal.y, 16, 10);
    }
    init();
  };

  /* ---------- 49 极简塔防 ---------- */
  MG.towerdefense = function (host) {
    var W = 420, H2 = 260, path = [[0, 200], [120, 200], [120, 80], [300, 80], [300, 200], [420, 200]];
    var cv = mkCanvas(W, H2);
    var bar = H.top("生命 10 · 击杀 0"); var reset = H.button("重开", init); bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("点道路旁边的空地放塔（塔会攻击最近的敌人）。"));
    var ctx = cv.getContext("2d"), towers, enemies, hp, kills, dead, raf, spawnT, t;
    function init() {
      towers = []; enemies = []; hp = 10; kills = 0; spawnT = 0; dead = false;
      bar.querySelector(".play-score").textContent = "生命 10 · 击杀 0";
      loop(0);
    }
    cv.addEventListener("click", function (e) {
      var r = cv.getBoundingClientRect();
      var x = (e.clientX - r.left) * (W / r.width), y = (e.clientY - r.top) * (H2 / r.height);
      if (nearPath(x, y)) return;
      towers.push({ x: x, y: y, cd: 0, range: 90 });
    });
    function nearPath(x, y) {
      for (var i = 0; i < path.length - 1; i++) {
        var a = path[i], b = path[i + 1];
        var dx = b[0] - a[0], dy = b[1] - a[1];
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var t2 = ((x - a[0]) * dx + (y - a[1]) * dy) / (len * len);
        t2 = Math.max(0, Math.min(1, t2));
        var px2 = a[0] + dx * t2, py2 = a[1] + dy * t2;
        if (Math.sqrt((x - px2) * (x - px2) + (y - py2) * (y - py2)) < 26) return true;
      }
      return false;
    }
    var lastT = 0;
    function loop(t2) {
      if (dead) return;
      var dt = lastT ? Math.min(50, t2 - lastT) : 16;
      lastT = t2;
      if (t2 - spawnT > 1600) {
        spawnT = t2;
        enemies.push({ prog: 0, hp: 3, v: 0.00022 + kills * 0.000006 });
      }
      enemies.forEach(function (e2) { e2.prog += e2.v * dt; });
      towers.forEach(function (tw) {
        if (tw.cd > 0) { tw.cd--; return; }
        var target = null;
        enemies.forEach(function (e2) {
          var pos = pointAt(e2.prog);
          if (Math.hypot(pos.x - tw.x, pos.y - tw.y) < tw.range && (!target || e2.prog > target.prog)) target = e2;
        });
        if (target) {
          target.hp--; tw.cd = 20;
          if (target.hp <= 0) { kills++; }
        }
      });
      enemies = enemies.filter(function (e2) {
        if (e2.hp <= 0) return false;
        if (e2.prog >= 1) { hp--; return false; }
        return true;
      });
      if (hp <= 0) { dead = true; bar.querySelector(".play-score").textContent = "结束 · 击杀 " + kills; }
      else bar.querySelector(".play-score").textContent = "生命 " + hp + " · 击杀 " + kills;
      draw(); raf = requestAnimationFrame(loop);
    }
    function pointAt(p) {
      var total = 0, segs = [];
      for (var i = 0; i < path.length - 1; i++) {
        var a = path[i], b = path[i + 1];
        var len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        segs.push({ a: a, b: b, len: len }); total += len;
      }
      var d = p * total;
      for (var k = 0; k < segs.length; k++) {
        if (d <= segs[k].len) {
          var r = d / segs[k].len;
          return { x: segs[k].a[0] + (segs[k].b[0] - segs[k].a[0]) * r, y: segs[k].a[1] + (segs[k].b[1] - segs[k].a[1]) * r };
        }
        d -= segs[k].len;
      }
      var last2 = segs[segs.length - 1].b;
      return { x: last2[0], y: last2[1] };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H2);
      ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.lineWidth = 26; ctx.lineJoin = "round";
      ctx.beginPath(); path.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
      ctx.fillStyle = "rgba(127,233,224,.55)";
      towers.forEach(function (tw) { ctx.beginPath(); ctx.arc(tw.x, tw.y, 9, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = "rgba(255,140,140,.9)";
      enemies.forEach(function (e2) { var p = pointAt(e2.prog); ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill(); });
    }
    init();
  };

  /* ---------- 50 纸牌接龙（简化 Klondike） ---------- */
  MG.solitaire = function (host) {
    var SUITS = ["♠", "♥", "♣", "♦"];
    var deck, stock, waste, found, cols, sel;
    var bar = H.top("把四种花色按 A 到 K 码好");
    var reset = H.button("重开", init); bar.appendChild(reset);
    host.appendChild(bar);
    var board = document.createElement("div");
    board.style.cssText = "display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:14px 0";
    host.appendChild(board);
    host.appendChild(H.note("点牌选中，再点目标位置移动；双击/单击底部堆自动收进花色堆。"));
    host.appendChild(H.note("简化版：只保留发牌堆与四个花色堆，先练手。"));

    function fresh() {
      deck = [];
      SUITS.forEach(function (s) { for (var r = 1; r <= 13; r++) deck.push({ s: s, r: r, up: false }); });
      deck = H.shuffle(deck);
      stock = deck.slice(0, 24);
      waste = [];
      found = { "♠": [], "♥": [], "♣": [], "♦": [] };
      cols = [];
      for (var i = 0; i < 7; i++) {
        var c = [];
        for (var j = 0; j <= i; j++) c.push(deck.pop());
        c[c.length - 1].up = true;
        cols.push(c);
      }
    }
    function init() { fresh(); sel = null; render(); }
    function label(card) { return card ? (card.r === 1 ? "A" : card.r === 11 ? "J" : card.r === 12 ? "Q" : card.r === 13 ? "K" : card.r) + card.s : ""; }
    function render() {
      board.innerHTML = "";
      var fwrap = document.createElement("div");
      fwrap.style.cssText = "display:flex;gap:8px";
      SUITS.forEach(function (s) {
        var slot = H.el("div", "cell", found[s].length ? label(found[s][found[s].length - 1]) : s);
        slot.style.cssText = "width:52px;height:72px;display:grid;place-items:center;font-size:14px";
        slot.dataset.f = s;
        slot.addEventListener("click", function () { toFound(s); });
        fwrap.appendChild(slot);
      });
      board.appendChild(fwrap);

      var stockEl = H.el("div", "cell", stock.length ? "牌堆 " + stock.length : "空");
      stockEl.style.cssText = "width:52px;height:72px;display:grid;place-items:center;font-size:11px;cursor:pointer";
      stockEl.addEventListener("click", function () {
        if (!stock.length) return;
        var c = stock.pop(); c.up = true; waste.push(c); render();
      });
      board.appendChild(stockEl);

      var wasteEl = H.el("div", "cell", waste.length ? label(waste[waste.length - 1]) : "弃牌");
      wasteEl.style.cssText = "width:52px;height:72px;display:grid;place-items:center;font-size:14px;cursor:pointer";
      wasteEl.addEventListener("click", function () {
        if (!waste.length) return;
        sel = { from: "waste" };
        render();
      });
      board.appendChild(wasteEl);

      cols.forEach(function (col, ci) {
        var cwrap = document.createElement("div");
        cwrap.style.cssText = "display:flex;flex-direction:column;gap:2px;min-width:56px";
        col.forEach(function (card, k) {
          var el = H.el("div", "cell", card.up ? label(card) : "?");
          el.style.cssText = "width:52px;height:36px;display:grid;place-items:center;font-size:13px;cursor:pointer";
          el.addEventListener("click", function () {
            if (!card.up) { if (k === col.length - 1) { card.up = true; render(); } return; }
            if (sel && sel.from === "waste" && k === col.length - 1) {
              var w = waste.pop();
              if (canStack(w, card)) { col.push(w); sel = null; render(); return; }
              waste.push(w);
            }
            sel = { from: "col", ci: ci, k: k };
            render();
          });
          cwrap.appendChild(el);
        });
        cwrap.addEventListener("click", function (e) {
          if (e.target !== cwrap) return;
          if (sel && sel.from === "waste") {
            var w = waste.pop();
            if (!cols[ci].length || (cols[ci][cols[ci].length - 1].up && canStack(w, cols[ci][cols[ci].length - 1]))) {
              cols[ci].push(w); sel = null; render();
            } else waste.push(w);
          }
        });
        board.appendChild(cwrap);
      });
    }
    function canStack(card, onto) {
      return onto.up && onto.r === card.r + 1 && isRed(onto.s) !== isRed(card.s);
    }
    function isRed(s) { return s === "♥" || s === "♦"; }
    function toFound(s) {
      if (sel && sel.from === "waste") {
        var w = waste.pop();
        var top = found[s][found[s].length - 1];
        if (w.s === s && (!top ? w.r === 1 : w.r === top.r + 1)) { found[s].push(w); sel = null; render(); return; }
        waste.push(w);
      }
    }
    init();
  };
})();
