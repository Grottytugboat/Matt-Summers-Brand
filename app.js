/* ============================================================
   MOUNTAIN — FRUIT TINGLE · concept store
   procedural can/fruit/poster art + scroll parallax engine
   ============================================================ */
(function () {
'use strict';

// ---------------- helpers ----------------
var $  = function (s, c) { return (c || document).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
var lerp  = function (a, b, t) { return a + (b - a) * t; };
var rand  = function (a, b) { return a + Math.random() * (b - a); };
var TAU = Math.PI * 2;
var smooth = function (t, a, b) { var x = clamp((t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
var hexA = function (hex, a) {
  var n = parseInt(hex.slice(1), 16);
  return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
};

var IS_MOBILE = window.matchMedia('(max-width: 760px)').matches;
var REDUCED   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE_PTR  = window.matchMedia('(pointer: fine)').matches;

var PINK = '#ff2e9a';

// fruit palettes
var ORANGE_COLS = { peel:'#e07800', peelHi:'#ffb62e', pith:'#ffd98f', flesh:'#ff9d2e', seg:'#ff7f1f', segHi:'#ffcf7a', n:9 };
var LIME_COLS   = { peel:'#5f9416', peelHi:'#9ccf3a', pith:'#e7f5be', flesh:'#aede52', seg:'#7fb832', segHi:'#c9ef86', n:9 };
var LEMON_COLS  = { peel:'#e8a400', peelHi:'#ffd23f', pith:'#fff6cf', flesh:'#ffdf6b', seg:'#ffc21a', segHi:'#ffe58a' };
var RASP_COLS   = { hi:'#ff7a8c', mid:'#e3132c', lo:'#8f0a1c', sep:'#2f7a33' };
var BLACK_COLS  = { hi:'#8a6ab8', mid:'#3a2560', lo:'#14092b', sep:'#35543a' };

// ---------------- canvas painters ----------------

function circle(x, cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); }

function drawSpaced(x, text, cx, cy, spacing, fill) {
  x.save();
  var chars = text.split(''), widths = [], total = 0, i;
  for (i = 0; i < chars.length; i++) { widths[i] = x.measureText(chars[i]).width; total += widths[i]; }
  total += spacing * (chars.length - 1);
  var px = cx - total / 2;
  x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = fill;
  for (i = 0; i < chars.length; i++) { x.fillText(chars[i], px, cy); px += widths[i] + spacing; }
  x.restore();
  return total;
}

function scriptWord(x, text, cx, cy, size, rotDeg, colA, colB, glow) {
  x.save();
  x.font = '400 ' + size + 'px "Kaushan Script"';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.translate(cx, cy); x.rotate(rotDeg * Math.PI / 180);
  var w = x.measureText(text).width;
  var g = x.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, colA); g.addColorStop(1, colB);
  x.fillStyle = g;
  x.shadowColor = glow; x.shadowBlur = size * 0.3;
  x.fillText(text, 0, 0);
  x.shadowBlur = size * 0.12;
  x.fillText(text, 0, 0);
  x.restore();
}

function paintSlice(x, cx, cy, r, rot, cols) {
  x.save(); x.translate(cx, cy); x.rotate(rot || 0);
  var g = x.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.15, 0, 0, r);
  g.addColorStop(0, cols.peelHi); g.addColorStop(1, cols.peel);
  x.fillStyle = g; circle(x, 0, 0, r);
  x.fillStyle = cols.pith;  circle(x, 0, 0, r * 0.9);
  x.fillStyle = cols.flesh; circle(x, 0, 0, r * 0.82);
  var n = cols.n || 9, gap = 0.05, i;
  for (i = 0; i < n; i++) {
    var a0 = i * TAU / n + gap, a1 = (i + 1) * TAU / n - gap;
    var sg = x.createRadialGradient(0, 0, r * 0.05, 0, 0, r * 0.78);
    sg.addColorStop(0, cols.segHi); sg.addColorStop(1, cols.seg);
    x.fillStyle = sg;
    x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, r * 0.78, a0, a1); x.closePath(); x.fill();
  }
  x.fillStyle = cols.pith; circle(x, 0, 0, r * 0.05);
  x.strokeStyle = 'rgba(255,255,255,.22)'; x.lineWidth = r * 0.06; x.lineCap = 'round';
  x.beginPath(); x.arc(0, 0, r * 0.6, Math.PI * 1.05, Math.PI * 1.5); x.stroke();
  x.restore();
}

function paintWedge(x, cx, cy, r, rot, cols) {
  x.save(); x.translate(cx, cy); x.rotate(rot);
  function half(rr) { x.beginPath(); x.arc(0, 0, rr, -Math.PI / 2, Math.PI / 2); x.closePath(); x.fill(); }
  var g = x.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, cols.peelHi); g.addColorStop(1, cols.peel);
  x.fillStyle = g; half(r);
  x.fillStyle = cols.pith;  half(r * 0.9);
  x.fillStyle = cols.flesh; half(r * 0.8);
  [-1.05, -0.35, 0.35, 1.05].forEach(function (a) {
    var sg = x.createRadialGradient(0, 0, r * 0.05, 0, 0, r * 0.76);
    sg.addColorStop(0, cols.segHi); sg.addColorStop(1, cols.seg);
    x.fillStyle = sg;
    x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, r * 0.76, a - 0.26, a + 0.26); x.closePath(); x.fill();
  });
  x.restore();
}

