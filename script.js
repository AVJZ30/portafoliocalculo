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
   MOTOR SIMBÓLICO DE INTEGRACIÓN (parser + reglas + verificación
   numérica de cada antiderivada candidata mediante su derivada)
   ============================================================ */
'use strict';

/* ============ Parser ============ */
function tokenize(str){
  const tokens = [];
  let i = 0;
  while (i < str.length){
    const c = str[i];
    if (/\s/.test(c)){ i++; continue; }
    if (/[0-9.]/.test(c)){
      let j = i;
      while (j < str.length && /[0-9.]/.test(str[j])) j++;
      tokens.push({ type:'num', value: parseFloat(str.slice(i,j)) });
      i = j; continue;
    }
    if (/[a-zA-Z]/.test(c)){
      let j = i;
      while (j < str.length && /[a-zA-Z0-9]/.test(str[j])) j++;
      tokens.push({ type:'id', value: str.slice(i,j) });
      i = j; continue;
    }
    if ('+-*/^(),'.includes(c)){ tokens.push({ type:c }); i++; continue; }
    throw new Error('Carácter no reconocido: "' + c + '"');
  }
  return tokens;
}

const FUNC_NAMES = new Set(['sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','exp','ln','log','log10','sqrt','abs']);

function parseExpression(str){
  const tokens = tokenize(str);
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (type) => {
    const t = tokens[pos];
    if (!t || (type && t.type !== type)) throw new Error('Error de sintaxis en la expresión.');
    pos++; return t;
  };

  function parseExpr(){
    let node = parseTerm();
    while (peek() && (peek().type === '+' || peek().type === '-')){
      const op = eat(peek().type).type;
      const rhs = parseTerm();
      node = { type: op === '+' ? 'add' : 'sub', a: node, b: rhs };
    }
    return node;
  }
  function parseTerm(){
    let node = parseUnary();
    while (peek() && (peek().type === '*' || peek().type === '/')){
      const op = eat(peek().type).type;
      const rhs = parseUnary();
      node = { type: op === '*' ? 'mul' : 'div', a: node, b: rhs };
    }
    return node;
  }
  function parseUnary(){
    if (peek() && peek().type === '-'){ eat('-'); return { type:'neg', a: parseUnary() }; }
    if (peek() && peek().type === '+'){ eat('+'); return parseUnary(); }
    return parsePower();
  }
  function parsePower(){
    let base = parseAtom();
    if (peek() && peek().type === '^'){
      eat('^');
      const exp = parseUnary();
      return { type:'pow', base, exp };
    }
    return base;
  }
  function parseAtom(){
    const t = peek();
    if (!t) throw new Error('Expresión incompleta.');
    if (t.type === 'num'){ eat('num'); return { type:'num', value: t.value }; }
    if (t.type === '('){ eat('('); const node = parseExpr(); eat(')'); return node; }
    if (t.type === 'id'){
      eat('id');
      const name = t.value;
      if (peek() && peek().type === '('){
        eat('(');
        const arg = parseExpr();
        eat(')');
        if (!FUNC_NAMES.has(name)) throw new Error('Función desconocida: ' + name);
        return { type:'func', name, arg };
      }
      if (name === 'x') return { type:'var' };
      if (name === 'pi' || name === 'PI') return { type:'num', value: Math.PI };
      if (name === 'e' || name === 'E') return { type:'num', value: Math.E };
      throw new Error('No se reconoce "' + name + '".');
    }
    throw new Error('Token inesperado en la expresión.');
  }

  const result = parseExpr();
  if (pos !== tokens.length) throw new Error('Error de sintaxis al final de la expresión.');
  return result;
}

/* ============ AST helpers ============ */
const numNode = (v) => ({ type:'num', value:v });
const varNode = () => ({ type:'var' });
const addNode = (a,b) => ({ type:'add', a, b });
const subNode = (a,b) => ({ type:'sub', a, b });
const mulNode = (a,b) => ({ type:'mul', a, b });
const divNode = (a,b) => ({ type:'div', a, b });
const negNode = (a) => ({ type:'neg', a });
const powNode = (base,exp) => ({ type:'pow', base, exp });
const funcNode = (name,arg) => ({ type:'func', name, arg });
const isNumVal = (node,v) => node.type === 'num' && Math.abs(node.value - v) < 1e-12;

/* ============ Evaluator ============ */
function evaluate(node, x){
  switch(node.type){
    case 'num': return node.value;
    case 'var': return x;
    case 'add': return evaluate(node.a,x) + evaluate(node.b,x);
    case 'sub': return evaluate(node.a,x) - evaluate(node.b,x);
    case 'mul': return evaluate(node.a,x) * evaluate(node.b,x);
    case 'div': return evaluate(node.a,x) / evaluate(node.b,x);
    case 'neg': return -evaluate(node.a,x);
    case 'pow': return Math.pow(evaluate(node.base,x), evaluate(node.exp,x));
    case 'func': {
      const v = evaluate(node.arg,x);
      switch(node.name){
        case 'sin': return Math.sin(v);
        case 'cos': return Math.cos(v);
        case 'tan': return Math.tan(v);
        case 'asin': return Math.asin(v);
        case 'acos': return Math.acos(v);
        case 'atan': return Math.atan(v);
        case 'sinh': return Math.sinh(v);
        case 'cosh': return Math.cosh(v);
        case 'tanh': return Math.tanh(v);
        case 'exp': return Math.exp(v);
        case 'ln': return Math.log(v);
        case 'log': case 'log10': return Math.log10(v);
        case 'sqrt': return Math.sqrt(v);
        case 'abs': return Math.abs(v);
      }
    }
  }
  throw new Error('Nodo desconocido');
}

