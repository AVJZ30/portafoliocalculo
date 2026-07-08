/* ============================================================
   CÁLCULO INTEGRAL — interactividad
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderMath();
  setupMobileMenu();
  setupScrollReveal();
  setupSideDots();
  setupActiveNavLinks();
  drawHeroAnimation();
  drawFamilyCurves();
  animateUnitCircle();
  setupRiemannDemo();
  setupCalculator();
});

/* ---------- KaTeX auto render ---------- */
function renderMath(){
  if (window.renderMathInElement){
    renderMathInElement(document.body, {
      delimiters: [
        {left: "$$", right: "$$", display: true},
        {left: "$", right: "$", display: false}
      ],
      throwOnError: false
    });
  }
}

/* ---------- Mobile menu ---------- */
function setupMobileMenu(){
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('topnav');
  if(!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }));
}

/* ---------- Scroll reveal ---------- */
function setupScrollReveal(){
  const targets = document.querySelectorAll('.topic__inner, .divider__inner, .case-card, .video-block');
  targets.forEach(t => t.classList.add('reveal'));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(t => io.observe(t));
}

/* ---------- Side progress dots ---------- */
const SECTIONS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'riemann', label: 'Riemann' },
  { id: 'integrales', label: 'Integrales' },
  { id: 'sustitucion', label: 'Sustitución' },
  { id: 'partes', label: 'Por partes' },
  { id: 'trigonometricas', label: 'Trigonométricas' },
  { id: 'fracciones', label: 'Fracciones parciales' },
  { id: 'area-volumen', label: 'Área y volumen' },
  { id: 'longitud', label: 'Longitud de curva' },
  { id: 'cinematica', label: 'Cinemática' },
  { id: 'calculadora', label: 'Calculadora' },
];

function setupSideDots(){
  const nav = document.getElementById('sideDots');
  if(!nav) return;
  SECTIONS.forEach(s => {
    const a = document.createElement('a');
    a.href = '#' + s.id;
    a.dataset.id = s.id;
    a.title = s.label;
    a.setAttribute('aria-label', s.label);
    nav.appendChild(a);
  });
  const dots = nav.querySelectorAll('a');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const dot = nav.querySelector(`a[data-id="${entry.target.id}"]`);
      if (!dot) return;
      if (entry.isIntersecting) {
        dots.forEach(d => d.classList.remove('is-active'));
        dot.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  SECTIONS.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) io.observe(el);
  });
}

/* ---------- Active top-nav link highlight ---------- */
function setupActiveNavLinks(){
  const map = { parcial1: 'sustitucion', parcial2: 'fracciones', calculadora: 'calculadora' };
  const links = document.querySelectorAll('[data-nav]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => l.classList.remove('is-active'));
      const target = Object.entries(map).find(([, sectionId]) => sectionId === entry.target.id);
      if (target) {
        const link = document.querySelector(`[data-nav][href="#${target[0]}"]`);
        if (link) link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  ['parcial1', 'parcial2', 'calculadora'].forEach(id => {
    const sectionId = map[id];
    const el = document.getElementById(sectionId);
    if (el) io.observe(el);
  });
}

/* ============================================================
   HERO — curva animada + rectángulos de Riemann creciendo
   ============================================================ */
function heroFn(t){
  // t in [0,1] -> normalized height in [0,1] (decorative, textbook-like curve)
  return 0.5 + 0.27*Math.sin(t*Math.PI*1.7) - 0.14*t*t;
}

function drawHeroAnimation(){
  const svgNS = 'http://www.w3.org/2000/svg';
  const curve = document.getElementById('heroCurve');
  const rectsG = document.getElementById('heroRects');
  if (!curve || !rectsG) return;

  const x0 = 60, x1 = 510, yTop = 50, yBase = 400;

  function yFor(xNorm){
    return yBase - heroFn(xNorm) * (yBase - yTop);
  }

  // build smooth path
  let d = '';
  const steps = 80;
  for (let i = 0; i <= steps; i++){
    const xNorm = i / steps;
    const x = x0 + xNorm * (x1 - x0);
    const y = yFor(xNorm);
    d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }
  curve.setAttribute('d', d);

  const len = curve.getTotalLength ? curve.getTotalLength() : 1000;
  curve.style.strokeDasharray = len;
  curve.style.strokeDashoffset = len;
  curve.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(.22,.9,.3,1)';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    curve.style.strokeDashoffset = '0';
  }));

  const counts = [4, 8, 16, 30, 48];
  let idx = 0;

  function renderRects(n){
    rectsG.innerHTML = '';
    const w = (x1 - x0) / n;
    for (let i = 0; i < n; i++){
      const xNorm = (i + 0.5) / n;
      const x = x0 + i * w;
      const y = yFor(xNorm);
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', x.toFixed(2));
      rect.setAttribute('y', y.toFixed(2));
      rect.setAttribute('width', Math.max(w - 1, 0.6).toFixed(2));
      rect.setAttribute('height', (yBase - y).toFixed(2));
      rectsG.appendChild(rect);
    }
  }

  function step(){
    renderRects(counts[idx]);
    idx++;
    if (idx < counts.length){
      setTimeout(step, 650);
    }
  }
  setTimeout(step, 300);
}