var BERRY_LAYOUT = [
  [-.36, -.55], [0, -.58], [.36, -.55],
  [-.62, -.18], [-.21, -.2], [.21, -.2], [.62, -.18],
  [-.72, .19], [-.24, .16], [.24, .16], [.72, .19],
  [-.5, .56], [0, .53], [.5, .56],
  [-.2, .88], [.2, .88]
];
function paintBerry(x, cx, cy, r, cols, rot) {
  x.save(); x.translate(cx, cy); x.rotate(rot || 0);
  x.fillStyle = cols.sep;
  for (var s = -1; s <= 1; s++) {
    x.save(); x.translate(s * r * 0.22, -r * 0.72); x.rotate(s * 0.55);
    x.beginPath(); x.ellipse(0, 0, r * 0.2, r * 0.075, 0, 0, TAU); x.fill();
    x.restore();
  }
  BERRY_LAYOUT.forEach(function (p) {
    var dx = p[0] * r, dy = p[1] * r * 0.92, dr = r * 0.27;
    var g = x.createRadialGradient(dx - dr * 0.4, dy - dr * 0.4, dr * 0.1, dx, dy, dr);
    g.addColorStop(0, cols.hi); g.addColorStop(0.55, cols.mid); g.addColorStop(1, cols.lo);
    x.fillStyle = g; circle(x, dx, dy, dr);
    x.fillStyle = 'rgba(255,255,255,.32)'; circle(x, dx - dr * 0.35, dy - dr * 0.42, dr * 0.16);
  });
  x.restore();
}

function paintSprig(x, cx, cy, len, rot) {
  x.save(); x.translate(cx, cy); x.rotate(rot);
  x.strokeStyle = '#9a7a35'; x.lineWidth = Math.max(2, len * 0.03); x.lineCap = 'round';
  x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(len * 0.06, -len * 0.5, 0, -len); x.stroke();
  for (var i = 0; i < 6; i++) {
    var t = i / 5, ly = -len * (0.14 + 0.74 * t), side = i % 2 ? 1 : -1;
    var g = x.createLinearGradient(0, ly - len * 0.1, side * len * 0.2, ly);
    g.addColorStop(0, '#d9b56a'); g.addColorStop(1, '#7c5f26');
    x.fillStyle = g;
    x.save(); x.translate(side * len * 0.09, ly); x.rotate(side * 0.95 - 0.15);
    x.beginPath(); x.ellipse(0, 0, len * 0.12, len * 0.045, 0, 0, TAU); x.fill();
    x.restore();
  }
  x.restore();
}