function numDeriv(node, x, h){
  h = h || 1e-5;
  return (evaluate(node, x+h) - evaluate(node, x-h)) / (2*h);
}

/* verifies candidate F is an antiderivative of original f (numerically) */
function verifyAntiderivative(candidateAst, originalAst){
  const xs = [0.35, 0.8, 1.4, 2.05, -0.6, -1.35, 2.8, 3.6];
  let matches = 0, total = 0;
  for (const x of xs){
    try{
      const d = numDeriv(candidateAst, x);
      const orig = evaluate(originalAst, x);
      if (!isFinite(d) || !isFinite(orig)) continue;
      total++;
      const scale = Math.max(1, Math.abs(orig));
      if (Math.abs(d - orig) < 2e-2 * scale) matches++;
    } catch(e){ continue; }
  }
  return total >= 4 && matches === total;
}

function ratioConstant(numExprNode, denExprNode){
  const xs = [0.4, 0.9, 1.6, -0.7, -1.4, 2.2, 3.1];
  const ratios = [];
  for (const x of xs){
    try{
      const nv = evaluate(numExprNode, x);
      const dv = evaluate(denExprNode, x);
      if (!isFinite(nv) || !isFinite(dv) || Math.abs(dv) < 1e-8) continue;
      ratios.push(nv/dv);
    } catch(e){ continue; }
  }
  if (ratios.length < 4) return null;
  const avg = ratios.reduce((s,r)=>s+r,0)/ratios.length;
  const ok = ratios.every(r => Math.abs(r - avg) < 1e-3 * Math.max(1, Math.abs(avg)));
  return ok ? avg : null;
}

/* is node a linear function of x: a*x+b ? returns {a,b} or null */
function linearCoeffs(node){
  switch(node.type){
    case 'var': return {a:1,b:0};
    case 'num': return {a:0,b:node.value};
    case 'neg': { const l = linearCoeffs(node.a); return l ? {a:-l.a,b:-l.b} : null; }
    case 'add': { const l=linearCoeffs(node.a), r=linearCoeffs(node.b); return (l&&r) ? {a:l.a+r.a,b:l.b+r.b} : null; }
    case 'sub': { const l=linearCoeffs(node.a), r=linearCoeffs(node.b); return (l&&r) ? {a:l.a-r.a,b:l.b-r.b} : null; }
    case 'mul': {
      const l = linearCoeffs(node.a), r = linearCoeffs(node.b);
      if (l && r){
        if (Math.abs(l.a) < 1e-12) return {a:l.b*r.a, b:l.b*r.b};
        if (Math.abs(r.a) < 1e-12) return {a:r.b*l.a, b:r.b*l.b};
        return null; // nonlinear product
      }
      return null;
    }
    case 'div': {
      const l = linearCoeffs(node.a), r = linearCoeffs(node.b);
      if (l && r && Math.abs(r.a) < 1e-12 && Math.abs(r.b) > 1e-12){
        return {a:l.a/r.b, b:l.b/r.b};
      }
      return null;
    }
    default: return null;
  }
}

/* ============ Constant extraction ============ */
function extractConstant(node){
  if (node.type === 'mul'){
    const L = extractConstant(node.a), R = extractConstant(node.b);
    const c = L.c * R.c;
    let rest;
    if (isNumVal(L.rest,1)) rest = R.rest;
    else if (isNumVal(R.rest,1)) rest = L.rest;
    else rest = mulNode(L.rest, R.rest);
    return { c, rest };
  }
  if (node.type === 'div'){
    const L = extractConstant(node.a);
    if (node.b.type === 'num'){
      return { c: L.c / node.b.value, rest: L.rest };
    }
    return { c: L.c, rest: divNode(L.rest, node.b) };
  }
  if (node.type === 'neg'){
    const L = extractConstant(node.a);
    return { c: -L.c, rest: L.rest };
  }
  if (node.type === 'num'){
    return { c: node.value, rest: numNode(1) };
  }
  return { c: 1, rest: node };
}

/* ============ base (table) antiderivative for func/pow with u = x exactly ============ */
function baseTableAntideriv(node){
  // node depends only on x directly (u = x). Returns ast or null.
  if (node.type === 'var') return { ast: divNode(powNode(varNode(), numNode(2)), numNode(2)), label:'básica (tabla)' };
  if (node.type === 'num') return { ast: mulNode(node, varNode()), label:'básica (tabla)' };
  if (node.type === 'pow' && node.base.type === 'var' && node.exp.type === 'num'){
    const n = node.exp.value;
    if (Math.abs(n + 1) < 1e-9){
      return { ast: funcNode('ln', funcNode('abs', varNode())), label:'básica (tabla)' };
    }
    return { ast: divNode(powNode(varNode(), numNode(n+1)), numNode(n+1)), label:'básica (tabla)' };
  }
  if (node.type === 'div' && isNumVal(node.a,1) && node.b.type === 'var'){
    return { ast: funcNode('ln', funcNode('abs', varNode())), label:'básica (tabla)' };
  }
  if (node.type === 'func' && node.arg.type === 'var'){
    switch(node.name){
      case 'sin': return { ast: negNode(funcNode('cos', varNode())), label:'básica (tabla)' };
      case 'cos': return { ast: funcNode('sin', varNode()), label:'básica (tabla)' };
      case 'tan': return { ast: negNode(funcNode('ln', funcNode('abs', funcNode('cos', varNode())))), label:'básica (tabla)' };
      case 'exp': return { ast: funcNode('exp', varNode()), label:'básica (tabla)' };
      case 'ln': return { ast: subNode(mulNode(varNode(), funcNode('ln', varNode())), varNode()), label:'por partes (tabla: ∫ln x dx)' };
      case 'sqrt': return { ast: divNode(powNode(varNode(), numNode(1.5)), numNode(1.5)), label:'básica (tabla)' };
    }
  }
  return null;
}

