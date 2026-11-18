/* Mornfrost 更多 · 小游戏（第一部分：1–12） */
(function () {
  "use strict";
  var MG = window.MG = window.MG || {};
  var root = document.getElementById("play");
  if (!root) return;

  /* ---------- 公共 ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function top(title) {
    var bar = el("div", "play-top");
    bar.appendChild(el("div", "play-score", title || ""));
    return bar;
  }
  function button(text, fn) {
    var b = el("button", "play-btn", text);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  }
  function note(text) { return el("p", "play-note", text); }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  MG._ = { el: el, top: top, button: button, note: note, store: store, shuffle: shuffle };

  /* ---------- 1 扫雷 ---------- */
  MG.minesweeper = function (host) {
    var N = 9, MINES = 10;
    var mine, open, flag, over;
    var bar = top();
    var score = bar.querySelector(".play-score");
    var reset = button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar);
    var grid = el("div", "board");
    grid.style.gridTemplateColumns = "repeat(" + N + ", 30px)";
    host.appendChild(grid);
    host.appendChild(note("左键翻开 / 右键插旗。翻开所有非雷格即胜。"));
    var cells = [];

    function init() {
      mine = []; open = []; flag = []; over = false;
      for (var i = 0; i < N * N; i++) { mine[i] = false; open[i] = false; flag[i] = false; }
      var placed = 0;
      while (placed < MINES) {
        var p = Math.floor(Math.random() * N * N);
        if (!mine[p]) { mine[p] = true; placed++; }
      }
      grid.innerHTML = "";
      cells = [];
      for (var k = 0; k < N * N; k++) {
        (function (k) {
          var c = el("button", "cell", "");
          c.type = "button";
          c.addEventListener("contextmenu", function (e) { e.preventDefault(); toggleFlag(k); });
          c.addEventListener("click", function () { reveal(k); });
          grid.appendChild(c);
          cells.push(c);
        })(k);
      }
      score.textContent = "剩余 " + MINES + " 旗";
    }

    function nb(i) {
      var x = i % N, y = Math.floor(i / N), out = [];
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        var nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < N && ny >= 0 && ny < N) out.push(ny * N + nx);
      }
      return out;
    }
    function count(i) { return nb(i).filter(function (j) { return mine[j]; }).length; }

    function toggleFlag(i) {
      if (over || open[i]) return;
      flag[i] = !flag[i];
      cells[i].classList.toggle("flag", flag[i]);
      cells[i].textContent = flag[i] ? "⚑" : "";
    }

    function reveal(i) {
      if (over || open[i] || flag[i]) return;
      if (mine[i]) { boom(); return; }
      var stack = [i];
      while (stack.length) {
        var k = stack.pop();
        if (open[k] || flag[k]) continue;
        open[k] = true;
        cells[k].classList.add("on");
        var n = count(k);
        cells[k].textContent = n ? String(n) : "";
        if (!n) nb(k).forEach(function (j) { if (!open[j]) stack.push(j); });
      }
      checkWin();
    }

    function boom() {
      over = true;
      for (var i = 0; i < N * N; i++) if (mine[i]) {
        cells[i].classList.add("hit");
        cells[i].textContent = "✹";
      }
      score.textContent = "踩雷了";
    }
    function checkWin() {
      var unopened = 0;
      for (var i = 0; i < N * N; i++) if (!open[i]) unopened++;
      if (unopened === MINES) {
        over = true;
        score.textContent = "清完了";
        for (var j = 0; j < N * N; j++) if (mine[j]) { cells[j].classList.add("flag"); cells[j].textContent = "⚑"; }
      }
    }
    init();
  };

  /* ---------- 2 2048 ---------- */
  MG.g2048 = function (host) {
    var N = 4, g, score, best = +(store("mg2048best") || 0), over;
    var bar = top();
    var s = el("span", "play-score", "分数 <b>0</b> · 最高 <b>" + best + "</b>");
    bar.appendChild(s);
    var reset = button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar);
    var grid = el("div", "board");
    grid.style.gridTemplateColumns = "repeat(4, 64px)";
    host.appendChild(grid);
    host.appendChild(note("方向键或 WASD 移动，相同数字合并。"));
    var cells = [];

    function init() {
      g = []; score = 0; over = false;
      for (var i = 0; i < N * N; i++) g[i] = 0;
      grid.innerHTML = ""; cells = [];
      for (var k = 0; k < N * N; k++) {
        var c = el("div", "cell", "");
        c.style.width = c.style.height = "64px";
        c.style.fontSize = "18px";
        grid.appendChild(c); cells.push(c);
      }
      spawn(); spawn(); draw();
    }
    function spawn() {
      var free = [];
      for (var i = 0; i < N * N; i++) if (!g[i]) free.push(i);
      if (!free.length) return;
      var p = free[Math.floor(Math.random() * free.length)];
      g[p] = Math.random() < 0.9 ? 2 : 4;
    }
    function draw() {
      for (var i = 0; i < N * N; i++) {
        var v = g[i];
        cells[i].textContent = v ? v : "";
        cells[i].classList.toggle("on", !!v);
        cells[i].style.background = v ? "rgba(127,233,224," + Math.min(0.55, 0.1 + Math.log2(v) * 0.06) + ")" : "";
      }
      s.innerHTML = "分数 <b>" + score + "</b> · 最高 <b>" + Math.max(best, score) + "</b>";
    }
    function move(dir) {
      if (over) return;
      var moved = false;
      for (var line = 0; line < N; line++) {
        var idx = [], i;
        for (i = 0; i < N; i++) {
          var k = dir === 0 ? line * N + i : dir === 1 ? line * N + (N - 1 - i) : dir === 2 ? i * N + line : (N - 1 - i) * N + line;
          idx.push(k);
        }
        var vals = idx.map(function (k) { return g[k]; }).filter(function (v) { return v; });
        var out = [];
        for (i = 0; i < vals.length; i++) {
          if (i + 1 < vals.length && vals[i] === vals[i + 1]) { out.push(vals[i] * 2); score += vals[i] * 2; i++; }
          else out.push(vals[i]);
        }
        while (out.length < N) out.push(0);
        idx.forEach(function (k, j) { if (g[k] !== out[j]) moved = true; g[k] = out[j]; });
      }
      if (moved) { spawn(); draw(); }
      if (g.indexOf(2048) !== -1) { over = true; host.appendChild(note("到 2048 了。")); }
      if (!canMove()) { over = true; if (score > best) { best = score; store("mg2048best", best); } }
    }
    function canMove() {
      for (var i = 0; i < N * N; i++) {
        if (!g[i]) return true;
        if (i % N < N - 1 && g[i] === g[i + 1]) return true;
        if (i + N < N * N && g[i] === g[i + N]) return true;
      }
      return false;
    }
    document.addEventListener("keydown", function (e) {
      if (!document.body.contains(grid)) return;
      var map = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3, a: 0, d: 1, w: 2, s: 3 };
      var d = map[e.key];
      if (d === undefined) return;
      e.preventDefault(); move(d);
    });
    init();
  };

  /* ---------- 3 贪吃蛇 ---------- */
  MG.snake = function (host) {
    var SIZE = 20, COLS = 18, rows = 18, cell = SIZE;
    var cv = el("canvas", "game-canvas");
    cv.width = COLS * cell; cv.height = rows * cell;
    var bar = top("得分 <b>0</b>");
    var reset = button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(note("方向键控制，吃到经验球变长。"));
    var ctx = cv.getContext("2d"), snake, dir, food, timer, score, alive;

    function init() {
      snake = [{ x: 9, y: 9 }, { x: 8, y: 9 }, { x: 7, y: 9 }];
      dir = { x: 1, y: 0 }; score = 0; alive = true;
      food = randFood();
      bar.querySelector(".play-score").innerHTML = "得分 <b>0</b>";
      clearInterval(timer);
      timer = setInterval(step, 120);
    }
    function randFood() {
      while (true) {
        var p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * rows) };
        if (!snake.some(function (s) { return s.x === p.x && s.y === p.y; })) return p;
      }
    }
    function step() {
      if (!alive) return;
      var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= rows ||
          snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
        alive = false; clearInterval(timer);
        bar.querySelector(".play-score").innerHTML = "结束 · 得分 <b>" + score + "</b>";
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) { score++; food = randFood(); bar.querySelector(".play-score").innerHTML = "得分 <b>" + score + "</b>"; }
      else snake.pop();
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "rgba(127,233,224,.2)";
      for (var i = 0; i < COLS; i++) for (var j = 0; j < rows; j++) if ((i + j) % 2 === 0) ctx.fillRect(i * cell, j * cell, cell, cell);
      ctx.fillStyle = "#a8f0ea";
      snake.forEach(function (s) { ctx.fillRect(s.x * cell + 2, s.y * cell + 2, cell - 4, cell - 4); });
      ctx.fillStyle = "#ffd166";
      ctx.beginPath(); ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, cell / 2 - 4, 0, Math.PI * 2); ctx.fill();
    }
    document.addEventListener("keydown", function (e) {
      var m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!m) return;
      e.preventDefault();
      if (m[0] === -dir.x && m[1] === -dir.y) return;
      dir = { x: m[0], y: m[1] };
    });
    init();
  };

  /* ---------- 4 俄罗斯方块 ---------- */
  MG.tetris = function (host) {
    var COLS = 10, ROWS = 20, cell = 22;
    var cv = el("canvas", "game-canvas");
    cv.width = COLS * cell; cv.height = ROWS * cell;
    var bar = top("分数 <b>0</b>");
    var reset = button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(note("← → 移动，↑ 旋转，↓ 加速，空格直落。"));
    var ctx = cv.getContext("2d"), grid, piece, score, timer, dead;
    var SHAPES = [
      [[1, 1, 1, 1]],
      [[1, 1], [1, 1]],
      [[0, 1, 0], [1, 1, 1]],
      [[1, 0, 0], [1, 1, 1]],
      [[0, 0, 1], [1, 1, 1]],
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1, 1], [1, 1, 0]]
    ];

    function init() {
      grid = [];
      for (var i = 0; i < ROWS; i++) grid.push(new Array(COLS).fill(0));
      score = 0; dead = false;
      bar.querySelector(".play-score").innerHTML = "分数 <b>0</b>";
      spawn();
      clearInterval(timer);
      timer = setInterval(function () { tick(); }, 420);
      draw();
    }
    function spawn() {
      var s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      piece = { x: Math.floor((COLS - s[0].length) / 2), y: 0, s: s };
      if (collide(piece.x, piece.y, piece.s)) { dead = true; clearInterval(timer); }
    }
    function collide(px, py, s) {
      for (var y = 0; y < s.length; y++) for (var x = 0; x < s[y].length; x++) {
        if (!s[y][x]) continue;
        var gx = px + x, gy = py + y;
        if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
        if (gy >= 0 && grid[gy][gx]) return true;
      }
      return false;
    }
    function merge() {
      piece.s.forEach(function (row, y) { row.forEach(function (v, x) { if (v) grid[piece.y + y][piece.x + x] = 1; }); });
      var cleared = 0;
      for (var y = ROWS - 1; y >= 0; y--) {
        if (grid[y].every(function (v) { return v; })) {
          grid.splice(y, 1); grid.unshift(new Array(COLS).fill(0)); cleared++; y++;
        }
      }
      if (cleared) { score += cleared * 100; bar.querySelector(".play-score").innerHTML = "分数 <b>" + score + "</b>"; }
      spawn();
    }
    function tick() {
      if (dead) return;
      if (!collide(piece.x, piece.y + 1, piece.s)) piece.y++;
      else merge();
      draw();
    }
    function rotate() {
      var s = piece.s, out = [];
      for (var x = 0; x < s[0].length; x++) {
        var row = [];
        for (var y = s.length - 1; y >= 0; y--) row.push(s[y][x]);
        out.push(row);
      }
      if (!collide(piece.x, piece.y, out)) piece.s = out;
    }
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
        if (!grid[y][x]) continue;
        ctx.fillStyle = "rgba(127,233,224,.55)";
        ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
      }
      if (piece) {
        ctx.fillStyle = "#a8f0ea";
        piece.s.forEach(function (row, y) { row.forEach(function (v, x) { if (v) ctx.fillRect((piece.x + x) * cell + 1, (piece.y + y) * cell + 1, cell - 2, cell - 2); }); });
      }
      if (dead) { ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(0, 0, cv.width, cv.height); }
    }
    document.addEventListener("keydown", function (e) {
      if (!document.body.contains(cv) || dead) return;
      if (e.key === "ArrowLeft" && !collide(piece.x - 1, piece.y, piece.s)) { piece.x--; e.preventDefault(); }
      if (e.key === "ArrowRight" && !collide(piece.x + 1, piece.y, piece.s)) { piece.x++; e.preventDefault(); }
      if (e.key === "ArrowDown") { tick(); e.preventDefault(); }
      if (e.key === "ArrowUp") { rotate(); e.preventDefault(); }
      if (e.key === " ") { while (!collide(piece.x, piece.y + 1, piece.s)) piece.y++; merge(); e.preventDefault(); }
      draw();
    });
    init();
  };

  /* ---------- 5 打砖块 ---------- */
  MG.breakout = function (host) {
    var W = 380, H = 300;
    var cv = el("canvas", "game-canvas");
    cv.width = W; cv.height = H;
    var bar = top("得分 <b>0</b>");
    var reset = button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(note("鼠标移动挡板，别让球落地。"));
    var ctx = cv.getContext("2d"), paddle, ball, bricks, score, dead;

    function init() {
      paddle = { x: W / 2 - 34, w: 68, h: 8, y: H - 18 };
      ball = { x: W / 2, y: H - 30, vx: 3, vy: -3, r: 5 };
      bricks = []; score = 0; dead = false;
      for (var y = 0; y < 4; y++) for (var x = 0; x < 6; x++)
        bricks.push({ x: 20 + x * 58, y: 24 + y * 22, w: 52, h: 16, alive: true });
      bar.querySelector(".play-score").innerHTML = "得分 <b>0</b>";
      loop();
    }
    function loop() {
      if (dead) return;
      ball.x += ball.vx; ball.y += ball.vy;
      if (ball.x < ball.r || ball.x > W - ball.r) ball.vx *= -1;
      if (ball.y < ball.r) ball.vy *= -1;
      if (ball.y > H) { dead = true; bar.querySelector(".play-score").innerHTML = "结束 · 得分 <b>" + score + "</b>"; draw(); return; }
      if (ball.y > paddle.y - ball.r && ball.x > paddle.x && ball.x < paddle.x + paddle.w) {
        ball.vy = -Math.abs(ball.vy);
        ball.vx = (ball.x - (paddle.x + paddle.w / 2)) * 0.12;
      }
      bricks.forEach(function (b) {
        if (!b.alive) return;
        if (ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
          b.alive = false; ball.vy *= -1; score += 10;
          bar.querySelector(".play-score").innerHTML = "得分 <b>" + score + "</b>";
        }
      });
      if (bricks.every(function (b) { return !b.alive; })) {
        dead = true; bar.querySelector(".play-score").innerHTML = "通关 · 得分 <b>" + score + "</b>";
      }
      draw();
      requestAnimationFrame(loop);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(127,233,224,.5)";
      bricks.forEach(function (b) { if (b.alive) ctx.fillRect(b.x, b.y, b.w, b.h); });
      ctx.fillStyle = "#a8f0ea";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
    }
    cv.addEventListener("mousemove", function (e) {
      var r = cv.getBoundingClientRect();
      paddle.x = Math.max(0, Math.min(W - paddle.w, (e.clientX - r.left) * (W / r.width) - paddle.w / 2));
    });
    init();
  };

  /* ---------- 6 记忆翻牌 ---------- */
  MG.memory = function (host) {
    var SYM = ["◆", "✦", "✧", "❋", "✺", "❂", "✹", "❖"];
    var cards, flipped, matched, moves, lock;
    var bar = top("步数 <b>0</b>");
    var reset = button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar);
    var grid = el("div", "board");
    grid.style.gridTemplateColumns = "repeat(4, 64px)";
    host.appendChild(grid);
    host.appendChild(note("翻开两张相同的图标，全部配对即胜。"));

    function init() {
      var vals = shuffle(SYM.concat(SYM));
      cards = []; flipped = []; matched = 0; moves = 0; lock = false;
      grid.innerHTML = "";
      bar.querySelector(".play-score").innerHTML = "步数 <b>0</b>";
      vals.forEach(function (v) {
        var c = el("button", "cell", "");
        c.type = "button";
        c.style.width = c.style.height = "64px";
        c.style.fontSize = "20px";
        c.dataset.v = v;
        c.addEventListener("click", function () { flip(c); });
        grid.appendChild(c);
        cards.push(c);
      });
    }
    function flip(c) {
      if (lock || c.classList.contains("on") || flipped.indexOf(c) !== -1) return;
      c.textContent = c.dataset.v;
      flipped.push(c);
      if (flipped.length === 2) {
        moves++;
        bar.querySelector(".play-score").innerHTML = "步数 <b>" + moves + "</b>";
        var a = flipped[0], b = flipped[1];
        if (a.dataset.v === b.dataset.v) {
          a.classList.add("on"); b.classList.add("on");
          flipped = []; matched++;
          if (matched === 8) bar.querySelector(".play-score").innerHTML = "完成 · 步数 <b>" + moves + "</b>";
        } else {
          lock = true;
          setTimeout(function () {
            a.textContent = ""; b.textContent = "";
            flipped = []; lock = false;
          }, 650);
        }
      }
    }
    init();
  };

  /* ---------- 7 拼图（3×3 滑块） ---------- */
  MG.slidepuzzle = function (host) {
    var N = 3, vals, blank, moves;
    var bar = top("步数 <b>0</b>");
    var reset = button("打乱", init);
    bar.appendChild(reset);
    host.appendChild(bar);
    var grid = el("div", "board");
    grid.style.gridTemplateColumns = "repeat(3, 72px)";
    host.appendChild(grid);
    host.appendChild(note("点相邻的方块与空格交换，把 1–8 按顺序排好。"));

    function init() {
      vals = [1, 2, 3, 4, 5, 6, 7, 8, 0];
      blank = 8; moves = 0;
      for (var i = 0; i < 300; i++) {
        var nb = neighbours(blank);
        var pick = nb[Math.floor(Math.random() * nb.length)];
        swap(pick, blank, true);
      }
      if (isSolved()) init();
      render();
    }
    function neighbours(i) {
      var x = i % N, y = Math.floor(i / N), out = [];
      if (x > 0) out.push(i - 1);
      if (x < N - 1) out.push(i + 1);
      if (y > 0) out.push(i - N);
      if (y < N - 1) out.push(i + N);
      return out;
    }
    function swap(a, b, quiet) {
      var t = vals[a]; vals[a] = vals[b]; vals[b] = t;
      if (a === blank) blank = b; else if (b === blank) blank = a;
      if (!quiet) { moves++; bar.querySelector(".play-score").innerHTML = "步数 <b>" + moves + "</b>"; render(); }
    }
    function isSolved() { for (var i = 0; i < 8; i++) if (vals[i] !== i + 1) return false; return true; }
    function render() {
      grid.innerHTML = "";
      vals.forEach(function (v, i) {
        var c = el("button", "cell", v ? String(v) : "");
        c.type = "button";
        c.style.width = c.style.height = "72px";
        c.style.fontSize = "18px";
        if (!v) c.style.visibility = "hidden";
        c.addEventListener("click", function () {
          if (neighbours(blank).indexOf(i) === -1) return;
          swap(i, blank, false);
          if (isSolved()) bar.querySelector(".play-score").innerHTML = "完成 · 步数 <b>" + moves + "</b>";
        });
        grid.appendChild(c);
      });
    }
    init();
  };

  /* ---------- 8 挖矿点击器 ---------- */
  MG.clicker = function (host) {
    var count = +(store("mgclicker") || 0);
    var bar = top("总挖掘 <b>" + count + "</b>");
    var reset = button("清零", function () { count = 0; store("mgclicker", 0); bar.querySelector(".play-score").innerHTML = "总挖掘 <b>0</b>"; });
    bar.appendChild(reset);
    host.appendChild(bar);
    var big = el("button", "play-btn", "挖方块");
    big.type = "button";
    big.style.cssText = "display:block;margin:24px auto;padding:32px 48px;font-size:16px";
    big.addEventListener("click", function () {
      count++; store("mgclicker", count);
      bar.querySelector(".play-score").innerHTML = "总挖掘 <b>" + count + "</b>";
    });
    host.appendChild(big);
    host.appendChild(note("点一下就挖一块，数字存在浏览器本地。"));
  };

  /* ---------- 9 五子棋 ---------- */
  MG.gomoku = function (host) {
    var N = 15, turn = 1, over;
    var bar = top("轮到 <b>黑</b>");
    var reset = button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar);
    var grid = el("div", "board");
    grid.style.gridTemplateColumns = "repeat(15, 26px)";
    host.appendChild(grid);
    host.appendChild(note("同屏双人，五连即胜。黑先。"));
    var g, cells;

    function init() {
      g = []; over = false; turn = 1;
      grid.innerHTML = ""; cells = [];
      bar.querySelector(".play-score").innerHTML = "轮到 <b>黑</b>";
      for (var i = 0; i < N * N; i++) {
        (function (i) {
          var c = el("button", "cell", "");
          c.type = "button";
          c.style.width = c.style.height = "26px";
          c.addEventListener("click", function () { place(i); });
          grid.appendChild(c);
          cells.push(c);
        })(i);
      }
    }
    function place(i) {
      if (over || g[i]) return;
      g[i] = turn;
      cells[i].textContent = turn === 1 ? "●" : "○";
      cells[i].style.color = turn === 1 ? "#0b1216" : "#e8f0f2";
      if (win(i, turn)) {
        over = true;
        bar.querySelector(".play-score").innerHTML = (turn === 1 ? "黑" : "白") + "胜";
        return;
      }
      turn = 3 - turn;
      bar.querySelector(".play-score").innerHTML = "轮到 <b>" + (turn === 1 ? "黑" : "白") + "</b>";
    }
    function win(i, p) {
      var x = i % N, y = Math.floor(i / N);
      var dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
      return dirs.some(function (d) {
        var c = 1;
        for (var s = 1; s <= 4; s++) { var nx = x + d[0] * s, ny = y + d[1] * s; if (nx < 0 || ny < 0 || nx >= N || ny >= N || g[ny * N + nx] !== p) break; c++; }
        for (var s2 = 1; s2 <= 4; s2++) { var nx2 = x - d[0] * s2, ny2 = y - d[1] * s2; if (nx2 < 0 || ny2 < 0 || nx2 >= N || ny2 >= N || g[ny2 * N + nx2] !== p) break; c++; }
        return c >= 5;
      });
    }
    init();
  };

  /* ---------- 10 井字棋 ---------- */
  MG.tictactoe = function (host) {
    var g, over;
    var bar = top("你执 X，先手");
    var reset = button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar);
    var grid = el("div", "board");
    grid.style.gridTemplateColumns = "repeat(3, 72px)";
    host.appendChild(grid);
    host.appendChild(note("三连即胜。AI 会挡你的下一手。"));

    function init() {
      g = ["", "", "", "", "", "", "", "", ""]; over = false;
      grid.innerHTML = "";
      bar.querySelector(".play-score").textContent = "你执 X，先手";
      g.forEach(function (_, i) {
        var c = el("button", "cell", "");
        c.type = "button";
        c.style.width = c.style.height = "72px";
        c.style.fontSize = "24px";
        c.addEventListener("click", function () { play(i, c); });
        grid.appendChild(c);
      });
    }
    function play(i, c) {
      if (over || g[i]) return;
      set(i, "X", c);
      if (done("X")) return;
      var mv = best();
      if (mv < 0) return;
      set(mv, "O", grid.children[mv]);
      if (done("O")) return;
    }
    function set(i, v, c) { g[i] = v; c.textContent = v; }
    function best() {
      for (var i = 0; i < 9; i++) if (!g[i]) { g[i] = "O"; if (wins("O")) { g[i] = ""; return i; } g[i] = ""; }
      for (var j = 0; j < 9; j++) if (!g[j]) { g[j] = "X"; if (wins("X")) { g[j] = ""; return j; } g[j] = ""; }
      var mid = 4; if (!g[mid]) return mid;
      var free = []; for (var k = 0; k < 9; k++) if (!g[k]) free.push(k);
      return free.length ? free[Math.floor(Math.random() * free.length)] : -1;
    }
    function wins(p) {
      var L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
      return L.some(function (l) { return l.every(function (i) { return g[i] === p; }); });
    }
    function done(last) {
      if (wins(last)) { over = true; bar.querySelector(".play-score").textContent = last === "X" ? "你赢了" : "AI 赢了"; return true; }
      if (g.every(function (v) { return v; })) { over = true; bar.querySelector(".play-score").textContent = "平局"; return true; }
      return false;
    }
    init();
  };

  /* ---------- 11 石头剪刀布 ---------- */
  MG.rps = function (host) {
    var win = 0, lose = 0, draw = 0;
    var bar = top("胜 0 · 负 0 · 平 0");
    host.appendChild(bar);
    var row = el("div");
    row.style.cssText = "display:flex;gap:10px;justify-content:center;margin:18px 0";
    host.appendChild(row);
    var out = el("p", "play-note", "选一个出。");
    host.appendChild(out);
    var MAP = { "石头": 0, "剪刀": 1, "布": 2 };
    Object.keys(MAP).forEach(function (k) {
      var b = button(k, function () {
        var me = MAP[k], ai = Math.floor(Math.random() * 3);
        var res = me === ai ? "平" : ((me - ai + 3) % 3 === 1 ? "你赢" : "你输");
        if (res === "你赢") win++; else if (res === "你输") lose++; else draw++;
        bar.querySelector(".play-score").textContent = "胜 " + win + " · 负 " + lose + " · 平 " + draw;
        out.textContent = "你出" + k + "，对手出" + ["石头", "剪刀", "布"][ai] + " —— " + res;
      });
      row.appendChild(b);
    });
  };

  /* ---------- 12 24 点 ---------- */
  MG.twentyfour = function (host) {
    var PRESETS = [[3, 3, 8, 8], [1, 5, 5, 5], [2, 3, 4, 6], [1, 2, 7, 9], [4, 4, 10, 10], [3, 6, 6, 10], [5, 5, 5, 1]];
    var nums, solved;
    var bar = top("四个数凑 24");
    var reset = button("换一组", init);
    bar.appendChild(reset);
    host.appendChild(bar);
    var show = el("p", "play-score", "");
    show.style.cssText = "font-size:20px;letter-spacing:.2em;text-align:center;margin:18px 0";
    host.appendChild(show);
    var input = el("input", "play-input");
    input.placeholder = "例如 (3+3)*8/2";
    input.style.cssText = "display:block;width:100%;max-width:420px;margin:0 auto";
    host.appendChild(input);
    var row = el("div");
    row.style.cssText = "display:flex;gap:10px;justify-content:center;margin:14px 0";
    var out = note("用 + - * / 和括号，四个数各用一次。");
    var check = button("验证", function () {
      var expr = input.value.replace(/[^0-9+\-*/().\s]/g, "");
      var val;
      try { val = Function('"use strict";return (' + expr + ')')(); } catch (e) { out.textContent = "算式写错了。"; return; }
      if (typeof val !== "number" || !isFinite(val)) { out.textContent = "算式写错了。"; return; }
      if (Math.abs(val - 24) > 1e-6) { out.textContent = "结果是 " + Math.round(val * 100) / 100 + "，不是 24。"; return; }
      var used = expr.match(/\d+/g) || [];
      var a = used.map(Number).sort(function (x, y) { return x - y; });
      var b = nums.slice().sort(function (x, y) { return x - y; });
      out.textContent = a.join(",") === b.join(",") ? "对，四个数都用上了。" : "结果对，但没用上给出的四个数。";
    });
    row.appendChild(check);
    host.appendChild(row);
    host.appendChild(out);

    function init() {
      nums = PRESETS[Math.floor(Math.random() * PRESETS.length)].slice();
      show.textContent = nums.join("  ");
      input.value = "";
      out.textContent = "用 + - * / 和括号，四个数各用一次。";
    }
    init();
  };
})();