function paintMedallion(x, cx, cy, r) {
  x.save(); x.translate(cx, cy);
  var plate = x.createRadialGradient(0, -r * 0.2, r * 0.1, 0, 0, r * 0.95);
  plate.addColorStop(0, '#191920'); plate.addColorStop(1, '#0a0a0d');
  x.fillStyle = plate; circle(x, 0, 0, r * 0.94);
  var sil = x.createLinearGradient(-r, 0, r, 0);
  sil.addColorStop(0, '#fdfdfd'); sil.addColorStop(0.35, '#b9bec6');
  sil.addColorStop(0.6, '#7c828c'); sil.addColorStop(1, '#e9ecef');
  x.strokeStyle = sil; x.lineWidth = r * 0.055;
  x.beginPath(); x.arc(0, 0, r * 0.97, 0, TAU); x.stroke();
  x.globalAlpha = 0.4; x.lineWidth = r * 0.018;
  x.beginPath(); x.arc(0, 0, r * 1.04, 0, TAU); x.stroke();
  x.globalAlpha = 1;
  x.lineWidth = r * 0.105; x.lineCap = 'butt'; x.lineJoin = 'miter'; x.strokeStyle = sil;
  x.beginPath();
  x.moveTo(-r * 0.5, r * 0.42); x.lineTo(-r * 0.5, -r * 0.42); x.lineTo(0, r * 0.1);
  x.lineTo(r * 0.5, -r * 0.42); x.lineTo(r * 0.5, r * 0.42);
  x.stroke();
  x.lineWidth = r * 0.075;
  x.beginPath(); x.moveTo(-r * 0.74, r * 0.16); x.lineTo(r * 0.74, r * 0.16); x.stroke();
  x.restore();
}

function paintBadge(x, cx, cy, r, ring) {
  ring = ring || PINK;
  x.save(); x.translate(cx, cy);
  x.fillStyle = 'rgba(6,6,10,.74)'; circle(x, 0, 0, r * 0.98);
  x.strokeStyle = ring; x.shadowColor = ring; x.shadowBlur = r * 0.5;
  x.lineWidth = r * 0.075;
  x.beginPath(); x.arc(0, 0, r * 0.88, 0, TAU); x.stroke();
  x.beginPath(); x.arc(0, 0, r * 0.88, 0, TAU); x.stroke();
  x.shadowBlur = 0;
  x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '400 ' + Math.round(r * 0.95) + 'px "Bebas Neue"';
  x.fillText('7%', 0, -r * 0.08);
  x.font = '600 ' + Math.round(r * 0.185) + 'px "Space Grotesk"';
  drawSpaced(x, 'ALC/VOL', 0, r * 0.46, r * 0.04, '#ffd9ee');
  x.restore();
}

function softShadow(x, cx, cy, r) {
  x.save(); x.translate(cx, cy); x.scale(1, 0.28);
  var g = x.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; circle(x, 0, 0, r);
  x.restore();
}

function paintDroplets(x, x0, y0, x1, y1, n) {
  x.save(); x.globalAlpha = 0.6;
  for (var i = 0; i < n; i++) {
    var dx = rand(x0, x1), dy = rand(y0, y1);
    var r = Math.random() < 0.75 ? rand(1.2, 3) : rand(3, 5.5);
    var g = x.createRadialGradient(dx - r * 0.35, dy - r * 0.35, r * 0.1, dx, dy, r);
    g.addColorStop(0, 'rgba(255,255,255,.5)');
    g.addColorStop(0.45, 'rgba(200,210,225,.14)');
    g.addColorStop(1, 'rgba(120,130,150,.05)');
    x.fillStyle = g; circle(x, dx, dy, r);
    x.fillStyle = 'rgba(255,255,255,.5)'; circle(x, dx - r * 0.35, dy - r * 0.4, r * 0.14);
  }
  for (var j = 0; j < 26; j++) {
    var sx = rand(x0, x1), sy = rand(y0, y1 * 0.7), l = rand(40, 150);
    x.fillStyle = 'rgba(190,200,215,.10)';
    x.beginPath(); x.ellipse(sx, sy + l / 2, 1.6, l / 2, 0, 0, TAU); x.fill();
    x.fillStyle = 'rgba(220,228,240,.2)'; circle(x, sx, sy + l, 2.6);
  }
  x.restore();
}