/* replace every bare 'var' node inside a template AST with a given sub-AST 'u' (used for linear/general substitution back-substitution) */
function substituteVar(node, uAst){
  switch(node.type){
    case 'var': return uAst;
    case 'num': return node;
    case 'neg': return negNode(substituteVar(node.a,uAst));
    case 'add': return addNode(substituteVar(node.a,uAst), substituteVar(node.b,uAst));
    case 'sub': return subNode(substituteVar(node.a,uAst), substituteVar(node.b,uAst));
    case 'mul': return mulNode(substituteVar(node.a,uAst), substituteVar(node.b,uAst));
    case 'div': return divNode(substituteVar(node.a,uAst), substituteVar(node.b,uAst));
    case 'pow': return powNode(substituteVar(node.base,uAst), node.exp);
    case 'func': return funcNode(node.name, substituteVar(node.arg,uAst));
    default: return node;
  }
}

/* ============ Method-specific leaf integrators ============ */

function tryTrigRewrite(node){
  // sin(x)^2, cos(x)^2, tan(x)^2, sin(x)*cos(x)
  if (node.type === 'pow' && node.exp.type === 'num' && Math.abs(node.exp.value-2) < 1e-9 &&
      node.base.type === 'func' && node.base.arg.type === 'var'){
    const name = node.base.name;
    if (name === 'sin'){
      // (1 - cos(2x))/2
      return divNode(subNode(numNode(1), funcNode('cos', mulNode(numNode(2), varNode()))), numNode(2));
    }
    if (name === 'cos'){
      return divNode(addNode(numNode(1), funcNode('cos', mulNode(numNode(2), varNode()))), numNode(2));
    }
    if (name === 'tan'){
      return subNode(divNode(numNode(1), powNode(funcNode('cos', varNode()), numNode(2))), numNode(1));
    }
  }
  if (node.type === 'mul'){
    const a = node.a, b = node.b;
    const isSin = (n) => n.type==='func' && n.name==='sin' && n.arg.type==='var';
    const isCos = (n) => n.type==='func' && n.name==='cos' && n.arg.type==='var';
    if ((isSin(a) && isCos(b)) || (isSin(b) && isCos(a))){
      return divNode(funcNode('sin', mulNode(numNode(2), varNode())), numNode(2));
    }
  }
  return null;
}

function trySubstitutionLinear(node){
  // func(name, linear(u)) or pow(linear(u), n) or 1/linear(u)
  if (node.type === 'func'){
    const lin = linearCoeffs(node.arg);
    if (lin && Math.abs(lin.a) > 1e-12 && !(Math.abs(lin.a-1)<1e-12 && Math.abs(lin.b)<1e-12)){
      const base = baseTableAntideriv(funcNode(node.name, varNode()));
      if (base){
        const uAst = node.arg;
        const substituted = substituteVar(base.ast, uAst);
        return { ast: divNode(substituted, numNode(lin.a)), label: `sustitución lineal (u = ${describeLinear(lin)})` };
      }
    }
  }
  if (node.type === 'pow' && node.exp.type === 'num'){
    const lin = linearCoeffs(node.base);
    if (lin && Math.abs(lin.a) > 1e-12 && !(Math.abs(lin.a-1)<1e-12 && Math.abs(lin.b)<1e-12)){
      const n = node.exp.value;
      if (Math.abs(n+1) < 1e-9){
        return { ast: divNode(funcNode('ln', funcNode('abs', node.base)), numNode(lin.a)), label: `sustitución lineal (u = ${describeLinear(lin)})` };
      }
      return { ast: divNode(powNode(node.base, numNode(n+1)), numNode(lin.a*(n+1))), label: `sustitución lineal (u = ${describeLinear(lin)})` };
    }
  }
  if (node.type === 'div' && isNumVal(node.a,1)){
    const lin = linearCoeffs(node.b);
    if (lin && Math.abs(lin.a) > 1e-12){
      return { ast: divNode(funcNode('ln', funcNode('abs', node.b)), numNode(lin.a)), label: `sustitución lineal (u = ${describeLinear(lin)})` };
    }
  }
  return null;
}

function describeLinear(lin){
  const coefStr = Math.abs(lin.a-1) < 1e-9 ? 'x' : (Math.abs(lin.a+1) < 1e-9 ? '-x' : `${trimN(lin.a)}x`);
  if (Math.abs(lin.b) < 1e-9) return coefStr;
  const sign = lin.b >= 0 ? '+' : '-';
  return `${coefStr} ${sign} ${trimN(Math.abs(lin.b))}`;
}
function trimN(n){ return Math.round(n*1000)/1000; }

