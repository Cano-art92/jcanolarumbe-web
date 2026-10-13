import { SITE, GROUPS, PROJECTS } from './content.js';
import { renderIndex, renderStrip, renderFicha, renderViewer, pageTitle } from './render.js';

const N = PROJECTS.length;
const $ = s => document.querySelector(s);
const indexEl = $('#index'), stripEl = $('#strip'), wrapEl = $('#stripWrap'), fichaEl = $('#ficha'), viewer = $('#viewer');
const isMobile = () => window.matchMedia('(max-width:800px)').matches;
/* sandboxed previews (claude.ai) cannot embed Vimeo; the real site can */
const EMBED_OK = (window.self === window.top) && !/claude\.(ai|com)$/.test(location.hostname);

let current = +(document.body.dataset.current || 0);

/* ---------------- legacy #hash links from the first prototype ---------------- */
(function upgradeHash() {
  const h = location.hash.replace('#', '');
  if (h.startsWith('work/')) history.replaceState(null, '', `/work/${h.slice(5)}/`);
  else if (h === 'about') history.replaceState(null, '', '/about/');
  else if (h === 'work') history.replaceState(null, '', '/');
  else if (h === 'contact' && !location.pathname.startsWith('/about')) history.replaceState(null, '', '/about/#contact');
})();

/* ---------------- render only if the server did not ---------------- */
if (!indexEl.children.length) indexEl.innerHTML = renderIndex(PROJECTS, GROUPS, current);
if (!stripEl.children.length) stripEl.innerHTML = renderStrip(PROJECTS, current);
if (!fichaEl.children.length) fichaEl.innerHTML = renderFicha(PROJECTS[current], { withPlay: true });

/* ---------------- filmstrip ---------------- */
let baseY = 0, curY = null, raf = 0, wheelLock = false, hoverT = 0;
function cellSizes() {
  const cs = getComputedStyle(document.documentElement);
  const small = parseFloat(cs.getPropertyValue('--cell-w')), big = parseFloat(cs.getPropertyValue('--cell-w-active')), gap = parseFloat(cs.getPropertyValue('--cell-gap'));
  return { hs: small * 10 / 16 + 8, hb: big * 10 / 16 + 18, gap };
}
function layoutStrip() {
  if (isMobile()) return;
  const { hs, hb, gap } = cellSizes(); let y = 0, c = 0;
  PROJECTS.forEach((p, i) => { const h = i === current ? hb : hs; if (i === current) c = y + h / 2; y += h + gap; });
  baseY = wrapEl.clientHeight / 2 - c;
  if (curY === null) { curY = baseY; stripEl.style.transform = `translate(-50%, ${curY}px)`; }
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  curY += (baseY - curY) * 0.06;
  stripEl.style.transform = `translate(-50%, ${curY}px)`;
  raf = Math.abs(baseY - curY) > 0.3 ? requestAnimationFrame(tick) : 0;
}
window.addEventListener('resize', layoutStrip);
wrapEl.addEventListener('wheel', e => {
  if (isMobile()) return;
  e.preventDefault();
  if (wheelLock || Math.abs(e.deltaY) < 4) return;
  wheelLock = true; setTimeout(() => wheelLock = false, 650);
  setCurrent((current + (e.deltaY > 0 ? 1 : -1) + N) % N);
}, { passive: false });

function setCurrent(i, { animate = true } = {}) {
  if (i === current && fichaEl.dataset.i == i) return;
  current = i; const p = PROJECTS[i];
  document.querySelectorAll('.row').forEach(r => r.classList.toggle('is-current', +r.dataset.i === i));
  document.querySelectorAll('.cell').forEach(c => c.classList.toggle('is-active', +c.dataset.i === i));
  layoutStrip();
  fichaEl.classList.remove('is-swapping'); void fichaEl.offsetWidth;
  fichaEl.innerHTML = renderFicha(p, { withPlay: true });
  fichaEl.dataset.i = i;
  if (animate) fichaEl.classList.add('is-swapping');
}
fichaEl.dataset.i = current;

indexEl.addEventListener('mouseover', e => { const r = e.target.closest('.row'); if (r) setCurrent(+r.dataset.i); });
indexEl.addEventListener('focusin', e => { const r = e.target.closest('.row'); if (r) setCurrent(+r.dataset.i); });
/* a photo only becomes current after the pointer rests on it, so crossing the strip changes nothing */
stripEl.addEventListener('mouseover', e => { const c = e.target.closest('.cell'); if (!c || isMobile()) return; clearTimeout(hoverT); hoverT = setTimeout(() => setCurrent(+c.dataset.i), 380); });
stripEl.addEventListener('mouseleave', () => clearTimeout(hoverT));

