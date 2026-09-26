(() => {
  "use strict";
  const canvas = document.querySelector("#flowerCanvas");
  const context = canvas?.getContext("2d");
  if (!context || !window.ColorGarden) return;
  let storage;
  try { storage = localStorage; } catch { /* Private browsing still allows a session garden. */ }
  const state = new window.ColorGarden.GardenState(storage);
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const home = document.querySelector("#home");
  const count = document.querySelector("#plantCount");
  const add = document.querySelector("#plantFlower");
  const reset = document.querySelector("#resetFlowers");
  const status = document.querySelector("#plantStatus");
  const seasonButtons = [...document.querySelectorAll("[data-season-choice]")];
  const palettes = {
    spring: { petals: ["#8170bd", "#eb836b", "#eeb3c8", "#d7c565"], center: "#efd980", leaf: "#547d63", leafLight: "#88a779", stem: "#486e5a", ground: "#c3c99d", label: "春日 · 万物冒头" },
    summer: { petals: ["#e5b444", "#e8824a", "#d788a0", "#c5d58a"], center: "#5b7051", leaf: "#3d765b", leafLight: "#77a060", stem: "#3c6b4a", ground: "#b8c58d", label: "夏日 · 尽情盛放" },
    autumn: { petals: ["#be7050", "#d6a159", "#b397b7", "#ce9a80"], center: "#725345", leaf: "#8b8655", leafLight: "#b9a567", stem: "#7e7751", ground: "#d3b88d", label: "秋日 · 收集温柔" },
    winter: { petals: ["#8c9fbf", "#bbb1d0", "#d5bfca", "#a2bca8"], center: "#e8ddb5", leaf: "#637e7c", leafLight: "#93a99f", stem: "#586e6e", ground: "#b6c5c4", label: "冬日 · 慢慢酝酿" },
  };
  const baseFlowers = [
    { x: 118, y: 443, height: 168, radius: 35, kind: 0, hue: 1, lean: -.1 },
    { x: 203, y: 430, height: 259, radius: 52, kind: 0, hue: 0, lean: -.08 },
    { x: 292, y: 452, height: 174, radius: 41, kind: 1, hue: 3, lean: -.05 },
    { x: 359, y: 442, height: 271, radius: 38, kind: 2, hue: 2, lean: .1 },
    { x: 458, y: 447, height: 149, radius: 34, kind: 0, hue: 0, lean: .07 },
    { x: 392, y: 465, height: 142, radius: 29, kind: 1, hue: 1, lean: .03 },
    { x: 262, y: 466, height: 94, radius: 21, kind: 2, hue: 2, lean: -.06 },
  ];
  const births = new WeakMap();
  const pointer = { x: 300, y: 300, strength: 0 };
  let pointerStart;
  let frame = 0;
  let lastFrame = -100;
  let palette = palettes[state.season];
  let paletteFrom = palette;
  let seasonStart = -1000;
  let scaleX = 1;
  let scaleY = 1;

  function announce(message) {
    status.textContent = message;
    document.dispatchEvent(new CustomEvent("garden:message", { detail: message }));
  }
  function updateCount() {
    count.textContent = String(state.flowers.length).padStart(2, "0");
    reset.disabled = state.flowers.length === 0;
    add.disabled = state.flowers.length >= 24;
    add.title = add.disabled ? "花圃种满啦，可以清空后重新种植" : "在花圃里种一朵花";
    reset.setAttribute("aria-label", `清空我种的 ${state.flowers.length} 朵花`);
  }
  function renderSeason(user = false) {
    paletteFrom = palette;
    seasonStart = performance.now();
    document.documentElement.dataset.season = state.season;
    document.querySelector("#seasonLabel").textContent = palettes[state.season].label;
    for (const button of seasonButtons) button.setAttribute("aria-pressed", String(button.dataset.seasonChoice === state.season));
    if (user) announce(`已换成${palettes[state.season].label}${state.saved ? "" : "，仅在本次浏览中保留"}`);
    requestDraw();
  }
  function syncView() {
    updateCount();
    if (document.documentElement.dataset.season !== state.season) renderSeason();
    requestDraw();
  }
  function plant(x, y) {
    const flower = state.plant(x, y);
    if (!flower) {
      syncView();
      announce("这片花圃已经种满啦。可以清空后，重新种一片喜欢的花。");
      return;
    }
    births.set(flower, performance.now());
    syncView();
    announce(state.saved ? `第 ${state.flowers.length} 朵花，种下啦。已保存在这个浏览器。` : `第 ${state.flowers.length} 朵花，种下啦。当前浏览器无法保存，仅在本次浏览中保留。`);
    requestDraw();
  }
  add.addEventListener("click", () => plant(.15 + Math.random() * .7, .53 + Math.random() * .3));
  reset.addEventListener("click", () => {
    state.reset();
    syncView();
    announce(state.saved ? "你种的花已清空，空地留给下一次灵感。" : "当前花朵已清空；浏览器无法保存这次修改。");
    requestDraw();
  });
  seasonButtons.forEach((button) => button.addEventListener("click", () => {
    state.setSeason(button.dataset.seasonChoice);
    updateCount();
    renderSeason(true);
  }));
  window.addEventListener("storage", (event) => {
    if (event.storageArea !== storage || (event.key !== window.ColorGarden.storageKey && event.key !== null)) return;
    state.refresh();
    syncView();
  });

  function coordinates(event) {
    const box = canvas.getBoundingClientRect();
    return { x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.height };
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  canvas.addEventListener("pointerup", (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    pointerStart = undefined;
    if (moved > 9) return;
    const position = coordinates(event);
    plant(position.x, position.y);
  });
  canvas.addEventListener("pointercancel", () => { pointerStart = undefined; });
  canvas.addEventListener("pointermove", (event) => {
    const position = coordinates(event);
    pointer.x = position.x * 600;
    pointer.y = position.y * 550;
    pointer.strength = 1;
    if (motion.matches) requestDraw();
  });
  canvas.addEventListener("pointerleave", () => {
    pointer.strength = 0;
    pointerStart = undefined;
    if (motion.matches) requestDraw();
  });

  function ellipse(x, y, rx, ry, angle, fill) {
    context.beginPath();
    context.ellipse(x, y, Math.max(.01, rx), Math.max(.01, ry), angle, 0, Math.PI * 2);
    context.fillStyle = fill;
    context.fill();
  }
  function leaf(x, y, size, angle, fill) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(size * .03, -size * .55, size * .75, -size * .57, size, 0);
    context.bezierCurveTo(size * .67, size * .34, size * .24, size * .3, 0, 0);
    context.fillStyle = fill;
    context.fill();
    context.beginPath();
    context.moveTo(5, 0);
    context.quadraticCurveTo(size * .5, -size * .12, size * .87, 0);
    context.strokeStyle = palette.stem;
    context.globalAlpha = .3;
    context.lineWidth = .8;
    context.stroke();
    context.restore();
  }
  function stem(x, y, height, bend, width = 3) {
    context.beginPath();
    context.moveTo(x, y);
    context.bezierCurveTo(x - bend * .4, y - height * .3, x + bend, y - height * .65, x + bend, y - height);
    context.strokeStyle = palette.stem;
    context.lineWidth = width;
    context.lineCap = "round";
    context.stroke();
  }
  function fern(x, y, height, direction, time) {
    const sway = motion.matches ? 0 : Math.sin(time / 2100 + x) * 7;
    context.save();
    context.translate(x, y);
    context.rotate(direction * .12);
    stem(0, 0, height, sway, 2);
    for (let n = 0; n < 5; n++) {
      const offset = height * (.2 + n * .16);
      const size = height * (.29 - n * .035);
      leaf(sway * (offset / height), -offset, size, -.6, n % 2 ? palette.leaf : palette.leafLight);
      leaf(sway * (offset / height), -offset - 10, size * .85, Math.PI + .55, n % 2 ? palette.leafLight : palette.leaf);
    }
    context.restore();
  }
  function flowerHead(radius, kind, hue, time, seed) {
    const fill = palette.petals[hue];
    if (kind === 1) {
      // Three overlapping, cupped petals make a tulip.
      ellipse(-radius * .43, -radius * .28, radius * .42, radius * .8, -.35, fill);
      ellipse(radius * .43, -radius * .28, radius * .42, radius * .8, .35, fill);
      ellipse(0, -radius * .06, radius * .45, radius * .73, 0, fill);
      context.globalAlpha = .13;
      ellipse(0, radius * .07, radius * .13, radius * .48, 0, palette.center);
      context.globalAlpha = 1;
      return;
    }
    const petals = kind === 2 ? 13 : 7;
    const turn = motion.matches ? 0 : Math.sin(time / 2500 + seed) * .055;
    for (let i = 0; i < petals; i++) {
      const angle = i / petals * Math.PI * 2 + turn;
      const distance = radius * (kind === 2 ? .55 : .56);
      const rx = radius * (kind === 2 ? .47 : .49);
      const ry = radius * (kind === 2 ? .19 : .41);
      ellipse(Math.cos(angle) * distance, Math.sin(angle) * distance, rx, ry, angle, fill);
    }
    ellipse(0, 0, radius * .27, radius * .27, 0, palette.center);
    for (let i = 0; i < 9; i++) {
      const angle = i * 2.4;
      const distance = Math.sqrt(i) * radius * .06;
      ellipse(Math.cos(angle) * distance, Math.sin(angle) * distance, radius * .018, radius * .025, angle, palette.stem);
    }
  }
  function flower(data, time, growth = 1) {
    const { x, y, height, radius, kind, hue, lean = 0 } = data;
    const proximity = Math.max(0, 1 - Math.hypot(pointer.x - x, pointer.y - (y - height)) / 200);
    const wind = motion.matches ? 0 : Math.sin(time / 1650 + x / 50) * 5;
    const bend = lean * height + wind + (pointer.x - x) * .075 * proximity * pointer.strength;
    context.save();
    context.translate(x, y);
    context.scale(growth, growth);
    stem(0, 0, height, bend, height > 180 ? 3.8 : 2.8);
    leaf(bend * .25, -height * .28, height * .23, -.63, palette.leafLight);
    leaf(bend * .5, -height * .49, height * .22, Math.PI + .55, palette.leaf);
    if (height > 200) leaf(bend * .7, -height * .7, height * .15, -.8, palette.leafLight);
    context.translate(bend, -height);
    context.rotate(bend / height * .6);
    flowerHead(radius, kind, hue, time, x);
    context.restore();
  }
  function mixColor(from, to, t) {
    const a = parseInt(from.slice(1), 16);
    const b = parseInt(to.slice(1), 16);
    const channels = [16, 8, 0].map((shift) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t));
    return `#${channels.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  }
  function draw(time) {
    frame = 0;
    if (!active()) return;
    if (!motion.matches && time - lastFrame < 30) { requestDraw(); return; }
    lastFrame = time;
    const progress = motion.matches ? 1 : Math.min(1, (time - seasonStart) / 700);
    const target = palettes[state.season];
    palette = { ...target };
    for (const key of ["center", "leaf", "leafLight", "stem", "ground"]) palette[key] = mixColor(paletteFrom[key], target[key], progress);
    palette.petals = target.petals.map((color, index) => mixColor(paletteFrom.petals[index], color, progress));
    context.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    context.clearRect(0, 0, 600, 550);
    // A low island ties the plants together without a box around the illustration.
    ellipse(301, 458, 199, 20, -.02, palette.ground);
    context.globalAlpha = .42;
    ellipse(302, 469, 162, 9, 0, palette.ground);
    context.globalAlpha = 1;
    fern(152, 449, 209, -.6, time);
    fern(418, 451, 228, .8, time);
    fern(502, 455, 106, 1.3, time);
    for (const data of baseFlowers) flower(data, time);
    // Visitors' flowers stay tied to their relative planting positions on every screen.
    for (const item of state.flowers) {
      const age = time - (births.get(item) ?? -1000);
      const t = motion.matches ? 1 : Math.min(1, Math.max(.01, age / 700));
      const growth = 1 - Math.pow(1 - t, 3);
      const x = 45 + item.x * 510;
      const tip = 75 + item.y * 310;
      const bottom = Math.min(482, tip + 90 + item.hue * 12);
      flower({ x, y: bottom, height: bottom - tip, radius: 17 + item.kind * 3, kind: item.kind, hue: item.hue, lean: (item.hue - 1.5) * .04 }, time, growth);
    }
    // Small drifting pollen follows the same restrained motion preferences.
    if (!motion.matches) {
      context.globalAlpha = .55;
      for (let i = 0; i < 6; i++) {
        const x = 96 + i * 77 + Math.sin(time / 3400 + i) * 10;
        const y = 95 + (i * 69) % 250 + Math.cos(time / 2500 + i) * 7;
        ellipse(x, y, 1.8, 1.8, 0, palette.petals[i % 4]);
      }
      context.globalAlpha = 1;
    }
    if (!motion.matches) requestDraw();
  }
  function active() { return !document.hidden && home.classList.contains("is-active"); }
  function requestDraw() { if (!frame && active()) frame = requestAnimationFrame(draw); }
  function resize() {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);
    scaleX = canvas.width / 600;
    scaleY = canvas.height / 550;
    lastFrame = -100;
    requestDraw();
  }
  new ResizeObserver(resize).observe(canvas);
  new MutationObserver(() => {
    if (active()) { resize(); requestDraw(); }
    else { cancelAnimationFrame(frame); frame = 0; }
  }).observe(home, { attributes: true, attributeFilter: ["class", "hidden"] });
  document.addEventListener("visibilitychange", () => {
    if (active()) requestDraw();
    else { cancelAnimationFrame(frame); frame = 0; }
  });
  motion.addEventListener("change", () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = -100;
    requestDraw();
  });
  updateCount();
  renderSeason();
  resize();
})();