// ---------------- can art (colourways) ----------------
var CAN_WAYS = {
  original:  { bgA:'#1d1d26', bgB:'#0a0a0f', name:'gold',
               fA:['#ff8ac6', '#ff1f8e'], fB:['#9fe2ff', '#7a5cff'], badge:PINK },
  raspberry: { bgA:'#e0154c', bgB:'#8c0631', name:'silver',
               fA:['#ffd1e3', '#ff8ab8'], fB:['#e0edff', '#8fb7ff'], badge:'#ffffff' },
  orange:    { bgA:'#f26f00', bgB:'#a83f00', name:'silver',
               fA:['#ffe0bd', '#ff9e4d'], fB:['#e0edff', '#8fb7ff'], badge:'#ffffff' },
  lime:      { bgA:'#7fb510', bgB:'#4f7a00', name:'silver',
               fA:['#eaffc4', '#a4e33c'], fB:['#dcf7ff', '#5cd0e8'], badge:'#ffffff' },
  blackberry:{ bgA:'#6f43e6', bgB:'#42209c', name:'silver',
               fA:['#e9dcff', '#a98cff'], fB:['#ffe1f4', '#ff8ac6'], badge:'#ffffff' }
};

function canPath(x, cx, top, bw, bh) {
  var l = cx - bw / 2, r = cx + bw / 2, b = top + bh, rt = 30, rb = 18;
  x.beginPath();
  x.moveTo(l + rt, top);
  x.lineTo(r - rt, top); x.quadraticCurveTo(r, top, r, top + rt * 0.9);
  x.lineTo(r, b - rb);   x.quadraticCurveTo(r, b, r - rb, b);
  x.lineTo(l + rb, b);   x.quadraticCurveTo(l, b, l, b - rb);
  x.lineTo(l, top + rt * 0.9); x.quadraticCurveTo(l, top, l + rt, top);
  x.closePath();
}

