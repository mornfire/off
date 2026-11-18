/* Mornfrost 更多 · 小游戏（第二部分：13–25） */
(function () {
  "use strict";
  var MG = window.MG = window.MG || {};
  var root = document.getElementById("play");
  if (!root) return;
  var H = MG._;

  /* ---------- 13 数独 ---------- */
  MG.sudoku = function (host) {
    var PUZZLES = {
      "简单": "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
      "中等": "000260701680070090190004500820100040004602900050003028009300074040050036703018000",
      "困难": "005300000800000020070010500400005300010070006003200080060500009004000030000009700"
    };
    var current = "简单", given = [], inputs = [];
    var bar = H.top();
    var sel = document.createElement("select");
    sel.className = "play-select";
    Object.keys(PUZZLES).forEach(function (k) {
      var o = document.createElement("option"); o.value = k; o.textContent = k; sel.appendChild(o);
    });
    sel.addEventListener("change", function () { current = sel.value; init(); });
    bar.appendChild(sel);
    var check = H.button("检查", verify);
    bar.appendChild(check);
    host.appendChild(bar);
    var grid = H.el("div", "board");
    grid.style.gridTemplateColumns = "repeat(9, 36px)";
    host.appendChild(grid);
    host.appendChild(H.note("在空格里填 1–9，每行每列每宫不重复。"));

    function init() {
      var src = PUZZLES[current];
      given = src.split("").map(function (c) { return c !== "0"; });
      grid.innerHTML = ""; inputs = [];
      for (var i = 0; i < 81; i++) {
        var v = src[i];
        var cell = document.createElement("input");
        cell.className = "cell";
        cell.style.cssText = "width:36px;height:36px;text-align:center;font-size:14px;padding:0";
        cell.maxLength = 1;
        cell.value = v === "0" ? "" : v;
        cell.dataset.i = i;
        if (v !== "0") { cell.readOnly = true; cell.style.opacity = ".7"; }
        cell.addEventListener("input", function (e) {
          var val = e.target.value.replace(/[^1-9]/g, "");
          e.target.value = val;
        });
        grid.appendChild(cell); inputs.push(cell);
      }
    }
    function verify() {
      var nums = inputs.map(function (c) { return +(c.value || 0); });
      for (var i = 0; i < 81; i++) {
        if (!nums[i]) { H.note("还有空格没填完。"); return; }
      }
      var ok = true;
      for (var r = 0; r < 9; r++) {
        var row = {}, col = {};
        for (var c2 = 0; c2 < 9; c2++) {
          row[nums[r * 9 + c2]] = 1; col[nums[c2 * 9 + r]] = 1;
        }
        if (Object.keys(row).length !== 9 || Object.keys(col).length !== 9) ok = false;
      }
      for (var by = 0; by < 3; by++) for (var bx = 0; bx < 3; bx++) {
        var box = {};
        for (var y = 0; y < 3; y++) for (var x = 0; x < 3; x++) box[nums[(by * 3 + y) * 9 + bx * 3 + x]] = 1;
        if (Object.keys(box).length !== 9) ok = false;
      }
      bar.querySelector(".play-score").textContent = ok ? "全对" : "有重复，再检查一下";
    }
    bar.appendChild(H.el("div", "play-score", ""));
    init();
  };

  /* ---------- 14 华容道 ---------- */
  MG.klotski = function (host) {
    var N = 4;
    var pieces = [
      { x: 0, y: 0, w: 2, h: 2, id: "target", label: "目标" },
      { x: 2, y: 0, w: 1, h: 1, label: "A" },
      { x: 3, y: 0, w: 1, h: 1, label: "B" },
      { x: 2, y: 1, w: 1, h: 2, label: "C" },
      { x: 0, y: 2, w: 1, h: 1, label: "D" },
      { x: 1, y: 2, w: 1, h: 1, label: "E" },
      { x: 0, y: 3, w: 2, h: 1, label: "F" }
    ];
    var bar = H.top("把目标移到右下角");
    var reset = H.button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar);
    var board = document.createElement("div");
    board.style.cssText = "position:relative;width:240px;height:240px;margin:10px auto;background:rgba(0,0,0,.25);border-radius:10px;border:1px solid rgba(255,255,255,.12)";
    host.appendChild(board);
    host.appendChild(H.note("点方块，它会朝空格方向滑动一格。"));

    function init() {
      pieces = [
        { x: 0, y: 0, w: 2, h: 2, id: "target", label: "目标" },
        { x: 2, y: 0, w: 1, h: 1, label: "A" },
        { x: 3, y: 0, w: 1, h: 1, label: "B" },
        { x: 2, y: 1, w: 1, h: 2, label: "C" },
        { x: 0, y: 2, w: 1, h: 1, label: "D" },
        { x: 1, y: 2, w: 1, h: 1, label: "E" },
        { x: 0, y: 3, w: 2, h: 1, label: "F" }
      ];
      bar.querySelector(".play-score").textContent = "把目标移到右下角";
      render();
    }
    function occupied(except) {
      var m = {};
      pieces.forEach(function (p) {
        if (p === except) return;
        for (var y = 0; y < p.h; y++) for (var x = 0; x < p.w; x++) m[(p.y + y) * N + (p.x + x)] = 1;
      });
      return m;
    }
    function canMove(p, dx, dy) {
      var nx = p.x + dx, ny = p.y + dy;
      if (nx < 0 || ny < 0 || nx + p.w > N || ny + p.h > N) return false;
      var m = occupied(p);
      for (var y = 0; y < p.h; y++) for (var x = 0; x < p.w; x++) if (m[(ny + y) * N + (nx + x)]) return false;
      return true;
    }
    function render() {
      board.innerHTML = "";
      pieces.forEach(function (p) {
        var d = document.createElement("button");
        d.type = "button";
        d.textContent = p.label;
        d.style.cssText = "position:absolute;cursor:pointer;border-radius:8px;font-family:var(--mono);font-size:11px;color:#0b1216;" +
          "background:" + (p.id === "target" ? "rgba(127,233,224,.85)" : "rgba(255,255,255,.35)") + ";" +
          "border:1px solid rgba(255,255,255,.35);" +
          "left:" + (p.x * 60 + 3) + "px;top:" + (p.y * 60 + 3) + "px;width:" + (p.w * 60 - 6) + "px;height:" + (p.h * 60 - 6) + "px";
        d.addEventListener("click", function () {
          [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (dir) {
            if (canMove(p, dir[0], dir[1])) { p.x += dir[0]; p.y += dir[1]; render(); check(); return true; }
            return false;
          });
        });
        board.appendChild(d);
      });
    }
    function check() {
      var t = pieces.filter(function (p) { return p.id === "target"; })[0];
      if (t.x === 2 && t.y === 2) bar.querySelector(".play-score").textContent = "出来了";
    }
    init();
  };

  /* ---------- 15 推箱子 ---------- */
  MG.sokoban = function (host) {
    var LEVELS = [
      ["#####", "#@  #", "# $ #", "#  .#", "#####"],
      ["#######", "#@    #", "# $ $ #", "# . . #", "#######"],
      ["########", "#@     #", "# $ $  #", "# .  . #", "#  $ . #", "########"]
    ];
    var level = 0, map, px, py;
    var bar = H.top("第 1 关");
    var reset = H.button("重开", function () { load(level); });
    var next = H.button("下一关", function () { level = (level + 1) % LEVELS.length; load(level); });
    bar.appendChild(reset); bar.appendChild(next);
    host.appendChild(bar);
    var grid = H.el("div", "board");
    host.appendChild(grid);
    host.appendChild(H.note("方向键移动，把每个箱子推到目标点上。"));

    function load(i) {
      map = LEVELS[i].map(function (r) { return r.split(""); });
      level = i;
      bar.querySelector(".play-score").textContent = "第 " + (i + 1) + " 关";
      map.forEach(function (row, y) { row.forEach(function (c, x) { if (c === "@") { px = x; py = y; } }); });
      render();
    }
    function render() {
      grid.style.gridTemplateColumns = "repeat(" + map[0].length + ", 32px)";
      grid.innerHTML = "";
      map.forEach(function (row) {
        row.forEach(function (c) {
          var ch = c === "#" ? "" : c === "$" ? "▣" : c === "." ? "•" : c === "@" ? "☻" : c === "*" ? "▣" : c === "+" ? "☻" : "";
          var cell = H.el("div", "cell", ch);
          if (c === "#") cell.style.background = "rgba(255,255,255,.16)";
          if (c === "." || c === "*" || c === "+") cell.style.background = "rgba(127,233,224,.18)";
          grid.appendChild(cell);
        });
      });
    }
    function move(dx, dy) {
      var nx = px + dx, ny = py + dy;
      var t = map[ny] && map[ny][nx];
      if (!t || t === "#") return;
      if (t === "$" || t === "*") {
        var bx = nx + dx, by = ny + dy;
        var bt = map[by] && map[by][bx];
        if (!bt || bt === "#" || bt === "$" || bt === "*") return;
        map[ny][nx] = map[ny][nx] === "$" ? " " : ".";
        map[by][bx] = bt === "." ? "*" : "$";
      }
      map[py][px] = map[py][px] === "+" ? "." : " ";
      px = nx; py = ny;
      map[py][px] = map[py][px] === "." ? "+" : "@";
      render();
      if (map.every(function (row) { return row.every(function (c) { return c !== "$"; }); })) {
        bar.querySelector(".play-score").textContent = "第 " + (level + 1) + " 关通过";
      }
    }
    document.addEventListener("keydown", function (e) {
      var d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (!d) return;
      e.preventDefault(); move(d[0], d[1]);
    });
    load(0);
  };

  /* ---------- 16 迷宫 ---------- */
  MG.maze = function (host) {
    var N = 15, cell = 22;
    var cv = H.el("canvas", "game-canvas");
    cv.width = N * cell; cv.height = N * cell;
    var bar = H.top("计时 <b>0.0s</b>");
    var reset = H.button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("方向键走迷宫，到右下角结束计时。"));
    var ctx = cv.getContext("2d"), grid, px, py, t0, timer, done;

    function init() {
      grid = [];
      for (var y = 0; y < N; y++) {
        grid.push([]);
        for (var x = 0; x < N; x++) grid[y].push(1);
      }
      carve(1, 1);
      px = 1; py = 1; done = false;
      t0 = Date.now();
      clearInterval(timer);
      timer = setInterval(function () {
        if (!done) bar.querySelector(".play-score").innerHTML = "计时 <b>" + ((Date.now() - t0) / 1000).toFixed(1) + "s</b>";
      }, 100);
      draw();
    }
    function carve(x, y) {
      grid[y][x] = 0;
      var dirs = H.shuffle([[2, 0], [-2, 0], [0, 2], [0, -2]]);
      dirs.forEach(function (d) {
        var nx = x + d[0], ny = y + d[1];
        if (nx > 0 && ny > 0 && nx < N - 1 && ny < N - 1 && grid[ny][nx] === 1) {
          grid[y + d[1] / 2][x + d[0] / 2] = 0;
          carve(nx, ny);
        }
      });
    }
    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        ctx.fillStyle = grid[y][x] ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.0)";
        if (!grid[y][x]) continue;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
      ctx.fillStyle = "#a8f0ea";
      ctx.fillRect(px * cell + 3, py * cell + 3, cell - 6, cell - 6);
      ctx.fillStyle = "rgba(127,233,224,.5)";
      ctx.fillRect((N - 2) * cell + 3, (N - 2) * cell + 3, cell - 6, cell - 6);
    }
    function move(dx, dy) {
      if (done) return;
      var nx = px + dx, ny = py + dy;
      if (!grid[ny] || grid[ny][nx] !== 0) return;
      px = nx; py = ny; draw();
      if (px === N - 2 && py === N - 2) {
        done = true; clearInterval(timer);
        bar.querySelector(".play-score").innerHTML = "通关 <b>" + ((Date.now() - t0) / 1000).toFixed(1) + "s</b>";
      }
    }
    document.addEventListener("keydown", function (e) {
      var d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (!d) return;
      e.preventDefault(); move(d[0], d[1]);
    });
    init();
  };

  /* ---------- 17 打字游戏 ---------- */
  MG.typing = function (host) {
    var WORDS = ["Mornfrost Achievements", "SoulGlyph", "Soulbound Blades", "Arsenal", "Echoes of the Unbound",
      "Forge of Ascension", "MemoryMaster", "BanItemBlock", "Enchantment Remover", "Per-Dimension Respawn",
      "Login Mod", "Kill Inspector", "OreGuard", "SQDCLib", "Ymondf"];
    var idx = 0, typed = 0, correct = 0, t0 = 0, running = false;
    var bar = H.top("WPM <b>0</b> · 准确率 <b>100%</b>");
    var reset = H.button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar);
    var show = H.el("p", "play-score", "");
    show.style.cssText = "font-size:19px;text-align:center;margin:18px 0;letter-spacing:.02em";
    host.appendChild(show);
    var input = H.el("input", "play-input");
    input.placeholder = "照着上面输入，回车提交";
    input.style.cssText = "display:block;width:100%;max-width:460px;margin:0 auto";
    host.appendChild(input);
    host.appendChild(H.note("输完一个词按回车，下一个立刻出现。"));

    function init() {
      idx = 0; typed = 0; correct = 0; t0 = 0; running = false;
      input.value = "";
      bar.querySelector(".play-score").innerHTML = "WPM <b>0</b> · 准确率 <b>100%</b>";
      show.textContent = WORDS[0];
    }
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      if (!running) { running = true; t0 = Date.now(); }
      var target = WORDS[idx];
      var v = input.value;
      typed += target.length;
      if (v === target) correct += target.length;
      input.value = "";
      idx++;
      if (idx >= WORDS.length) {
        running = false;
        var mins = Math.max((Date.now() - t0) / 60000, 0.01);
        var wpm = Math.round((correct / 5) / mins);
        bar.querySelector(".play-score").innerHTML = "完成 · WPM <b>" + wpm + "</b> · 准确率 <b>" +
          Math.round((correct / typed) * 100) + "%</b>";
        show.textContent = "再来一次？按重开";
        return;
      }
      show.textContent = WORDS[idx];
      var mins2 = Math.max((Date.now() - t0) / 60000, 0.01);
      bar.querySelector(".play-score").innerHTML = "WPM <b>" + Math.round((correct / 5) / mins2) + "</b> · 准确率 <b>" +
        (typed ? Math.round((correct / typed) * 100) : 100) + "%</b>";
    });
    init();
  };

  /* ---------- 18 音游 ---------- */
  MG.rhythm = function (host) {
    var W = 360, H2 = 420, lanes = 4, laneW = W / lanes;
    var cv = H.el("canvas", "game-canvas");
    cv.width = W; cv.height = H2;
    var bar = H.top("得分 <b>0</b> · 连击 <b>0</b>");
    var reset = H.button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("用 D F J K 击打落到底线的音符。"));
    var ctx = cv.getContext("2d"), notes, score, combo, running, lastSpawn, audio;

    function beep(freq) {
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        var o = audio.createOscillator(), g = audio.createGain();
        o.frequency.value = freq; o.type = "sine";
        g.gain.value = 0.08;
        o.connect(g); g.connect(audio.destination);
        o.start(); o.stop(audio.currentTime + 0.08);
      } catch (e) {}
    }
    function init() {
      notes = []; score = 0; combo = 0; running = true; lastSpawn = 0;
      bar.querySelector(".play-score").innerHTML = "得分 <b>0</b> · 连击 <b>0</b>";
      requestAnimationFrame(loop);
    }
    function loop(t) {
      if (!running) return;
      if (t - lastSpawn > 620) {
        lastSpawn = t;
        notes.push({ lane: Math.floor(Math.random() * lanes), y: -20, hit: false });
      }
      notes.forEach(function (n) { if (!n.hit) n.y += 3.4; });
      notes = notes.filter(function (n) { return n.y < H2 + 30 && !n.hit; });
      draw();
      requestAnimationFrame(loop);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H2);
      for (var i = 1; i < lanes; i++) {
        ctx.fillStyle = "rgba(255,255,255,.10)";
        ctx.fillRect(i * laneW, 0, 1, H2);
      }
      ctx.fillStyle = "rgba(127,233,224,.16)";
      ctx.fillRect(0, H2 - 70, W, 70);
      notes.forEach(function (n) {
        ctx.fillStyle = "rgba(168,240,234,.9)";
        ctx.fillRect(n.lane * laneW + 8, n.y, laneW - 16, 8);
      });
    }
    function hit(lane) {
      var best = null;
      notes.forEach(function (n) {
        if (n.lane !== lane || n.hit) return;
        if (Math.abs(n.y - (H2 - 34)) < 40 && (!best || n.y > best.y)) best = n;
      });
      if (best) {
        best.hit = true; score += 10; combo++;
        beep(520 + combo * 12);
      } else {
        combo = 0;
        beep(180);
      }
      bar.querySelector(".play-score").innerHTML = "得分 <b>" + score + "</b> · 连击 <b>" + combo + "</b>";
    }
    document.addEventListener("keydown", function (e) {
      var map = { d: 0, f: 1, j: 2, k: 3 };
      var lane = map[e.key.toLowerCase()];
      if (lane === undefined) return;
      e.preventDefault(); hit(lane);
    });
    init();
  };

  /* ---------- 19 反应测试 ---------- */
  MG.reaction = function (host) {
    var bar = H.top("最佳 <b>—</b>");
    var best = +(H.store("mgreaction") || 0);
    if (best) bar.querySelector(".play-score").innerHTML = "最佳 <b>" + best + " ms</b>";
    host.appendChild(bar);
    var pad = H.el("button", "play-btn", "点这里开始");
    pad.type = "button";
    pad.style.cssText = "display:block;width:100%;height:180px;font-size:16px;margin:10px 0";
    host.appendChild(pad);
    var out = H.note("灯变亮时立刻点击，测你的反应时间。");
    host.appendChild(out);
    var state = "idle", t0 = 0, timer = 0;

    pad.addEventListener("click", function () {
      if (state === "idle") {
        state = "wait";
        pad.textContent = "等…";
        pad.style.background = "rgba(255,255,255,.06)";
        out.textContent = "别急着点，等它变亮。";
        timer = setTimeout(function () {
          state = "go";
          pad.textContent = "点！";
          pad.style.background = "rgba(127,233,224,.55)";
          t0 = performance.now();
        }, 900 + Math.random() * 1800);
      } else if (state === "wait") {
        clearTimeout(timer);
        state = "idle";
        pad.textContent = "点这里开始";
        pad.style.background = "";
        out.textContent = "抢跑，重来。";
      } else {
        var ms = Math.round(performance.now() - t0);
        state = "idle";
        pad.textContent = "再来一次";
        pad.style.background = "";
        out.textContent = "反应时间 " + ms + " ms";
        if (!best || ms < best) {
          best = ms; H.store("mgreaction", ms);
          bar.querySelector(".play-score").innerHTML = "最佳 <b>" + ms + " ms</b>";
        }
      }
    });
  };

  /* ---------- 20 猜数字 ---------- */
  MG.guessnumber = function (host) {
    var target = Math.floor(Math.random() * 100) + 1, tries = 0;
    var bar = H.top("剩余 <b>8</b> 次");
    var reset = H.button("重开", function () { target = Math.floor(Math.random() * 100) + 1; tries = 0; input.value = ""; bar.querySelector(".play-score").innerHTML = "剩余 <b>8</b> 次"; out.textContent = "1 到 100，猜吧。"; });
    bar.appendChild(reset);
    host.appendChild(bar);
    var input = H.el("input", "play-input");
    input.placeholder = "1–100";
    input.style.cssText = "display:block;width:160px;margin:16px auto";
    host.appendChild(input);
    var go = H.button("猜", guess);
    go.style.cssText = "display:block;margin:0 auto";
    host.appendChild(go);
    var out = H.note("1 到 100，猜吧。");
    host.appendChild(out);

    function guess() {
      var v = parseInt(input.value, 10);
      if (!v || v < 1 || v > 100) { out.textContent = "填 1 到 100 的整数。"; return; }
      tries++;
      if (v === target) { out.textContent = "对了，用了 " + tries + " 次。"; return; }
      if (tries >= 8) { out.textContent = "没机会了，答案是 " + target + "。"; return; }
      out.textContent = v < target ? "小了。" : "大了。";
      bar.querySelector(".play-score").innerHTML = "剩余 <b>" + (8 - tries) + "</b> 次";
    }
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") guess(); });
  };

  /* ---------- 21 猜模组 ---------- */
  MG.guessmod = function (host) {
    var POOL = [
      ["三百多条成就，正经的和不正经的都有", "Mornfrost Achievements"],
      ["Curios 饰品槽位驱动的铭文系统", "SoulGlyph 灵铭"],
      ["二十把剑，谜语、试炼、进化", "Soulbound Blades 缚魂之刃"],
      ["六种矿物、二十九类武器、七十二件护甲", "Arsenal"],
      ["五个破碎维度与一条告别写成的主线", "Echoes of the Unbound"],
      ["两件同等级装备融合强化，失败全损", "Forge of Ascension"],
      ["游戏语言是中文就能飞", "中国人能飞"],
      ["档案袋叙事与月相竞技场", "Ymondf 月神"],
      ["七个模块的服务端内存优化", "MemoryMaster"],
      ["按配置全量清除指定方块与物品", "BanItemBlock"],
      ["彻底删除指定附魔", "Enchantment Remover"],
      ["让每个维度各记各的出生点", "Per-Dimension Respawn"],
      ["服务端的登录注册与冻结", "Login Mod"],
      ["查询最近一次玩家击杀", "KIPL · Kill Inspector"],
      ["纯服务端的反矿透", "OreGuard"],
      ["只读查看玩家背包与末影箱", "Let Me Look Look You"],
      ["给 Jake's Economy 加阵营商店分区", "FactionZones"],
      ["世界生成时清除帕拉迪岛传送门", "DeletePortal"],
      ["叙事向模组的公共前置库", "SQDCLib"],
      ["修复 Sodium 下 nvidium/voxy 的着色器加载", "Fix sodium ShaderLoader"]
    ];
    var round = 0, score = 0;
    var bar = H.top("得分 <b>0</b>");
    host.appendChild(bar);
    var q = H.el("p", "play-score", "");
    q.style.cssText = "font-size:15px;line-height:1.9;margin:14px 0";
    host.appendChild(q);
    var opts = H.el("div");
    opts.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px";
    host.appendChild(opts);
    var out = H.note("");
    host.appendChild(out);

    function ask() {
      var pick = H.shuffle(POOL.slice())[0];
      var others = H.shuffle(POOL.filter(function (p) { return p[1] !== pick[1]; }));
      var choices = H.shuffle([pick].concat(others.slice(0, 3)));
      q.textContent = "「" + pick[0] + "」是哪个模组？";
      opts.innerHTML = "";
      choices.forEach(function (c) {
        var b = H.button(c[1], function () {
          if (c[1] === pick[1]) { score++; out.textContent = "对了。"; }
          else out.textContent = "不对，是「" + pick[1] + "」。";
          bar.querySelector(".play-score").innerHTML = "得分 <b>" + score + "</b> · 第 " + round + " 题";
          round++; setTimeout(ask, 700);
        });
        opts.appendChild(b);
      });
    }
    ask();
  };

  /* ---------- 22 猜合成表 ---------- */
  MG.guessrecipe = function (host) {
    var QS = [
      ["9 个铁锭", ["铁块", "铁门", "铁砧", "铁轨"], 0],
      ["4 个木板", ["工作台", "箱子", "木棍", "木门"], 0],
      ["3 个木板 + 2 个木棍", ["木镐", "木剑", "木斧", "木锹"], 1],
      ["8 个圆石", ["熔炉", "石砖", "石台阶", "石墙"], 0],
      ["4 个铁锭 + 1 个红石", ["指南针", "时钟", "铁轨", "活塞"], 1],
      ["6 个木板 + 1 本书", ["书架", "讲台", "附魔台", "箱子"], 0],
      ["4 个黑曜石 + 2 个钻石", ["附魔台", "末影箱", "信标", "下界传送门"], 0],
      ["8 个金锭 + 1 个苹果", ["金苹果", "附魔金苹果", "金胡萝卜", "金锭块"], 0],
      ["3 个羊毛 + 3 个木板", ["床", "地毯", "旗帜", "画"], 0],
      ["7 个钻石 + 1 个木棍", ["钻石剑", "钻石镐", "钻石斧", "钻石锹"], 0]
    ];
    var idx = 0, score = 0;
    var bar = H.top("得分 <b>0</b>");
    host.appendChild(bar);
    var q = H.el("p", "play-score", "");
    q.style.cssText = "font-size:15px;margin:14px 0";
    host.appendChild(q);
    var opts = H.el("div");
    opts.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px";
    host.appendChild(opts);
    var out = H.note("");
    host.appendChild(out);

    function ask() {
      if (idx >= QS.length) { q.textContent = "十题结束，得分 " + score; opts.innerHTML = ""; return; }
      var item = QS[idx];
      q.textContent = "「" + item[0] + "」能合成什么？";
      opts.innerHTML = "";
      item[1].forEach(function (name, i) {
        var b = H.button(name, function () {
          if (i === item[2]) { score++; out.textContent = "对了。"; }
          else out.textContent = "不对，是「" + item[1][item[2]] + "」。";
          bar.querySelector(".play-score").innerHTML = "得分 <b>" + score + "</b> · " + (idx + 1) + "/10";
          idx++; setTimeout(ask, 650);
        });
        opts.appendChild(b);
      });
    }
    ask();
  };

  /* ---------- 23 冷知识问答 ---------- */
  MG.trivia = function (host) {
    var QS = [
      ["末影龙在哪个维度？", ["下界", "末地", "主世界", "虚空"], 1],
      ["红石中继器最多能延迟几档？", ["2", "3", "4", "5"], 2],
      ["哪种生物不会被床炸伤？", ["村民", "僵尸", "玩家", "苦力怕"], 2],
      ["附魔台最高需要多少书架？", ["10", "15", "20", "30"], 1],
      ["以下哪个不是药水材料？", ["烈焰粉", "兔子脚", "海龟壳", "鸡蛋"], 3],
      ["信标最高需要几层矿物块？", ["3", "4", "5", "6"], 1],
      ["下界合金装备需要什么模板？", ["下界合金升级模板", "锻造模板", "附魔书", "金锭"], 0],
      ["末影箱的内容由什么决定？", ["坐标", "玩家", "世界种子", "随机"], 1],
      ["苦力怕怕什么？", ["水", "火", "猫", "光"], 2],
      ["刷怪笼在什么条件下会停止工作？", ["白天", "被红石激活", "周围有火把", "玩家离开"], 2]
    ];
    var idx = 0, score = 0;
    var bar = H.top("得分 <b>0</b>");
    var reset = H.button("重开", function () { idx = 0; score = 0; ask(); });
    bar.appendChild(reset);
    host.appendChild(bar);
    var q = H.el("p", "play-score", "");
    q.style.cssText = "font-size:15px;margin:14px 0;line-height:1.9";
    host.appendChild(q);
    var opts = H.el("div");
    opts.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:8px";
    host.appendChild(opts);
    var out = H.note("");
    host.appendChild(out);

    function ask() {
      if (idx >= QS.length) { q.textContent = "结束，得分 " + score + "/10"; opts.innerHTML = ""; return; }
      var item = QS[idx];
      q.textContent = item[0];
      opts.innerHTML = "";
      item[1].forEach(function (name, i) {
        var b = H.button(name, function () {
          if (i === item[2]) { score++; out.textContent = "对了。"; }
          else out.textContent = "答案是「" + item[1][item[2]] + "」。";
          bar.querySelector(".play-score").innerHTML = "得分 <b>" + score + "</b> · " + (idx + 1) + "/10";
          idx++; setTimeout(ask, 600);
        });
        opts.appendChild(b);
      });
    }
    ask();
  };

  /* ---------- 24 弹幕躲避 ---------- */
  MG.dodger = function (host) {
    var W = 380, H2 = 320;
    var cv = H.el("canvas", "game-canvas");
    cv.width = W; cv.height = H2;
    var bar = H.top("存活 <b>0.0s</b>");
    var reset = H.button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("鼠标移动躲开弹幕，碰到就结束。"));
    var ctx = cv.getContext("2d"), px, py, bullets, t0, dead, raf, last;

    function init() {
      px = W / 2; py = H2 - 26; bullets = []; t0 = Date.now(); dead = false; last = 0;
      cancelAnimationFrame(raf);
      loop(0);
    }
    function loop(t) {
      if (dead) return;
      if (t - last > 220) {
        last = t;
        var n = 1 + Math.floor((Date.now() - t0) / 9000);
        for (var i = 0; i < n; i++) {
          bullets.push({ x: Math.random() * W, y: -10, v: 1.6 + Math.random() * 1.6, w: 6 + Math.random() * 8 });
        }
      }
      bullets.forEach(function (b) { b.y += b.v; });
      bullets = bullets.filter(function (b) { return b.y < H2 + 20; });
      for (var i = 0; i < bullets.length; i++) {
        var b = bullets[i];
        if (Math.abs(b.x - px) < b.w / 2 + 8 && Math.abs(b.y - py) < b.w / 2 + 8) {
          dead = true;
          bar.querySelector(".play-score").innerHTML = "结束 · 存活 <b>" + ((Date.now() - t0) / 1000).toFixed(1) + "s</b>";
          draw(); return;
        }
      }
      bar.querySelector(".play-score").innerHTML = "存活 <b>" + ((Date.now() - t0) / 1000).toFixed(1) + "s</b>";
      draw();
      raf = requestAnimationFrame(loop);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H2);
      ctx.fillStyle = "rgba(255,140,140,.75)";
      bullets.forEach(function (b) { ctx.beginPath(); ctx.arc(b.x, b.y, b.w / 2, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = "#a8f0ea";
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
    }
    cv.addEventListener("mousemove", function (e) {
      var r = cv.getBoundingClientRect();
      px = (e.clientX - r.left) * (W / r.width);
      py = (e.clientY - r.top) * (H2 / r.height);
    });
    init();
  };

  /* ---------- 25 虚空跳跃 ---------- */
  MG.voidjump = function (host) {
    var W = 380, H2 = 360;
    var cv = H.el("canvas", "game-canvas");
    cv.width = W; cv.height = H2;
    var bar = H.top("高度 <b>0</b>");
    var reset = H.button("重开", init);
    bar.appendChild(reset);
    host.appendChild(bar); host.appendChild(cv);
    host.appendChild(H.note("← → 移动，落在平台上会往上弹。掉下去就结束。"));
    var ctx = cv.getContext("2d"), px, py, vy, platforms, camera, dead, raf, vx, height;

    function init() {
      px = W / 2; py = H2 - 60; vy = -9; vx = 0; camera = 0; height = 0; dead = false;
      platforms = [{ x: W / 2 - 40, y: H2 - 30, w: 80 }];
      for (var i = 1; i < 8; i++) {
        platforms.push({ x: 30 + Math.random() * (W - 100), y: H2 - 30 - i * 70, w: 70 + Math.random() * 30 });
      }
      cancelAnimationFrame(raf);
      loop();
    }
    function loop() {
      if (dead) return;
      vy += 0.42;
      py += vy;
      px += vx;
      if (px < 10) px = 10;
      if (px > W - 10) px = W - 10;
      if (vy > 0) {
        platforms.forEach(function (p) {
          if (px > p.x && px < p.x + p.w && py > p.y && py < p.y + 16 && py - vy <= p.y + 4) {
            vy = -9.2; height = Math.max(height, Math.round((H2 - py) / 10));
            bar.querySelector(".play-score").innerHTML = "高度 <b>" + height + "</b>";
          }
        });
      }
      if (py < H2 * 0.45) {
        var shift = H2 * 0.45 - py;
        py = H2 * 0.45;
        platforms.forEach(function (p) { p.y += shift; });
        while (platforms.length && platforms[0].y > H2 + 40) platforms.shift();
        while (platforms.length < 9) {
          var top = platforms.length ? platforms[platforms.length - 1].y : H2;
          platforms.push({ x: 30 + Math.random() * (W - 100), y: top - 62 - Math.random() * 26, w: 70 + Math.random() * 30 });
        }
      }
      if (py > H2 + 30) {
        dead = true;
        bar.querySelector(".play-score").innerHTML = "掉落 · 高度 <b>" + height + "</b>";
        return;
      }
      draw();
      raf = requestAnimationFrame(loop);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H2);
      ctx.fillStyle = "rgba(127,233,224,.35)";
      platforms.forEach(function (p) { ctx.fillRect(p.x, p.y, p.w, 10); });
      ctx.fillStyle = "#a8f0ea";
      ctx.fillRect(px - 8, py, 16, 20);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { vx = -4; e.preventDefault(); }
      if (e.key === "ArrowRight") { vx = 4; e.preventDefault(); }
    });
    document.addEventListener("keyup", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") vx = 0;
    });
    init();
  };

  /* ---------- 分发 ---------- */
  var slug = root.getAttribute("data-game");
  if (slug && MG[slug]) {
    root.innerHTML = "";
    try { MG[slug](root); }
    catch (e) { root.innerHTML = '<p class="play-hint">这个游戏出了点问题：' + e.message + "</p>"; }
  } else if (slug) {
    root.innerHTML = '<p class="play-hint">这个游戏还在施工。</p>';
  }
})();
