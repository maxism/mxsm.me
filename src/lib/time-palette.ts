/** Palette keyed to local time-of-day — one mood-coherent spectrum for the site. */

export type TimePalette = {
  /** Accent hex, e.g. #e8c547 */
  hot: string;
  /** For rgba() / box-shadow: "232, 197, 71" */
  hotRgb: string;
  hotTriplet: [number, number, number];
  /** Chem “border” tint (signal plate, dust cool highlights) */
  chemBorder: [number, number, number];
  /** Chem “hot spot” burst */
  chemHot: [number, number, number];
  /** Dust warm lift in shader */
  dustWarm: [number, number, number];
  /** Dust mote sparkle */
  dustMote: [number, number, number];
};

type HslStop = { hour: number; h: number; s: number; l: number };

/** 24h loop — wraps at midnight */
const STOPS: HslStop[] = [
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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpHue(a: number, b: number, t: number): number {
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return (a + d * t + 360) % 360;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l / 100 - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
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

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

function sampleHsl(hour: number): { h: number; s: number; l: number } {
  const h = ((hour % 24) + 24) % 24;
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (h >= a.hour && h < b.hour) {
      const t = (h - a.hour) / (b.hour - a.hour);
      return {
        h: lerpHue(a.h, b.h, t),
        s: lerp(a.s, b.s, t),
        l: lerp(a.l, b.l, t),
      };
    }
  }
  return { h: STOPS[0].h, s: STOPS[0].s, l: STOPS[0].l };
}

export function paletteAt(date = new Date()): TimePalette {
  const hour =
    date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const { h, s, l } = sampleHsl(hour);
  const hotTriplet = hslToRgb(h, s, l);
  const border = hslToRgb((h + 168) % 360, Math.min(78, s + 8), l - 6);
  const burst = hslToRgb((h + 8) % 360, Math.min(88, s + 6), l + 4);
  const warm = hslToRgb(h, s * 0.55, l * 0.42);
  const mote = hslToRgb((h + 40) % 360, s * 0.35, Math.min(92, l + 28));
  const classicWarm: [number, number, number] = [0.1, 0.06, 0.02];
  const classicMote: [number, number, number] = [0.9, 0.8, 0.6];
  const warmRgb = warm.map((n) => n / 255) as [number, number, number];
  const moteRgb = mote.map((n) => n / 255) as [number, number, number];

  return {
    hot: rgbToHex(hotTriplet),
    hotRgb: hotTriplet.join(", "),
    hotTriplet,
    chemBorder: border.map((n) => n / 255) as [number, number, number],
    chemHot: burst.map((n) => n / 255) as [number, number, number],
    dustWarm: warmRgb.map((v, i) => v * 0.45 + classicWarm[i] * 0.55) as [
      number,
      number,
      number,
    ],
    dustMote: moteRgb.map((v, i) => v * 0.35 + classicMote[i] * 0.65) as [
      number,
      number,
      number,
    ],
  };
}

export function getLivePalette(): TimePalette {
  return paletteAt();
}

/** Inline script body for layout — avoids flash before hydration */
export function timePaletteInitScript(): string {
  return `(function(){try{var d=new Date();var h=d.getHours()+d.getMinutes()/60;var stops=[{hour:0,h:228,s:48,l:52},{hour:4,h:248,s:42,l:48},{hour:6,h:198,s:58,l:50},{hour:8,h:48,s:76,l:59},{hour:12,h:44,s:74,l:57},{hour:16,h:32,s:78,l:54},{hour:19,h:14,s:82,l:52},{hour:21,h:292,s:48,l:56},{hour:23,h:235,s:46,l:50},{hour:24,h:228,s:48,l:52}];var a=stops[0],b=stops[1],t=0;for(var i=0;i<stops.length-1;i++){if(h>=stops[i].hour&&h<stops[i+1].hour){a=stops[i];b=stops[i+1];t=(h-a.hour)/(b.hour-a.hour);break}}var lh=a.h+((b.h-a.h+540)%360-180)*t;lh=(lh+360)%360;var ls=a.s+(b.s-a.s)*t;var ll=a.l+(b.l-a.l)*t;var c=((1-Math.abs(2*ll/100-1))*ls)/100,x=c*(1-Math.abs((lh/60)%2-1)),m=ll/100-c/2,r=0,g=0,bl=0;if(lh<60){r=c;g=x}else if(lh<120){r=x;g=c}else if(lh<180){g=c;bl=x}else if(lh<240){g=x;bl=c}else if(lh<300){r=x;bl=c}else{r=c;bl=x}var R=Math.round((r+m)*255),G=Math.round((g+m)*255),B=Math.round((bl+m)*255);var el=document.documentElement;el.style.setProperty('--hot','#'+[R,G,B].map(function(n){return n.toString(16).padStart(2,'0')}).join(''));el.style.setProperty('--hot-rgb',R+', '+G+', '+B)}catch(e){}})();`;
}