function paintCanFront(wayName) {
  var way = CAN_WAYS[wayName] || CAN_WAYS.original;
  var cv = document.createElement('canvas'); cv.width = 460; cv.height = 580;
  var x = cv.getContext('2d');

  var cx = 230, top = 64, bw = 206, bh = 478;
  x.save();
  canPath(x, cx, top, bw, bh); x.clip();
  var g = x.createLinearGradient(cx - bw / 2, 0, cx + bw / 2, 0);
  g.addColorStop(0, way.bgB); g.addColorStop(0.2, way.bgA);
  g.addColorStop(0.55, way.bgB); g.addColorStop(1, way.bgB);
  x.fillStyle = g; x.fillRect(cx - bw / 2, top, bw, bh);

  paintSlice(x, cx - 58, top + 86, 40, -0.3, ORANGE_COLS);
  paintSlice(x, cx + 62, top + 74, 28, 0.4, LIME_COLS);
  paintMedallion(x, cx, top + 130, 62);

  var nameFill;
  if (way.name === 'gold') {
    nameFill = x.createLinearGradient(0, top + 232, 0, top + 268);
    nameFill.addColorStop(0, '#f7e6ae'); nameFill.addColorStop(0.6, '#c99a44'); nameFill.addColorStop(1, '#e3c27c');
  } else {
    nameFill = x.createLinearGradient(0, top + 232, 0, top + 282);
    nameFill.addColorStop(0, '#ffffff'); nameFill.addColorStop(0.5, '#d9dee6'); nameFill.addColorStop(1, '#f2f4f8');
  }
  x.font = '400 34px "Bebas Neue"';
  x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 6; x.shadowOffsetY = 2;
  drawSpaced(x, 'MOUNTAIN', cx, top + 250, 8, nameFill);
  x.font = '400 15px "Bebas Neue"';
  drawSpaced(x, 'VODKA', cx, top + 282, 11, nameFill);
  x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0;
  scriptWord(x, 'Fruit', cx - 6, top + 330, 50, -8, way.fA[0], way.fA[1], 'rgba(0,0,0,.45)');
  scriptWord(x, 'Tingle', cx + 10, top + 386, 54, -6, way.fB[0], way.fB[1], 'rgba(0,0,0,.45)');
  paintBerry(x, cx - 44, top + 422, 24, RASP_COLS, 0);
  paintBerry(x, cx + 42, top + 416, 22, BLACK_COLS, 0);
  paintBadge(x, cx, top + 440, 43, way.badge);
  paintDroplets(x, cx - bw / 2, top, cx + bw / 2, top + bh, 70);
  x.restore();

  // base shadow
  x.save(); x.translate(cx, top + bh + 10); x.scale(1, 0.16);
  var sh = x.createRadialGradient(0, 0, 0, 0, 0, 130);
  sh.addColorStop(0, 'rgba(0,0,0,.65)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = sh; circle(x, 0, 0, 130);
  x.restore();

  // lid
  var lg = x.createLinearGradient(cx - 92, 0, cx + 92, 0);
  lg.addColorStop(0, '#9aa0a8'); lg.addColorStop(0.3, '#f0f2f4'); lg.addColorStop(0.55, '#a8adb4');
  lg.addColorStop(0.8, '#e8eaee'); lg.addColorStop(1, '#7e848d');
  x.fillStyle = lg;
  x.beginPath(); x.ellipse(cx, top + 2, 90, 19, 0, 0, TAU); x.fill();
  x.fillStyle = '#14141a';
  x.beginPath(); x.ellipse(cx, top + 2, 70, 13, 0, 0, TAU); x.fill();
  x.fillStyle = '#c7ccd2';
  x.beginPath(); x.ellipse(cx, top + 2, 24, 5.5, 0, 0, TAU); x.fill();

  return cv.toDataURL('image/png');
}

// ---------------- poster art ----------------
function paintPoster() {
  var cv = document.createElement('canvas'); cv.width = 460; cv.height = 580;
  var x = cv.getContext('2d');
  var bg = x.createRadialGradient(230, 250, 40, 230, 280, 430);
  bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#eceae4');
  x.fillStyle = bg; x.fillRect(0, 0, 460, 580);
  x.strokeStyle = '#101014'; x.lineWidth = 3;
  x.strokeRect(28, 28, 404, 524);
  x.strokeStyle = 'rgba(16,16,20,.25)'; x.lineWidth = 1;
  x.strokeRect(40, 40, 380, 500);
  paintMedallion(x, 230, 175, 95);
  scriptWord(x, 'Fruit', 218, 330, 78, -8, '#ff8ac6', '#ff1f8e', 'rgba(255,31,142,.35)');
  scriptWord(x, 'Tingle', 244, 405, 84, -6, '#6ea4ff', '#7a5cff', 'rgba(56,100,255,.3)');
  x.font = '400 26px "Bebas Neue"';
  drawSpaced(x, 'MOUNTAIN VODKA', 230, 490, 6, '#101014');
  x.font = '600 13px "Space Grotesk"';
  drawSpaced(x, 'SERIES 01 · 7% ALC/VOL', 230, 516, 4, '#5d5b64');
  return cv.toDataURL('image/png');
}

// ---------------- floating fruit art (transparent) ----------------
function fruitImg(kind) {
  var cv = document.createElement('canvas'); cv.width = 200; cv.height = 200;
  var x = cv.getContext('2d');
  if (kind === 'raspberry')      paintBerry(x, 100, 104, 66, RASP_COLS, rand(-0.4, 0.4));
  else if (kind === 'orange')    paintSlice(x, 100, 100, 64, rand(0, TAU), ORANGE_COLS);
  else if (kind === 'lime')      paintSlice(x, 100, 100, 60, rand(0, TAU), LIME_COLS);
  else if (kind === 'blackberry')paintBerry(x, 100, 104, 62, BLACK_COLS, rand(-0.4, 0.4));
  else                           paintWedge(x, 100, 100, 62, rand(-3, 3), LEMON_COLS);
  return cv.toDataURL('image/png');
}

function buildImages() {
  var cache = {};
  $$('img[data-can]').forEach(function (img) {
    var way = img.getAttribute('data-can');
    if (!cache[way]) cache[way] = paintCanFront(way);
    img.src = cache[way];
  });
  var posterURL = paintPoster();
  $$('img[data-poster]').forEach(function (img) { img.src = posterURL; });
}

// ---------------- hero floating fruit ----------------
function spawnHeroFruits() {
  var wrap = $('#hero-fruits');
  if (!wrap) return;
  var kinds = ['raspberry', 'orange', 'lime', 'blackberry', 'wedge'];
  var urls = {};
  kinds.forEach(function (k) { urls[k] = fruitImg(k); });
  var n = IS_MOBILE ? 6 : 10;
  for (var i = 0; i < n; i++) {
    var img = document.createElement('img');
    img.src = urls[kinds[i % kinds.length]];
    img.alt = '';
    var left = i % 2 === 0 ? rand(4, 20) : rand(80, 94);
    var topY = rand(12, 78);
    var size = Math.round(rand(44, 84));
    img.style.left = left + '%';
    img.style.top = topY + '%';
    img.style.setProperty('--fs', size + 'px');
    img.style.animationDelay = (-rand(0, 6)).toFixed(2) + 's';
    img.setAttribute('data-parallax', rand(0.05, 0.16).toFixed(3));
    img.setAttribute('data-rot', rand(-20, 20).toFixed(1));
    wrap.appendChild(img);
  }
}

// ============================================================
//  PARALLAX ENGINE
// ============================================================
var scrollCur = window.scrollY || 0;
var mouseX = 0, mouseY = 0, tMouseX = 0, tMouseY = 0;

function initParallax() {
  if (REDUCED) return;

  var heroWrap = $('#hero-can-wrap');
  var premix = $('.premix');
  var l1 = $('.premix-line.l1 span');
  var l2 = $('.premix-line.l2 span');
  var premixCan = $('.premix-can');
  var items = $$('[data-parallax]').map(function (el) {
    return { el: el, sp: parseFloat(el.getAttribute('data-parallax')) || 0,
             rot: parseFloat(el.getAttribute('data-rot')) || 0 };
  });

  if (FINE_PTR) {
    window.addEventListener('mousemove', function (e) {
      tMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      tMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  var last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000, 0.05); last = now;
    var t = now / 1000;
    var vh = window.innerHeight;

    scrollCur += ((window.scrollY || 0) - scrollCur) * 0.09;
    mouseX += (tMouseX - mouseX) * 0.06;
    mouseY += (tMouseY - mouseY) * 0.06;

    // generic parallax elements
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var r = it.el.getBoundingClientRect();
      var off = r.top + r.height / 2 - vh / 2;
      it.el.style.transform = 'translate3d(0,' + (-off * it.sp).toFixed(1) + 'px,0)' +
        (it.rot ? ' rotate(' + (it.rot + Math.sin(t * 0.7 + i) * 4).toFixed(1) + 'deg)' : '');
    }

    // hero can: lags behind scroll, drifts with mouse, fades out
    if (heroWrap) {
      var hp = clamp(scrollCur / vh, 0, 1.2);
      heroWrap.style.transform =
        'translate3d(' + (mouseX * 20).toFixed(1) + 'px,' +
        (scrollCur * 0.42 + mouseY * 12).toFixed(1) + 'px,0) rotate(' +
        (mouseX * 2.4 + hp * 5).toFixed(2) + 'deg) scale(' + (1 + hp * 0.1).toFixed(3) + ')';
      heroWrap.style.opacity = (1 - smooth(hp, 0.55, 0.95)).toFixed(3);
    }

    // sticky premix moment
    if (premix && l1 && l2 && premixCan) {
      var pr = premix.getBoundingClientRect();
      var total = pr.height - vh;
      var p = clamp(-pr.top / Math.max(total, 1), 0, 1);
      l1.style.transform = 'translate3d(' + ((p - 0.5) * -34).toFixed(2) + 'vw,0,0)';
      l2.style.transform = 'translate3d(' + ((p - 0.5) *  34).toFixed(2) + 'vw,0,0)';
      premixCan.style.transform =
        'rotate(' + (-8 + p * 16).toFixed(2) + 'deg) scale(' + (0.9 + p * 0.22).toFixed(3) + ')';
    }
  }
  requestAnimationFrame(frame);
}

// ============================================================
//  UI
// ============================================================
var toastTimer = null;
function toast(msg) {
  var el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
}

// ---------------- cart ----------------
var cart = {};
function cartCount() { return Object.keys(cart).reduce(function (a, k) { return a + cart[k].qty; }, 0); }
function cartTotal() { return Object.keys(cart).reduce(function (a, k) { return a + cart[k].qty * cart[k].price; }, 0); }

function renderCart() {
  var wrap = $('#drawer-items');
  var keys = Object.keys(cart);
  var count = cartCount();
  var badge = $('#cart-count');
  badge.hidden = count === 0;
  badge.textContent = count;
  if (!keys.length) {
    wrap.innerHTML = '<p class="drawer-empty">Nothing here yet.<br>The can is feeling lonely.</p>';
  } else {
    wrap.innerHTML = keys.map(function (k) {
      var it = cart[k];
      return '<div class="d-item" data-k="' + k + '">' +
        '<div class="d-info"><div class="d-name">' + it.name + '</div>' +
        '<div class="d-price">$' + it.price + ' each</div></div>' +
        '<div class="d-qty"><button type="button" data-dec aria-label="Decrease">−</button>' +
        '<b>' + it.qty + '</b>' +
        '<button type="button" data-inc aria-label="Increase">+</button></div>' +
        '<button class="d-remove" type="button" data-remove aria-label="Remove">✕</button>' +
        '</div>';
    }).join('');
  }
  $('#drawer-total').textContent = '$' + cartTotal();
}

function wireCart() {
  $$('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-id');
      if (!cart[id]) cart[id] = { name: btn.getAttribute('data-name'), price: +btn.getAttribute('data-price'), qty: 0 };
      cart[id].qty++;
      renderCart();
      var badge = $('#cart-count');
      badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
      toast(cart[id].name + ' added to your stash.');
    });
  });
  $('#drawer-items').addEventListener('click', function (e) {
    var row = e.target.closest('.d-item'); if (!row) return;
    var k = row.getAttribute('data-k');
    if (e.target.closest('[data-inc]')) cart[k].qty++;
    else if (e.target.closest('[data-dec]')) { cart[k].qty--; if (cart[k].qty <= 0) delete cart[k]; }
    else if (e.target.closest('[data-remove]')) delete cart[k];
    else return;
    renderCart();
  });
  var drawer = $('#drawer'), backdrop = $('#drawer-backdrop');
  function openDrawer() { drawer.classList.add('open'); backdrop.classList.add('open'); }
  function closeDrawer() { drawer.classList.remove('open'); backdrop.classList.remove('open'); }
  $('#cart-btn').addEventListener('click', openDrawer);
  $('#drawer-close').addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  $('#checkout-btn').addEventListener('click', function () {
    toast(cartCount() ? 'Checkout is coming soon — the tingle is free for now.' : 'Your stash is empty. Add some tingle first.');
  });
  renderCart();
}

