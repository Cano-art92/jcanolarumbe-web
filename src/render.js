/* Pure HTML renderers, shared by the build (Node) and the browser. */

export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CIRCLE = `<svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M52 3 C 78 1, 99 9, 98 21 C 97 33, 74 39, 47 38 C 20 37, 1 31, 2 19 C 3 8, 24 3, 50 4 C 62 4, 70 5, 76 7"/></svg>`;

export const fullTitle = p => p.title + (p.alt ? ` (${p.alt})` : '');

export function pageTitle(route, SITE) {
  if (route.project) return `${fullTitle(route.project)} — ${SITE.name}`;
  if (route.page === 'about') return `About — ${SITE.name}, Film Director`;
  return `${SITE.name} — Film Director, Barcelona`;
}

export function renderIndex(PROJECTS, GROUPS, current) {
  return GROUPS.map(g => {
    const items = PROJECTS.filter(p => p.group === g.id);
    if (!items.length) return '';
    return `<section class="group"><h2>${esc(g.label)}</h2><ul>${items.map(p => `
      <li><a class="row${p.i === current ? ' is-current' : ''}" href="${p.path}" data-i="${p.i}">
        <span class="year">${p.year}</span>
        <span><span class="title">${esc(p.title)}${CIRCLE}</span></span></a></li>`).join('')}</ul></section>`;
  }).join('');
}

export function renderStrip(PROJECTS, current) {
  return PROJECTS.map(p => `<a class="cell${p.i === current ? ' is-active' : ''}" href="${p.path}" data-i="${p.i}" style="--tilt:${p.tilt}deg; --tilt-a:${(p.tilt * 0.6).toFixed(2)}deg">
      <span class="tag" aria-hidden="true">(${p.num}) ${esc(p.title)} — ${esc(p.kind)}</span>
      <span class="print"><img src="${p.thumb}" alt="${esc(fullTitle(p))} — still" width="1280" height="720"${p.i > 2 ? ' loading="lazy"' : ''}></span>
      <span class="mcap" aria-hidden="true"><b>${esc(p.title)}</b><i>${esc(p.kind)}</i></span></a>`).join('');
}

export function renderFicha(p, { h = 'h2', withPlay = false } = {}) {
  const credits = p.credits.map(c => `${esc(c[0])} <b>${esc(c[1])}</b>`).join('<br>');
  const eyebrow = [p.kind, p.genre !== p.kind ? p.genre : null, p.year, p.length].filter(Boolean).join(' — ');
  const laurels = p.laurels.length
    ? `<ul class="laurels" aria-label="Festivals">${p.laurels.map(l => `<li class="stamp">${esc(l[0])}<small>${esc(l[1])}</small></li>`).join('')}</ul>` : '';
  return `<${h} class="h">${esc(p.title)}${p.alt ? ` <span class="alt">(${esc(p.alt)})</span>` : ''}</${h}>
    <p class="eyebrow">${esc(eyebrow)}</p>
    ${p.synopsis ? `<p class="synopsis">${esc(p.synopsis)}</p>` : ''}
    <p class="credits">${credits}</p>
    ${p.note ? `<p class="margin-note">${esc(p.note[0])}<small>— ${esc(p.note[1])}</small></p>` : ''}
    ${withPlay ? `<a class="play" href="${p.path}" data-i="${p.i}">→ play ${esc(p.videoLabel)}</a>` : ''}${laurels}`;
}

export function renderViewer(p, PROJECTS, GROUPS, SITE, { h = 'h2' } = {}) {
  const N = PROJECTS.length;
  const prev = PROJECTS[(p.i - 1 + N) % N], next = PROJECTS[(p.i + 1) % N];
  const group = GROUPS.find(g => g.id === p.group).label;
  return `<div class="bar">
    <nav class="crumb" aria-label="Breadcrumb"><a href="/">${esc(SITE.name)}</a><span>${esc(group)}</span><b>${esc(p.title)}</b></nav>
    <div class="bar-r"><span class="count">${p.i + 1} / ${N}</span><a class="close" href="/" aria-label="Close and go back to the projects">Close ✕</a></div>
  </div>
  <div class="player-wrap">
    <div class="edge t"><span>JC · 5219</span><span>frame ${p.frame}</span></div>
    <div class="player" data-vimeo="${p.vimeo}">
      <img src="${p.thumb}" alt="${esc(fullTitle(p))} — still" width="1280" height="720">
      <button type="button" class="big" data-play><span>Play ${esc(p.videoLabel)}</span></button>
    </div>
    <div class="edge b"><span>▸ ▸ ▸</span><a href="https://vimeo.com/${p.vimeo}" target="_blank" rel="noopener">watch on vimeo ↗</a></div>
  </div>
  <div class="ficha">${renderFicha(p, { h })}</div>
  <nav class="v-nav" aria-label="More projects">
    <a href="${prev.path}" rel="prev">← previous<span class="vh">: ${esc(prev.title)}</span></a>
    <a href="${next.path}" rel="next">next<span class="vh">: ${esc(next.title)}</span> →</a>
  </nav>`;
}

export function renderAbout(SITE) {
  return `<div class="about">
      <div class="bio">
        <h1 id="about-h">${esc(SITE.name)}</h1>
        <p class="lead">${esc(SITE.role)}, ${esc(SITE.city)}.</p>
        ${SITE.bio.map(t => `<p>${t}</p>`).join('\n        ')}
      </div>
      <figure class="portrait">
        <span class="print"><img src="${SITE.portrait}" alt="Portrait of ${esc(SITE.name)}" width="1024" height="681"></span>
      </figure>
      <div class="contact" id="contact">
        <h2>Contact</h2>
        <div class="who">
          <div>
            <h3>Representation</h3>
            <p>${esc(SITE.agency.name)}<br>
            <a href="mailto:${SITE.agency.email}">${esc(SITE.agency.email)}</a></p>
          </div>
          <div>
            <h3>Elsewhere</h3>
            <p><a href="${SITE.instagram.url}" target="_blank" rel="noopener me">Instagram ${esc(SITE.instagram.handle)}</a><br>
            <a href="${SITE.vimeo.url}" target="_blank" rel="noopener me">Vimeo</a></p>
          </div>
        </div>
      </div>
    </div>`;
}
