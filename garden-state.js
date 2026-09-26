(function (root) {
  "use strict";
  const SEASONS = ["spring", "summer", "autumn", "winter"];
  const KEY = "color-garden-v2";
  const LIMIT = 24;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const validFlower = (flower) => flower && Number.isFinite(flower.x) && Number.isFinite(flower.y)
    && flower.x >= 0 && flower.x <= 1 && flower.y >= 0 && flower.y <= 1
    && Number.isInteger(flower.kind) && flower.kind >= 0 && flower.kind <= 2
    && Number.isInteger(flower.hue) && flower.hue >= 0 && flower.hue <= 3;

  class GardenState {
    constructor(storage) {
      this.storage = storage;
      this.season = "spring";
      this.flowers = [];
      this.saved = true;
      this.refresh();
    }
    refresh() {
      // Preserve unsaved session flowers when storage is readable but full.
      if (!this.storage || !this.saved) return;
      try {
        const data = JSON.parse(this.storage.getItem(KEY) || "null");
        this.season = SEASONS.includes(data?.season) ? data.season : "spring";
        this.flowers = Array.isArray(data?.flowers) ? data.flowers.filter(validFlower).slice(0, LIMIT)
          .map(({ x, y, kind, hue }) => ({ x, y, kind, hue })) : [];
      } catch { /* A fresh garden remains usable if storage is absent or corrupt. */ }
    }
    save() {
      try {
        if (!this.storage) throw new Error("Storage unavailable");
        this.storage.setItem(KEY, JSON.stringify({ season: this.season, flowers: this.flowers }));
        this.saved = true;
      } catch { this.saved = false; }
    }
    plant(x, y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
      this.refresh();
      if (this.flowers.length >= LIMIT) return false;
      const flower = { x: clamp(x, .06, .94), y: clamp(y, .25, .94), kind: Math.floor(Math.random() * 3), hue: Math.floor(Math.random() * 4) };
      this.flowers.push(flower);
      this.save();
      return flower;
    }
    setSeason(season) {
      if (!SEASONS.includes(season)) return;
      this.refresh();
      this.season = season;
      this.save();
    }
    reset() {
      this.refresh();
      this.flowers = [];
      this.save();
    }
  }
  if (typeof module !== "undefined" && module.exports) module.exports = { GardenState };
  else root.ColorGarden = { GardenState, storageKey: KEY };
})(typeof window !== "undefined" ? window : globalThis);
