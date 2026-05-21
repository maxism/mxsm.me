/* Shared time-of-day palette — dust shader + CSS (--hot, --dust-*) */
(function (global) {
  "use strict";

  var CYCLE_MS = 30000;
  var STOPS = [
    { hour: 0, h: 228, s: 48, l: 52 },
    { hour: 4, h: 248, s: 42, l: 48 },
    { hour: 6, h: 198, s: 58, l: 50 },
    { hour: 8, h: 48, s: 76, l: 59 },
    { hour: 12, h: 44, s: 74, l: 57 },
    { hour: 16, h: 32, s: 78, l: 54 },
    { hour: 19, h: 14, s: 82, l: 52 },
    { hour: 21, h: 292, s: 48, l: 56 },
    { hour: 23, h: 235, s: 46, l: 50 },
    { hour: 24, h: 228, s: 48, l: 52 },
  ];

  function isTest() {
    return (
      /[?&]paletteTest(?:=1)?(?:&|$)/.test(location.search) ||
      global.__MXSM_PALETTE_TEST__ === true
    );
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpHue(a, b, t) {
    var d = b - a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return (a + d * t + 360) % 360;
  }

  function hslToRgb(h, s, l) {
    var c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = l / 100 - c / 2;
    var r = 0,
      g = 0,
      b = 0;
    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  }

  function rgbToHex(rgb) {
    return (
      "#" +
      rgb
        .map(function (n) {
          return n.toString(16).padStart(2, "0");
        })
        .join("")
    );
  }

  function toUnit(rgb) {
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
  }

  function sampleHsl(hour) {
    var h = ((hour % 24) + 24) % 24;
    for (var i = 0; i < STOPS.length - 1; i++) {
      var a = STOPS[i];
      var b = STOPS[i + 1];
      if (h >= a.hour && h < b.hour) {
        var t = (h - a.hour) / (b.hour - a.hour);
        return {
          h: lerpHue(a.h, b.h, t),
          s: lerp(a.s, b.s, t),
          l: lerp(a.l, b.l, t),
        };
      }
    }
    return { h: STOPS[0].h, s: STOPS[0].s, l: STOPS[0].l };
  }

  function getHour(nowMs) {
    if (isTest()) {
      return ((nowMs % CYCLE_MS) / CYCLE_MS) * 24;
    }
    var d = new Date(nowMs);
    return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
  }

  function at(nowMs) {
    if (nowMs == null) nowMs = Date.now();
    var hsl = sampleHsl(getHour(nowMs));
    var h = hsl.h,
      s = hsl.s,
      l = hsl.l;

    var hot = hslToRgb(h, s, l);
    var bgLo = hslToRgb(h, s * 0.28, l * 0.06);
    var bgHi = hslToRgb(h, s * 0.38, l * 0.2);
    var warm = hslToRgb(h, s * 0.72, l * 0.38);
    var mote = hslToRgb((h + 40) % 360, s * 0.42, Math.min(94, l + 30));
    var glow = hslToRgb(h, s * 0.55, l * 0.34);
    var chemBorder = hslToRgb((h + 168) % 360, Math.min(78, s + 8), l - 6);
    var chemHot = hslToRgb((h + 8) % 360, Math.min(88, s + 6), l + 4);

    return {
      hot: rgbToHex(hot),
      hotRgb: hot.join(", "),
      dustBgLo: toUnit(bgLo),
      dustBgHi: toUnit(bgHi),
      dustWarm: toUnit(warm),
      dustMote: toUnit(mote),
      dustGlow: toUnit(glow),
      chemBorder: toUnit(chemBorder),
      chemHot: toUnit(chemHot),
    };
  }

  function applyCss(p) {
    var el = document.documentElement;
    el.style.setProperty("--hot", p.hot);
    el.style.setProperty("--hot-rgb", p.hotRgb);
    el.style.setProperty("--dust-bg-lo", p.dustBgLo.join(" "));
    el.style.setProperty("--dust-bg-hi", p.dustBgHi.join(" "));
    el.style.setProperty("--dust-warm", p.dustWarm.join(" "));
    el.style.setProperty("--dust-mote", p.dustMote.join(" "));
    el.style.setProperty("--dust-glow", p.dustGlow.join(" "));
    if (isTest()) el.dataset.paletteTest = "1";
  }

  global.mxsmPalette = {
    at: at,
    applyCss: applyCss,
    isTest: isTest,
    CYCLE_MS: CYCLE_MS,
  };
})(window);