function tryGeneralSubstitution(node){
  // node is mul(A,B) or div(A,B) where inner is func/pow of a nonlinear g(x), and outer ~ derivative of g
  const candidates = [];
  if (node.type === 'mul'){
    candidates.push([node.a, node.b]);
    candidates.push([node.b, node.a]);
  } else if (node.type === 'div'){
    candidates.push([node.a, node.b, true]); // denom marker
  } else return null;

  for (const cand of candidates){
    const outer = cand[0], inner = cand[1], isDenom = !!cand[2];
    if (isDenom){
      // outer / inner, inner = g(x), check outer ~ c * g'(x)  => c*ln|g|
      const c = ratioConstant(outer, { type:'__deriv__', node: inner });
      // custom deriv wrapper below
    }
  }
  // implement properly with a helper for derivative-ratio using numDeriv directly
  function checkPair(outer, inner){
    // returns c if outer(x) ~ c * d/dx[inner](x)
    const xs = [0.4,0.9,1.6,-0.7,-1.4,2.2,3.1];
    const ratios = [];
    for (const x of xs){
      try{
        const dv = numDeriv(inner, x);
        const ov = evaluate(outer, x);
        if (!isFinite(dv) || !isFinite(ov) || Math.abs(dv) < 1e-8) continue;
        ratios.push(ov/dv);
      } catch(e){ continue; }
    }
    if (ratios.length < 4) return null;
    const avg = ratios.reduce((s,r)=>s+r,0)/ratios.length;
    const ok = ratios.every(r => Math.abs(r-avg) < 1e-2*Math.max(1,Math.abs(avg)));
    return ok ? avg : null;
  }

  if (node.type === 'mul'){
    for (const [outer, inner] of [[node.a,node.b],[node.b,node.a]]){
      if (inner.type === 'func' && ['sin','cos','exp'].includes(inner.name)){
        const c = checkPair(outer, inner.arg);
        if (c !== null){
          const base = baseTableAntideriv(funcNode(inner.name, varNode()));
          const substituted = substituteVar(base.ast, inner.arg);
          return { ast: mulNode(numNode(c), substituted), label:'sustitución (u = función interna)' };
        }
      }
      if (inner.type === 'pow' && inner.exp.type === 'num'){
        const n = inner.exp.value;
        const c = checkPair(outer, inner.base);
        if (c !== null){
          if (Math.abs(n+1) < 1e-9){
            return { ast: mulNode(numNode(c), funcNode('ln', funcNode('abs', inner.base))), label:'sustitución (u = función interna)' };
          }
          return { ast: mulNode(numNode(c/(n+1)), powNode(inner.base, numNode(n+1))), label:'sustitución (u = función interna)' };
        }
      }
    }
  }
  if (node.type === 'div'){
    const outer = node.a, inner = node.b;
    const c = checkPair(outer, inner);
    if (c !== null){
      return { ast: mulNode(numNode(c), funcNode('ln', funcNode('abs', inner))), label:'sustitución (u = función interna, forma g\'/g)' };
    }
  }
  return null;
}

function tryByParts(node){
  if (node.type !== 'mul') return null;
  const pairs = [[node.a,node.b],[node.b,node.a]];
  for (const [p, q] of pairs){
    // x * e^(linear)
    if (p.type === 'var' && q.type === 'func' && q.name === 'exp'){
      const lin = linearCoeffs(q.arg);
      if (lin){
        if (Math.abs(lin.a) < 1e-12) continue;
        if (Math.abs(lin.b) < 1e-9 && Math.abs(lin.a-1) < 1e-9){
          return { ast: mulNode(subNode(varNode(), numNode(1)), funcNode('exp', varNode())), label:'por partes (u=x, dv=eˣdx)' };
        }
        const a = lin.a;
        const uPart = divNode(subNode(mulNode(numNode(a), varNode()), numNode(1)), numNode(a*a));
        return { ast: mulNode(uPart, funcNode('exp', q.arg)), label:'por partes (con sustitución lineal en el exponente)' };
      }
    }
    // x * sin(x) , x * cos(x)  (var argument only, simple textbook case)
    if (p.type === 'var' && q.type === 'func' && q.name === 'sin' && q.arg.type === 'var'){
      return { ast: subNode(funcNode('sin', varNode()), mulNode(varNode(), funcNode('cos', varNode()))), label:'por partes (u=x, dv=sin x dx)' };
    }
    if (p.type === 'var' && q.type === 'func' && q.name === 'cos' && q.arg.type === 'var'){
      return { ast: addNode(funcNode('cos', varNode()), mulNode(varNode(), funcNode('sin', varNode()))), label:'por partes (u=x, dv=cos x dx)' };
    }
    // x * ln(x)
    if (p.type === 'var' && q.type === 'func' && q.name === 'ln' && q.arg.type === 'var'){
      return { ast: subNode(mulNode(divNode(powNode(varNode(),numNode(2)),numNode(2)), funcNode('ln', varNode())), divNode(powNode(varNode(),numNode(2)),numNode(4))), label:'por partes (u=ln x, dv=x dx)' };
    }
    // x^2 * e^x  (classic tabular)
    if (p.type === 'pow' && p.base.type === 'var' && p.exp.type === 'num' && Math.abs(p.exp.value-2)<1e-9 &&
        q.type === 'func' && q.name === 'exp' && q.arg.type === 'var'){
      return { ast: mulNode(subNode(addNode(powNode(varNode(),numNode(2)),numNode(2)), mulNode(numNode(2),varNode())), funcNode('exp',varNode())), label:'por partes tabular (x²eˣ)' };
    }
  }
  return null;
}

/* Fracciones parciales: div(P, Q) with Q = mul(linear,linear) [distinct roots] or pow(linear,2) [repeated root], P constant or linear */
function polyLinCoeffs(node){
  // returns {p1,p0} if node behaves like p1*x+p0 (degree <=1), by sampling; else null
  try{
    const p0 = evaluate(node, 0);
    const p1v = evaluate(node, 1);
    const p1 = p1v - p0;
    const check = evaluate(node, 2.7);
    const predicted = p1*2.7 + p0;
    if (Math.abs(check - predicted) < 1e-6 * Math.max(1, Math.abs(predicted))) return {p1,p0};
    return null;
  } catch(e){ return null; }
}