/* ---------------- shark cursor ---------------- */
const cur = $('#cur');
const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
let cx = -100, cy = -100, craf = 0;
const HOT_X = 12.5, HOT_Y = 1.4;   /* tip of the snout in the napkin drawing, at 26x40 */
function drawCur() { craf = 0; cur.style.transform = `translate(${cx - HOT_X}px, ${cy - HOT_Y}px)`; }
if (fine) {
  document.body.classList.add('has-cur');
  document.addEventListener('pointermove', e => {
    cx = e.clientX; cy = e.clientY;
    cur.classList.add('is-on');
    if (!craf) craf = requestAnimationFrame(drawCur);
  }, { passive: true });
  /* over the Vimeo player the page gets no pointer events: hide the shark instead of leaving it frozen */
  document.addEventListener('mouseover', e => { if (e.target.tagName === 'IFRAME') cur.classList.remove('is-on'); });
  document.addEventListener('pointerdown', () => cur.classList.add('is-bite'), { passive: true });
  document.addEventListener('pointerup', () => setTimeout(() => cur.classList.remove('is-bite'), 140), { passive: true });
  document.documentElement.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
}
const bite = fn => (fine ? setTimeout(fn, 120) : fn());

/* ---------------- routing: real URLs ---------------- */
function routeOf(path) {
  const m = path.match(/^\/work\/([^/]+)\/?$/);
  if (m) { const p = PROJECTS.find(x => x.slug === m[1]); if (p) return { page: 'work', project: p }; }
  if (/^\/about\/?$/.test(path)) return { page: 'about' };
  return { page: 'work' };
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('is-active', p.id === 'page-' + name));
  document.body.dataset.page = name;
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href') === (name === 'about' ? '/about/' : '/')) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  if (name === 'work') layoutStrip();
}

function openViewer(p) {
  if (!(viewer.dataset.slug === p.slug && viewer.classList.contains('is-open'))) {
    viewer.innerHTML = renderViewer(p, PROJECTS, GROUPS, SITE, { h: 'h2' });
    viewer.dataset.slug = p.slug;
    viewer.scrollTop = 0;
  }
  viewer.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  setCurrent(p.i, { animate: false });
}
function closeViewer() {
  if (!viewer.classList.contains('is-open')) return;
  viewer.classList.remove('is-open');
  viewer.innerHTML = ''; viewer.dataset.slug = '';
  document.body.style.overflow = '';
}

function applyRoute({ scroll = true } = {}) {
  const r = routeOf(location.pathname);
  if (r.project) { showPage('work'); openViewer(r.project); }
  else {
    closeViewer(); showPage(r.page);
    if (scroll) {
      const target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0 });
    }
  }
  document.title = pageTitle(r, SITE);
}
function navigate(url) {
  const u = new URL(url, location.href);
  if (u.pathname + u.hash !== location.pathname + location.hash) history.pushState(null, '', u.pathname + u.hash);
  applyRoute();
}
window.addEventListener('popstate', () => applyRoute());

document.addEventListener('click', e => {
  /* play button inside the viewer */
  const play = e.target.closest('[data-play]');
  if (play) {
    const box = play.closest('.player'), id = box.dataset.vimeo;
    if (!EMBED_OK) { window.open(`https://vimeo.com/${id}`, '_blank', 'noopener'); return; }
    box.innerHTML = `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${viewer.querySelector('.h')?.textContent || 'Video'}"></iframe>`;
    return;
  }
  /* internal links become in-page navigation */
  const a = e.target.closest('a');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || !/^\/(work\/[^/]+\/|about\/)?$/.test(u.pathname)) return;
  e.preventDefault();
  const go = () => navigate(u.pathname + u.hash);
  if (a.matches('.row, .cell, .play')) bite(go); else go();
});

document.addEventListener('keydown', e => {
  if (viewer.classList.contains('is-open')) {
    const i = PROJECTS.findIndex(p => p.slug === viewer.dataset.slug);
    if (e.key === 'Escape') navigate('/');
    if (e.key === 'ArrowRight') navigate(PROJECTS[(i + 1) % N].path);
    if (e.key === 'ArrowLeft') navigate(PROJECTS[(i - 1 + N) % N].path);
  } else if (document.body.dataset.page === 'work') {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCurrent((current + 1) % N); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCurrent((current - 1 + N) % N); }
  }
});

applyRoute({ scroll: !!location.hash });