function wireUI() {
  var nav = $('#nav');
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', (window.scrollY || 0) > 40);
  }, { passive: true });

  $('#menu-btn').addEventListener('click', function () {
    document.body.classList.toggle('nav-open');
  });
  $$('#nav-links a').forEach(function (a) {
    a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
  });

  $('#join-form').addEventListener('submit', function (e) {
    e.preventDefault();
    toast("You're on the list. First drop news lands soon.");
    $('#join-email').value = '';
  });

  $('#year').textContent = new Date().getFullYear();
  wireCart();
}

// ---------------- boot ----------------
function setLoaderProgress(p) {
  var bar = $('#loader-bar'), pct = $('#loader-pct');
  if (bar) bar.style.width = p + '%';
  if (pct) pct.textContent = Math.round(p);
}

function startIntro() {}

function showGate() {
  var gate = $('#age-gate');
  gate.style.display = 'flex';
  $('#gate-yes').addEventListener('click', function () {
    try { sessionStorage.setItem('mtn-age', '1'); } catch (e) {}
    gate.classList.add('hide');
    startIntro();
  });
  $('#gate-no').addEventListener('click', function () {
    $('#age-actions').hidden = true;
    $('#age-denied').hidden = false;
  });
}

function boot() {
  var t0 = performance.now();
  setLoaderProgress(10);

  var fontsReady = Promise.all([
    document.fonts.load('400 100px "Bebas Neue"'),
    document.fonts.load('400 100px "Kaushan Script"'),
    document.fonts.load('600 40px "Space Grotesk"'),
    document.fonts.ready
  ]).catch(function () {});

  fontsReady.then(function () {
    setLoaderProgress(55);
    buildImages();
    setLoaderProgress(80);
    spawnHeroFruits();
    wireUI();
    initParallax();
    setLoaderProgress(95);

    var wait = Math.max(0, 1500 - (performance.now() - t0));
    setTimeout(function () {
      setLoaderProgress(100);
      setTimeout(function () { $('#loader').classList.add('done'); }, 420);

      var verified = false;
      try { verified = sessionStorage.getItem('mtn-age') === '1'; } catch (e) {}
      if (verified) {
        $('#age-gate').classList.add('hide');
      } else {
        showGate();
      }
    }, wait);
  });
}

boot();
})();