function tryPartialFractions(node){
  if (node.type !== 'div') return null;
  const P = node.a, Q = node.b;
  const pc = polyLinCoeffs(P);
  if (!pc) return null;

  // Case: Q = pow(linear, 2) -> repeated root
  if (Q.type === 'pow' && Q.exp.type === 'num' && Math.abs(Q.exp.value-2) < 1e-9){
    const lin = linearCoeffs(Q.base);
    if (lin && Math.abs(lin.a) > 1e-12){
      const a = lin.a, b = lin.b;
      const A = pc.p1 / a;
      const r = -b/a;
      const B = pc.p1*r + pc.p0; // P(r)
      // result = (A/a) ln|ax+b| - B/(a*(ax+b))
      const term1 = mulNode(numNode(A/a), funcNode('ln', funcNode('abs', Q.base)));
      const term2 = negNode(divNode(numNode(B), mulNode(numNode(a), Q.base)));
      return { ast: addNode(term1, term2), label:`fracciones parciales (caso 2: raíz repetida x=${trimN(r)})` };
    }
  }
  // Case: Q = mul(linear1, linear2) distinct
  if (Q.type === 'mul'){
    const lin1 = linearCoeffs(Q.a), lin2 = linearCoeffs(Q.b);
    if (lin1 && lin2 && Math.abs(lin1.a) > 1e-12 && Math.abs(lin2.a) > 1e-12){
      const r1 = -lin1.b/lin1.a, r2 = -lin2.b/lin2.a;
      if (Math.abs(r1 - r2) > 1e-7){
        const P_r1 = pc.p1*r1 + pc.p0;
        const P_r2 = pc.p1*r2 + pc.p0;
        const denomAtR1 = lin2.a*r1 + lin2.b; // evaluate factor2 at r1
        const denomAtR2 = lin1.a*r2 + lin1.b; // evaluate factor1 at r2
        if (Math.abs(denomAtR1) < 1e-9 || Math.abs(denomAtR2) < 1e-9) return null;
        const A = P_r1/denomAtR1;
        const B = P_r2/denomAtR2;
        const term1 = mulNode(numNode(A/lin1.a), funcNode('ln', funcNode('abs', Q.a)));
        const term2 = mulNode(numNode(B/lin2.a), funcNode('ln', funcNode('abs', Q.b)));
        return { ast: addNode(term1, term2), label:`fracciones parciales (caso 1: raíces x=${trimN(r1)}, x=${trimN(r2)})` };
      }
    }
  }
  // Case: Q written as a single expanded quadratic, e.g. x^2 - 5*x + 6 (not pre-factored)
  const quad = polyQuadCoeffs(Q);
  if (quad && Math.abs(quad.a) > 1e-12){
    const { a, b, c } = quad;
    const D = b*b - 4*a*c;
    if (D > 1e-9){
      const sqrtD = Math.sqrt(D);
      const r1 = (-b + sqrtD) / (2*a), r2 = (-b - sqrtD) / (2*a);
      const P_r1 = pc.p1*r1 + pc.p0, P_r2 = pc.p1*r2 + pc.p0;
      const A = P_r1 / (a*(r1-r2));
      const B = P_r2 / (a*(r2-r1));
      const term1 = mulNode(numNode(A), funcNode('ln', funcNode('abs', xMinus(r1))));
      const term2 = mulNode(numNode(B), funcNode('ln', funcNode('abs', xMinus(r2))));
      return { ast: addNode(term1, term2), label:`fracciones parciales (caso 1: denominador factoriza en x=${trimN(r1)} y x=${trimN(r2)})` };
    }
    if (Math.abs(D) <= 1e-9){
      const r = -b/(2*a);
      const term1 = mulNode(numNode(pc.p1/a), funcNode('ln', funcNode('abs', xMinus(r))));
      const term2 = negNode(divNode(numNode((pc.p1*r+pc.p0)/a), xMinus(r)));
      return { ast: addNode(term1, term2), label:`fracciones parciales (caso 2: raíz repetida x=${trimN(r)})` };
    }
    // D < 0: raíces complejas — fuera de alcance de fracciones parciales caso 1/2 (no soportado)
  }
  return null;
}

/* builds "x - r" avoiding an ugly "x - -3" when r is negative */
function xMinus(r){
  return r >= 0 ? subNode(varNode(), numNode(r)) : addNode(varNode(), numNode(-r));
}

/* fits node to a*x^2+b*x+c by sampling; returns null if it isn't degree <=2 */
function polyQuadCoeffs(node){
  try{
    const p0 = evaluate(node, 0);
    const p1v = evaluate(node, 1);
    const pm1v = evaluate(node, -1);
    const a = (p1v + pm1v) / 2 - p0;
    const b = (p1v - pm1v) / 2;
    const c = p0;
    const check = evaluate(node, 2.6);
    const predicted = a*2.6*2.6 + b*2.6 + c;
    if (!isFinite(check) || !isFinite(predicted)) return null;
    if (Math.abs(check - predicted) < 1e-6 * Math.max(1, Math.abs(predicted))) return { a, b, c };
    return null;
  } catch(e){ return null; }
}

/* ============ leaf dispatcher ============ */
function integrateLeaf(node, method){
  const allow = (name) => method === 'auto' || method === name;

  // 1. trig rewrite always tried first if allowed (rewrites into +/- form, recurse)
  if (allow('trig')){
    const rewritten = tryTrigRewrite(node);
    if (rewritten){
      const inner = integrateExpr(rewritten, 'auto'); // rewritten form needs linear-sub/basic internally regardless of outer method
      if (inner) return { ast: inner.ast, label: 'trigonométrica (identidad de ángulo doble / producto a suma)' };
    }
  }

  // 2. direct table (u = x)
  const base = baseTableAntideriv(node);
  if (base) return base;

  // 3. substitution
  if (allow('sustitucion')){
    const lin = trySubstitutionLinear(node);
    if (lin) return lin;
    if (node.type === 'mul' || node.type === 'div'){
      const gen = tryGeneralSubstitution(node);
      if (gen) return gen;
    }
  }

  // 4. by parts
  if (allow('partes') && node.type === 'mul'){
    const bp = tryByParts(node);
    if (bp) return bp;
  }

  // 5. partial fractions
  if (allow('fracciones') && node.type === 'div'){
    const pf = tryPartialFractions(node);
    if (pf) return pf;
  }

  return null;
}

