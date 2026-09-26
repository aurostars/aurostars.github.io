(function (root) {
  "use strict";

  class WheelPager {
    constructor() {
      this.lastEvent = -Infinity;
      this.blockedUntil = 0;
      this.total = 0;
      this.consumed = false;
    }

    feed(event, now) {
      if (
        event.ctrlKey ||
        !event.deltaY ||
        Math.abs(event.deltaX || 0) > Math.abs(event.deltaY)
      ) {
        return 0;
      }

      if (now - this.lastEvent > 180) {
        this.total = 0;
        this.consumed = false;
      }
      this.lastEvent = now;
      if (this.consumed) return 0;
      if (now < this.blockedUntil) {
        this.consumed = true;
        return 0;
      }

      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 700 : 1;
      const delta = event.deltaY * unit;
      if (Math.sign(delta) !== Math.sign(this.total)) this.total = 0;
      this.total += delta;
      if (Math.abs(this.total) < 60) return 0;

      this.consumed = true;
      this.blockedUntil = now + 800;
      return Math.sign(this.total);
    }

    lock(now) {
      this.blockedUntil = now + 800;
      this.consume(now);
    }

    consume(now) {
      this.lastEvent = now;
      this.total = 0;
      this.consumed = true;
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { WheelPager };
  } else {
    root.GardenNavigation = { WheelPager };
  }
})(typeof window !== "undefined" ? window : globalThis);