/* ============================================================
   FAMILIA DE ANTIDERIVADAS (sección "Integrales")
   ============================================================ */
function drawFamilyCurves(){
  const g = document.getElementById('familyCurves');
  if (!g) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const offsets = [-80, -40, 0, 40, 80];
  const colors = ['#7fd0e8', '#4fb1a6', '#e6a13d', '#e15a4f', '#c9832a'];
  offsets.forEach((c, idx) => {
    let d = '';
    for (let px = 40; px <= 360; px += 8){
      const xRel = (px - 200) / 60;
      const y = 150 - c - 14 * xRel * xRel;
      if (y < 15 || y > 285) continue;
      d += (d === '' ? `M ${px} ${y}` : ` L ${px} ${y}`);
    }
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', colors[idx % colors.length]);
    path.setAttribute('opacity', idx === 2 ? '1' : '0.55');
    g.appendChild(path);
  });
}

/* ============================================================
   CÍRCULO UNITARIO ANIMADO (sección trigonométricas)
   ============================================================ */
function animateUnitCircle(){
  const radiusLine = document.getElementById('unitRadius');
  const sinLine = document.getElementById('sinLine');
  const cosLine = document.getElementById('cosLine');
  const dot = document.getElementById('unitDot');
  if (!radiusLine || !dot) return;

  const cx = 150, cy = 150, r = 110;
  let angle = -0.9;

  function frame(){
    angle += 0.006;
    const x = cx + r * Math.cos(angle);
    const y = cy - r * Math.sin(angle);
    radiusLine.setAttribute('x2', x.toFixed(2));
    radiusLine.setAttribute('y2', y.toFixed(2));
    sinLine.setAttribute('x1', x.toFixed(2));
    sinLine.setAttribute('x2', x.toFixed(2));
    sinLine.setAttribute('y1', cy.toFixed(2));
    sinLine.setAttribute('y2', y.toFixed(2));
    cosLine.setAttribute('x2', x.toFixed(2));
    dot.setAttribute('cx', x.toFixed(2));
    dot.setAttribute('cy', y.toFixed(2));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ============================================================
   DEMO INTERACTIVO DE SUMAS DE RIEMANN
   ============================================================ */
function riemannFn(x){
  return 1.5 * Math.sin(x * 1.3) + 2.6;
}

function simpsonIntegral(f, a, b, n){
  if (n % 2 !== 0) n++;
  const h = (b - a) / n;
  let sum = f(a) + f(b);
  for (let i = 1; i < n; i++){
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }
  return (h / 3) * sum;
}

function setupRiemannDemo(){
  const canvas = document.getElementById('riemannCanvas');
  const slider = document.getElementById('nSlider');
  const nValueEl = document.getElementById('nValue');
  const sumEl = document.getElementById('riemannSum');
  const exactEl = document.getElementById('exactValue');
  if (!canvas || !slider) return;

  const ctx = canvas.getContext('2d');
  const a = 0, b = 6;
  const exact = simpsonIntegral(riemannFn, a, b, 2000);

  function draw(n){
    const W = canvas.width, H = canvas.height;
    const padL = 46, padB = 34, padT = 18, padR = 18;
    const plotW = W - padL - padR, plotH = H - padT - padB;

    // sample for y-range
    let yMax = 0;
    for (let i = 0; i <= 200; i++){
      const x = a + (i/200)*(b-a);
      yMax = Math.max(yMax, riemannFn(x));
    }
    yMax *= 1.15;

    const xToPx = (x) => padL + ((x - a)/(b - a)) * plotW;
    const yToPx = (y) => padT + plotH - (y / yMax) * plotH;

    ctx.clearRect(0,0,W,H);

    // grid
    ctx.strokeStyle = 'rgba(23,50,78,0.08)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= 6; gx++){
      const px = xToPx(gx);
      ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, padT+plotH); ctx.stroke();
    }
    for (let gy = 0; gy <= 4; gy++){
      const py = padT + (gy/4)*plotH;
      ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(padL+plotW, py); ctx.stroke();
    }

    // rectangles (midpoint rule)
    const w = (b - a) / n;
    let riemannSum = 0;
    ctx.fillStyle = 'rgba(230,161,61,0.55)';
    ctx.strokeStyle = '#c9832a';
    ctx.lineWidth = 1;
    for (let i = 0; i < n; i++){
      const xMid = a + (i + 0.5) * w;
      const h = riemannFn(xMid);
      riemannSum += h * w;
      const xLeftPx = xToPx(a + i*w);
      const wPx = xToPx(a + (i+1)*w) - xLeftPx;
      const yTopPx = yToPx(h);
      const yBasePx = yToPx(0);
      ctx.fillRect(xLeftPx, yTopPx, wPx, yBasePx - yTopPx);
      ctx.strokeRect(xLeftPx, yTopPx, wPx, yBasePx - yTopPx);
    }

    // curve
    ctx.beginPath();
    ctx.strokeStyle = '#17324e';
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= 300; i++){
      const x = a + (i/300)*(b-a);
      const px = xToPx(x), py = yToPx(riemannFn(x));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // axes
    ctx.strokeStyle = '#17324e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(padL, padT+plotH); ctx.lineTo(padL+plotW, padT+plotH);
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT+plotH);
    ctx.stroke();

    nValueEl.textContent = n;
    sumEl.textContent = riemannSum.toFixed(4);
    exactEl.textContent = exact.toFixed(4);
  }

  draw(parseInt(slider.value, 10));
  slider.addEventListener('input', () => draw(parseInt(slider.value, 10)));
}