/* ============ top-level dispatcher with constant/sum handling ============ */
function integrateExpr(node, method){
  if (node.type === 'add'){
    const A = integrateExpr(node.a, method), B = integrateExpr(node.b, method);
    if (A && B) return { ast: addNode(A.ast,B.ast), label: mergeLabels(A.label,B.label) };
    return null;
  }
  if (node.type === 'sub'){
    const A = integrateExpr(node.a, method), B = integrateExpr(node.b, method);
    if (A && B) return { ast: subNode(A.ast,B.ast), label: mergeLabels(A.label,B.label) };
    return null;
  }
  const { c, rest } = extractConstant(node);
  if (rest.type === 'num' && Math.abs(rest.value-1) < 1e-12){
    return { ast: mulNode(numNode(c), varNode()), label:'básica (tabla)' };
  }
  let leafResult;
  if (rest.type === 'add' || rest.type === 'sub'){
    leafResult = integrateExpr(rest, method);
  } else {
    leafResult = integrateLeaf(rest, method);
  }
  if (!leafResult) return null;
  if (Math.abs(c-1) < 1e-12) return leafResult;
  return { ast: mulNode(numNode(c), leafResult.ast), label: leafResult.label };
}

function mergeLabels(a,b){
  if (a === b) return a;
  const parts = new Set([...(a||'').split(' + '), ...(b||'').split(' + ')]);
  return Array.from(parts).join(' + ');
}

/* main entry with verification gate */
function integrate(exprString, method){
  const node = parseExpression(exprString);
  const result = integrateExpr(node, method);
  if (!result) return { ok:false };
  if (!verifyAntiderivative(result.ast, node)) return { ok:false, unverified:true };
  return { ok:true, ast: result.ast, label: result.label };
}

/* ============ toLatex ============ */
function prec(node){
  switch(node.type){
    case 'add': case 'sub': return 1;
    case 'mul': case 'div': return 2;
    case 'neg': return 3;
    case 'pow': return 4;
    default: return 5;
  }
}
function roundNice(v){
  const r = Math.round(v);
  if (Math.abs(v-r) < 1e-6) return r;
  const r4 = Math.round(v*10000)/10000;
  return r4;
}
function formatNum(v){
  v = roundNice(v);
  if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
  let s = v.toFixed(4);
  s = s.replace(/0+$/,'').replace(/\.$/,'');
  return s;
}
const FUNC_LATEX = { sin:'\\sin', cos:'\\cos', tan:'\\tan', asin:'\\arcsin', acos:'\\arccos', atan:'\\arctan',
  sinh:'\\sinh', cosh:'\\cosh', tanh:'\\tanh', log:'\\log', log10:'\\log_{10}' };

function toLatex(node){
  switch(node.type){
    case 'num': return formatNum(node.value);
    case 'var': return 'x';
    case 'add': return `${wrap(node.a,1)} + ${wrap(node.b,1)}`;
    case 'sub': return `${wrap(node.a,1)} - ${wrap(node.b,2)}`;
    case 'mul': {
      if (node.a.type === 'num' && Math.abs(node.a.value + 1) < 1e-9) return `-${wrap(node.b,2)}`;
      return `${wrap(node.a,2)} \\cdot ${wrap(node.b,2)}`;
    }
    case 'div': return `\\frac{${toLatex(node.a)}}{${toLatex(node.b)}}`;
    case 'neg': return `-${wrap(node.a,3)}`;
    case 'pow': return `${wrap(node.base,5)}^{${toLatex(node.exp)}}`;
    case 'func': {
      if (node.name === 'exp') return `e^{${toLatex(node.arg)}}`;
      if (node.name === 'ln') return `\\ln\\left(${toLatex(node.arg)}\\right)`;
      if (node.name === 'sqrt') return `\\sqrt{${toLatex(node.arg)}}`;
      if (node.name === 'abs') return `\\left|${toLatex(node.arg)}\\right|`;
      const fn = FUNC_LATEX[node.name] || ('\\operatorname{'+node.name+'}');
      return `${fn}\\left(${toLatex(node.arg)}\\right)`;
    }
  }
  return '?';
}
function wrap(node, parentPrec){
  const s = toLatex(node);
  return prec(node) < parentPrec ? `\\left(${s}\\right)` : s;
}

/* ============ simplify ============ */
function simplify(node){
  switch(node.type){
    case 'num': case 'var': return node;
    case 'neg': {
      const a = simplify(node.a);
      if (a.type==='num') return numNode(-a.value);
      if (a.type==='neg') return a.a;
      return negNode(a);
    }
    case 'add': {
      let a=simplify(node.a), b=simplify(node.b);
      if (a.type==='num' && b.type==='num') return numNode(a.value+b.value);
      if (a.type==='num' && Math.abs(a.value)<1e-6) return b;
      if (b.type==='num' && Math.abs(b.value)<1e-6) return a;
      if (b.type==='neg') return simplify(subNode(a,b.a));
      if (b.type==='mul' && b.a.type==='num' && b.a.value < 0) return simplify(subNode(a, mulNode(numNode(-b.a.value), b.b)));
      if (b.type==='num' && b.value < 0) return simplify(subNode(a, numNode(-b.value)));
      return addNode(a,b);
    }
    case 'sub': {
      let a=simplify(node.a), b=simplify(node.b);
      if (a.type==='num' && b.type==='num') return numNode(a.value-b.value);
      if (b.type==='num' && Math.abs(b.value)<1e-6) return a;
      if (a.type==='num' && Math.abs(a.value)<1e-6) return simplify(negNode(b));
      if (b.type==='neg') return simplify(addNode(a,b.a));
      return subNode(a,b);
    }
    case 'mul': {
      let a=simplify(node.a), b=simplify(node.b);
      if (a.type==='num' && b.type==='num') return numNode(a.value*b.value);
      if (a.type==='num' && Math.abs(a.value)<1e-6) return numNode(0);
      if (b.type==='num' && Math.abs(b.value)<1e-6) return numNode(0);
      if (a.type==='num' && Math.abs(a.value-1)<1e-6) return b;
      if (b.type==='num' && Math.abs(b.value-1)<1e-6) return a;
      if (a.type==='num' && Math.abs(a.value+1)<1e-6) return simplify(negNode(b));
      if (b.type==='num' && Math.abs(b.value+1)<1e-6) return simplify(negNode(a));
      if (a.type==='num' && b.type==='mul' && b.a.type==='num') return simplify(mulNode(numNode(a.value*b.a.value), b.b));
      if (b.type==='num' && a.type==='mul' && a.a.type==='num') return simplify(mulNode(numNode(b.value*a.a.value), a.b));
      if (b.type==='neg') return simplify(negNode(mulNode(a,b.a)));
      if (a.type==='neg') return simplify(negNode(mulNode(a.a,b)));
      if (b.type==='div') return simplify(divNode(mulNode(a,b.a), b.b));
      if (a.type==='div') return simplify(divNode(mulNode(a.a,b), a.b));
      return mulNode(a,b);
    }
    case 'div': {
      let a=simplify(node.a), b=simplify(node.b);
      if (b.type==='num' && Math.abs(b.value-1)<1e-6) return a;
      if (a.type==='num' && b.type==='num' && Math.abs(b.value) > 1e-9) return numNode(a.value/b.value);
      if (a.type==='num' && Math.abs(a.value)<1e-6) return numNode(0);
      if (a.type==='neg') return simplify(negNode(divNode(a.a,b)));
      if (b.type==='neg') return simplify(negNode(divNode(a,b.a)));
      if (a.type==='mul' && a.a.type==='num' && b.type==='num') return simplify(mulNode(numNode(a.a.value/b.value), a.b));
      if (a.type==='mul' && a.b.type==='num' && b.type==='num') return simplify(mulNode(numNode(a.b.value/b.value), a.a));
      if (a.type==='div' && b.type==='num') return simplify(divNode(a.a, mulNode(a.b, numNode(b.value))));
      return divNode(a,b);
    }
    case 'pow': {
      let base=simplify(node.base), exp=simplify(node.exp);
      if (exp.type==='num' && Math.abs(exp.value-1)<1e-6) return base;
      if (exp.type==='num' && Math.abs(exp.value)<1e-6) return numNode(1);
      if (base.type==='num' && exp.type==='num') return numNode(Math.pow(base.value,exp.value));
      return powNode(base,exp);
    }
    case 'func': return funcNode(node.name, simplify(node.arg));
  }
  return node;
}
function simplifyFixed(node){
  let prev = node, cur = simplify(node);
  let i=0;
  while (JSON.stringify(cur) !== JSON.stringify(prev) && i<6){ prev=cur; cur=simplify(cur); i++; }
  return cur;
}

/* ============================================================
   CALCULADORA — UI: definida / indefinida, selector de método,
   resolución simbólica (cuando es posible) + respaldo numérico
   ============================================================ */

const METHOD_LABELS = {
  auto: 'Automático',
  sustitucion: 'Sustitución (cambio de variable)',
  partes: 'Por partes',
  trig: 'Trigonométrica',
  fracciones: 'Fracciones parciales'
};

function fmtResult(n){
  if (!isFinite(n)) return '—';
  const r = Math.round(n * 1e6) / 1e6;
  return r.toString();
}

function safeEval(ast){
  return function(x){
    try{
      const v = evaluate(ast, x);
      return isFinite(v) ? v : NaN;
    } catch(e){ return NaN; }
  };
}