/* ============================================================
   CALCULADORA DE INTEGRALES
   ============================================================ */
const ALLOWED_TOKENS = new Set([
  'x','sin','cos','tan','asin','acos','atan','sinh','cosh','tanh',
  'exp','ln','log','log10','sqrt','abs','pi','PI','e','E'
]);

function compileExpression(raw){
  const expr = raw.trim();
  if (!expr) throw new Error('Escribe una función.');
  if (!/^[0-9x+\-*/^().,\s a-zA-Z]*$/.test(expr)){
    throw new Error('La expresión contiene caracteres no permitidos.');
  }
  const words = expr.match(/[a-zA-Z]+/g) || [];
  for (const w of words){
    if (!ALLOWED_TOKENS.has(w)){
      throw new Error(`No se reconoce "${w}". Usa funciones como sin, cos, tan, exp, ln, sqrt, abs, pi.`);
    }
  }
  let js = expr
    .replace(/\basin\b/g, 'Math.asin')
    .replace(/\bacos\b/g, 'Math.acos')
    .replace(/\batan\b/g, 'Math.atan')
    .replace(/\bsinh\b/g, 'Math.sinh')
    .replace(/\bcosh\b/g, 'Math.cosh')
    .replace(/\btanh\b/g, 'Math.tanh')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\blog10\b/g, 'Math.log10')
    .replace(/\bln\b/g, 'Math.log')
    .replace(/\blog\b/g, 'Math.log10')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bpi\b/g, 'Math.PI')
    .replace(/\bPI\b/g, 'Math.PI')
    .replace(/\bE\b/g, 'Math.E')
    .replace(/\be\b/g, 'Math.E')
    .replace(/\^/g, '**');

  // eslint-disable-next-line no-new-func
  const fn = new Function('x', `"use strict"; return (${js});`);
  // sanity test
  const testVal = fn(1);
  if (typeof testVal !== 'number' || Number.isNaN(testVal)) {
    // allow NaN at a single test point (e.g. ln at negative), don't throw here
  }
  return fn;
}