function setupCalculator(){
  const form = document.getElementById('calcForm');
  const fxInput = document.getElementById('fxInput');
  const tipoGroup = document.getElementById('tipoGroup');
  const metodoSelect = document.getElementById('metodoSelect');
  const boundsFields = document.getElementById('boundsFields');
  const particionesField = document.getElementById('particionesField');
  const aInput = document.getElementById('aInput');
  const bInput = document.getElementById('bInput');
  const nInput = document.getElementById('nInput');
  const errorEl = document.getElementById('calcError');
  const outputEl = document.getElementById('calcOutput');
  const canvas = document.getElementById('calcCanvas');
  if (!form || !canvas) return;
  const ctx = canvas.getContext('2d');

  let mode = 'definida';

  function setMode(newMode){
    mode = newMode;
    tipoGroup.querySelectorAll('.pill').forEach(b => {
      b.classList.toggle('pill--active', b.dataset.tipo === mode);
    });
    const hide = mode === 'indefinida';
    boundsFields.style.display = hide ? 'none' : '';
    particionesField.style.display = hide ? 'none' : '';
    compute();
  }

  tipoGroup.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.tipo));
  });
  metodoSelect.addEventListener('change', compute);

  function drawGraph(f, a, b, shaded){
    const W = canvas.width, H = canvas.height;
    const padL = 50, padB = 36, padT = 20, padR = 20;
    const plotW = W - padL - padR, plotH = H - padT - padB;

    let lo = a, hi = b;
    if (!isFinite(lo) || !isFinite(hi) || lo === hi){ lo = -6; hi = 6; }
    const span = hi - lo || 1;
    const pad = span * 0.25;
    const domainMin = lo - pad, domainMax = hi + pad;

    let yMin = Infinity, yMax = -Infinity;
    const samples = 320;
    const pts = [];
    for (let i = 0; i <= samples; i++){
      const x = domainMin + (i/samples) * (domainMax - domainMin);
      const y = f(x);
      pts.push([x, y]);
      if (!Number.isNaN(y)){ yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
    }
    if (!isFinite(yMin) || !isFinite(yMax)){ yMin = -1; yMax = 1; }
    if (yMin > 0) yMin = 0;
    if (yMax < 0) yMax = 0;
    const yPad = (yMax - yMin) * 0.12 || 1;
    yMin -= yPad; yMax += yPad;

    const xToPx = (x) => padL + ((x - domainMin)/(domainMax - domainMin)) * plotW;
    const yToPx = (y) => padT + plotH - ((y - yMin)/(yMax - yMin)) * plotH;

    ctx.clearRect(0,0,W,H);

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

    if (shaded && isFinite(a) && isFinite(b)){
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
    }

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

    ctx.strokeStyle = 'rgba(23,50,78,0.55)';
    ctx.lineWidth = 1.4;
    const zeroY = yToPx(0);
    ctx.beginPath(); ctx.moveTo(padL, zeroY); ctx.lineTo(padL+plotW, zeroY); ctx.stroke();
    if (domainMin <= 0 && domainMax >= 0){
      const zeroX = xToPx(0);
      ctx.beginPath(); ctx.moveTo(zeroX, padT); ctx.lineTo(zeroX, padT+plotH); ctx.stroke();
    }

    if (shaded && isFinite(a) && isFinite(b)){
      ctx.fillStyle = '#17324e';
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('a=' + fmtResult(a), xToPx(a), padT+plotH+18);
      ctx.fillText('b=' + fmtResult(b), xToPx(b), padT+plotH+18);
    }
  }

  function compute(){
    errorEl.textContent = '';
    outputEl.innerHTML = '';
    const rawFx = fxInput.value.trim();
    const method = metodoSelect.value;

    if (!rawFx){
      errorEl.textContent = 'Escribe una función.';
      return;
    }

    let ast;
    try{
      ast = parseExpression(rawFx);
    } catch(err){
      errorEl.textContent = err.message || 'No se pudo interpretar f(x).';
      return;
    }
    const f = safeEval(ast);

    let symbolic = { ok: false };
    try{ symbolic = integrate(rawFx, method); } catch(e){ symbolic = { ok: false }; }

    let html = '';

    if (mode === 'definida'){
      let a = parseFloat(aInput.value);
      let b = parseFloat(bInput.value);
      let n = parseInt(nInput.value, 10);
      if (Number.isNaN(a) || Number.isNaN(b)){
        errorEl.textContent = 'Los límites a y b deben ser números.';
        return;
      }
      if (a === b){
        errorEl.textContent = 'El intervalo no puede tener a = b.';
        return;
      }
      if (Number.isNaN(n) || n < 2) n = 2;
      if (n % 2 !== 0) n += 1;

      const lo = Math.min(a,b), hi = Math.max(a,b);
      let numeric = simpsonIntegral(f, lo, hi, n);
      if (a > b) numeric = -numeric;

      html += `<div class="calc-output__row">
        <div class="calc-output__value">
          <span>Valor numérico (Simpson)</span>
          <strong>${isFinite(numeric) ? fmtResult(numeric) : '—'}</strong>
        </div>
        <div class="calc-output__value calc-output__value--muted">
          <span>Ancho de partición (h)</span>
          <strong>${((hi-lo)/n).toFixed(5)}</strong>
        </div>
      </div>`;

      if (!isFinite(numeric)){
        html += `<p class="calc-note">La función no parece estar definida en todo el intervalo [${fmtResult(a)}, ${fmtResult(b)}].</p>`;
      }

      if (symbolic.ok){
        let exact = NaN;
        try{ exact = evaluate(symbolic.ast, b) - evaluate(symbolic.ast, a); } catch(e){ exact = NaN; }
        if (isFinite(exact)){
          html += `<div class="calc-output__value">
            <span>Valor exacto (teorema de Barrow)</span>
            <strong>${fmtResult(exact)}</strong>
          </div>`;
        }
        html += `<div><span class="calc-method-tag">${symbolic.label}</span></div>
          <div class="calc-antideriv" id="calcAntiderivBox"></div>`;
      } else {
        html += `<p class="calc-note">No se encontró una antiderivada en forma cerrada con el método "${METHOD_LABELS[method]}"; se muestra solo el valor numérico. Prueba con "Automático".</p>`;
      }

      outputEl.innerHTML = html;
      if (symbolic.ok){
        const box = document.getElementById('calcAntiderivBox');
        const latex = toLatex(simplifyFixed(symbolic.ast)) + ' + C';
        if (box && window.katex) katex.render(latex, box, { throwOnError: false, displayMode: true });
      }
      drawGraph(f, Math.min(a,b), Math.max(a,b), true);

    } else {
      // indefinida
      if (symbolic.ok){
        html += `<div><span class="calc-method-tag">${symbolic.label}</span></div>
          <div class="calc-antideriv" id="calcAntiderivBox"></div>`;
      } else {
        html += `<p class="calc-note">No se pudo encontrar una antiderivada en forma cerrada con el método "${METHOD_LABELS[method]}". Prueba con "Automático" o revisa que la función esté bien escrita.</p>`;
      }
      outputEl.innerHTML = html;
      if (symbolic.ok){
        const box = document.getElementById('calcAntiderivBox');
        const latex = toLatex(simplifyFixed(symbolic.ast)) + ' + C';
        if (box && window.katex) katex.render(latex, box, { throwOnError: false, displayMode: true });
      }
      const a = parseFloat(aInput.value), b = parseFloat(bInput.value);
      drawGraph(f, isFinite(a) ? a : -6, isFinite(b) ? b : 6, false);
    }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); compute(); });
  compute();
}