function setupCalculator(){
  const form = document.getElementById('calcForm');
  const fxInput = document.getElementById('fxInput');
  const aInput = document.getElementById('aInput');
  const bInput = document.getElementById('bInput');
  const nInput = document.getElementById('nInput');
  const errorEl = document.getElementById('calcError');
  const resultEl = document.getElementById('calcResultValue');
  const hEl = document.getElementById('calcHValue');
  const canvas = document.getElementById('calcCanvas');
  if (!form || !canvas) return;
  const ctx = canvas.getContext('2d');

  function drawGraph(f, a, b){
    const W = canvas.width, H = canvas.height;
    const padL = 50, padB = 36, padT = 20, padR = 20;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const span = b - a || 1;
    const pad = span * 0.2;
    const domainMin = a - pad, domainMax = b + pad;

    let yMin = Infinity, yMax = -Infinity;
    const samples = 320;
    const pts = [];
    for (let i = 0; i <= samples; i++){
      const x = domainMin + (i/samples) * (domainMax - domainMin);
      let y = f(x);
      if (!isFinite(y)) y = NaN;
      pts.push([x, y]);
      if (!Number.isNaN(y)){
        yMin = Math.min(yMin, y);
        yMax = Math.max(yMax, y);
      }
    }
    if (!isFinite(yMin) || !isFinite(yMax)){ yMin = -1; yMax = 1; }
    if (yMin > 0) yMin = 0;
    if (yMax < 0) yMax = 0;
    const yPad = (yMax - yMin) * 0.12 || 1;
    yMin -= yPad; yMax += yPad;

    const xToPx = (x) => padL + ((x - domainMin)/(domainMax - domainMin)) * plotW;
    const yToPx = (y) => padT + plotH - ((y - yMin)/(yMax - yMin)) * plotH;

    ctx.clearRect(0,0,W,H);

    // grid
    ctx.strokeStyle = 'rgba(23,50,78,0.08)';
    ctx.lineWidth = 1;
    for (let i=0;i<=8;i++){
      const px = padL + (i/8)*plotW;
      ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, padT+plotH); ctx.stroke();
    }
    for (let i=0;i<=6;i++){
      const py = padT + (i/6)*plotH;
      ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(padL+plotW, py); ctx.stroke();
    }

    // shaded area between a and b
    ctx.beginPath();
    let started = false;
    for (const [x,y] of pts){
      if (x < a || x > b || Number.isNaN(y)) continue;
      const px = xToPx(x), py = yToPx(y);
      if (!started){ ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
    }
    if (started){
      ctx.lineTo(xToPx(b), yToPx(0));
      ctx.lineTo(xToPx(a), yToPx(0));
      ctx.closePath();
      ctx.fillStyle = 'rgba(230,161,61,0.5)';
      ctx.fill();
      ctx.strokeStyle = '#c9832a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // curve
    ctx.beginPath();
    let curveStarted = false;
    for (const [x,y] of pts){
      if (Number.isNaN(y)) { curveStarted = false; continue; }
      const px = xToPx(x), py = yToPx(y);
      if (!curveStarted){ ctx.moveTo(px, py); curveStarted = true; } else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#17324e';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // axes
    ctx.strokeStyle = 'rgba(23,50,78,0.55)';
    ctx.lineWidth = 1.4;
    const zeroY = yToPx(0);
    ctx.beginPath(); ctx.moveTo(padL, zeroY); ctx.lineTo(padL+plotW, zeroY); ctx.stroke();
    if (domainMin <= 0 && domainMax >= 0){
      const zeroX = xToPx(0);
      ctx.beginPath(); ctx.moveTo(zeroX, padT); ctx.lineTo(zeroX, padT+plotH); ctx.stroke();
    }

    // a, b markers
    ctx.fillStyle = '#17324e';
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('a=' + trimNum(a), xToPx(a), padT+plotH+18);
    ctx.fillText('b=' + trimNum(b), xToPx(b), padT+plotH+18);
  }

  function trimNum(n){
    return Math.round(n*1000)/1000;
  }

  function compute(){
    errorEl.textContent = '';
    const rawFx = fxInput.value;
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);
    let n = parseInt(nInput.value, 10);

    if (Number.isNaN(a) || Number.isNaN(b)){
      errorEl.textContent = 'Los límites a y b deben ser números.';
      return;
    }
    if (a === b){
      errorEl.textContent = 'El intervalo no puede tener a = b.';
      return;
    }
    if (Number.isNaN(n) || n < 2){ n = 2; }
    if (n % 2 !== 0) n += 1;

    let f;
    try{
      f = compileExpression(rawFx);
      const probe = f((a+b)/2);
      if (typeof probe !== 'number'){
        throw new Error('La función no evaluó a un número.');
      }
    } catch(err){
      errorEl.textContent = err.message || 'No se pudo interpretar f(x).';
      return;
    }

    let result;
    try{
      const lo = Math.min(a,b), hi = Math.max(a,b);
      result = simpsonIntegral(f, lo, hi, n);
      if (a > b) result = -result;
    } catch(err){
      errorEl.textContent = 'No se pudo calcular la integral con esta función.';
      return;
    }

    resultEl.textContent = Number.isFinite(result) ? result.toFixed(6) : '—';
    hEl.textContent = Number.isFinite(result) ? (((Math.max(a,b)-Math.min(a,b))/n).toFixed(5)) : '—';

    try{ drawGraph(f, Math.min(a,b), Math.max(a,b)); } catch(e){ /* ignore draw errors */ }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); compute(); });
  compute();
}
