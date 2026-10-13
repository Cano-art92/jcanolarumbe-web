/* Static build: one real HTML page per route, so search engines and AI crawlers read everything without running JS.
   Usage: node build.mjs   →   dist/                                                                               */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { SITE, GROUPS, PROJECTS } from './src/content.js';
import { esc, fullTitle, pageTitle, renderIndex, renderStrip, renderFicha, renderViewer, renderAbout } from './src/render.js';

const OUT = 'dist';
const U = SITE.url;
const TODAY = new Date().toISOString().slice(0, 10);
const css = readFileSync('src/styles.css', 'utf8');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync('public', OUT, { recursive: true });
mkdirSync(`${OUT}/js`, { recursive: true });
for (const f of ['content.js', 'render.js', 'app.js']) cpSync(`src/${f}`, `${OUT}/js/${f}`);

const write = (path, html) => { mkdirSync(`${OUT}${path}`, { recursive: true }); writeFileSync(`${OUT}${path}index.html`, html); };
const iso = s => `PT${Math.floor(s / 60) ? Math.floor(s / 60) + 'M' : ''}${s % 60 ? (s % 60) + 'S' : ''}`;
const people = str => str.split(/\s*(?:&|,)\s*/).filter(Boolean);
const credit = (p, label) => (p.credits.find(c => c[0] === label) || [])[1];
const personRef = name => name === SITE.name ? { '@id': `${U}/#person` } : { '@type': 'Person', name };
const orgs = str => str ? people(str).map(name => ({ '@type': 'Organization', name })) : undefined;

/* ---------------- structured data ---------------- */
const PERSON = {
  '@type': 'Person', '@id': `${U}/#person`,
  name: SITE.name, alternateName: SITE.shortName, jobTitle: 'Film director', url: `${U}/`, image: U + SITE.portrait,
  description: `${SITE.name} is a film director and screenwriter based in Barcelona, director of the short film Vacío (Void), executive produced by J.A. Bayona, and of commercials for Zara, Boboli and Fundación La Caixa.`,
  homeLocation: { '@type': 'Place', name: 'Barcelona, Spain' },
  alumniOf: { '@type': 'EducationalOrganization', name: 'ESCAC – Escola Superior de Cinema i Audiovisuals de Catalunya' },
  knowsAbout: ['Film direction', 'Short films', 'Commercials', 'Fashion films', 'Music videos', 'Screenwriting'],
  sameAs: [SITE.instagram.url, SITE.vimeo.url, SITE.imdb, SITE.agency.url],
  contactPoint: { '@type': 'ContactPoint', contactType: 'Representation', name: SITE.agency.name, email: SITE.agency.email, url: 'https://ipdtalent.com/' },
};
const WEBSITE = { '@type': 'WebSite', '@id': `${U}/#website`, url: `${U}/`, name: SITE.name, inLanguage: 'en', publisher: { '@id': `${U}/#person` } };

function projectGraph(p) {
  const url = U + p.path;
  const dir = credit(p, 'Directed by');
  const directors = dir ? people(dir).map(personRef) : [];
  const video = {
    '@type': 'VideoObject', '@id': `${url}#video`,
    name: `${fullTitle(p)}${p.videoLabel === 'trailer' ? ' — trailer' : ''}`,
    description: p.synopsis || p.summary, thumbnailUrl: [p.thumb], uploadDate: p.uploaded, duration: iso(p.seconds),
    embedUrl: `https://player.vimeo.com/video/${p.vimeo}`, url, inLanguage: 'es', genre: p.kind,
    director: directors, ...(p.secondUnit ? { contributor: { '@id': `${U}/#person` } } : {}),
    productionCompany: orgs(credit(p, 'Produced by')),
  };
  const graph = [video, {
    '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Projects', item: `${U}/` },
      { '@type': 'ListItem', position: 2, name: fullTitle(p), item: url }],
  }, { '@type': 'WebPage', '@id': url, url, name: pageTitle({ project: p }, SITE), description: p.summary, isPartOf: { '@id': `${U}/#website` }, about: { '@id': `${U}/#person` }, primaryImageOfPage: p.thumb }];
  if (p.group === 'film') {
    const cast = credit(p, 'Cast');
    graph.push({
      '@type': 'Movie', '@id': `${url}#film`, name: p.title, ...(p.alt ? { alternateName: p.alt } : {}),
      url, image: p.thumb, dateCreated: String(p.year), genre: p.genre, countryOfOrigin: { '@type': 'Country', name: 'Spain' },
      description: p.synopsis || p.summary, director: directors,
      ...(cast ? { actor: people(cast).map(personRef) } : {}),
      ...(credit(p, 'Executive producer') ? { producer: people(credit(p, 'Executive producer')).map(personRef) } : {}),
      productionCompany: [...(orgs(credit(p, 'Produced by')) || []), ...(orgs(credit(p, 'Co-producer')) || [])],
      ...(p.laurels.some(l => /best/i.test(l[0])) ? { award: p.laurels.filter(l => /best/i.test(l[0])).map(l => `${l[0]} — ${l[1]}`) } : {}),
      trailer: { '@id': `${url}#video` },
    });
  }
  return graph;
}

function jsonld(route) {
  const graph = [WEBSITE, PERSON];
  if (route.project) graph.push(...projectGraph(route.project));
  else if (route.page === 'about') graph.push({ '@type': 'ProfilePage', '@id': `${U}/about/`, url: `${U}/about/`, name: pageTitle(route, SITE), mainEntity: { '@id': `${U}/#person` }, isPartOf: { '@id': `${U}/#website` }, dateModified: TODAY });
  else graph.push({
    '@type': 'CollectionPage', '@id': `${U}/`, url: `${U}/`, name: pageTitle(route, SITE), about: { '@id': `${U}/#person` }, isPartOf: { '@id': `${U}/#website` },
    mainEntity: { '@type': 'ItemList', name: 'Projects', itemListElement: PROJECTS.map(p => ({ '@type': 'ListItem', position: p.i + 1, url: U + p.path, name: fullTitle(p) })) },
  });
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

/* ---------------- page shell ---------------- */
const HOME_DESC = `${SITE.name} is a film director based in Barcelona. Short films, including the horror short Vacío (Void), executive produced by J.A. Bayona, and commercials for Zara, Cupra, Boboli and Fundación La Caixa.`;
const ABOUT_DESC = `About ${SITE.name}, film director and screenwriter based in Barcelona. Represented by ${SITE.agency.name} (${SITE.agency.email}).`;

function page(route) {
  const p = route.project;
  const current = p ? p.i : 0;
  const path = p ? p.path : route.page === 'about' ? '/about/' : '/';
  const title = pageTitle(route, SITE);
  const desc = p ? p.summary : route.page === 'about' ? ABOUT_DESC : HOME_DESC;
  const image = p ? p.thumb : route.page === 'about' ? U + SITE.portrait : PROJECTS[0].thumb;
  const onAbout = route.page === 'about';
  const workHeading = !p && !onAbout ? 'h1' : 'h2';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${U}${path}">
<meta name="author" content="${esc(SITE.name)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-video-preview:-1">
<meta property="og:type" content="${p ? 'video.other' : onAbout ? 'profile' : 'website'}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${U}${path}">
<meta property="og:image" content="${image}">
<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#edebe5">
<link rel="icon" type="image/png" sizes="64x64" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="alternate" type="text/plain" title="Summary for AI assistants" href="/llms.txt">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://i.vimeocdn.com">
<link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Reenie+Beanie&display=swap" rel="stylesheet">
<style>
${css}</style>
<script type="application/ld+json">${jsonld(route)}</script>
</head>
<body data-page="${onAbout ? 'about' : 'work'}" data-current="${current}"${p ? ' style="overflow:hidden"' : ''}>

<header class="top">
  <a class="brand" href="/"><span>${esc(SITE.name)}</span><span class="role">Director · ${esc(SITE.city)}</span></a>
  <nav class="nav" aria-label="Main">
    <a href="/"${!onAbout ? ' aria-current="page"' : ''}>Home</a>
    <a href="/about/"${onAbout ? ' aria-current="page"' : ''}>About</a>
  </nav>
  <span></span>
</header>

<main>
  <section id="page-work" class="page${!onAbout ? ' is-active' : ''}" aria-labelledby="work-h">
    <div class="work">
      <div class="index">
        <${workHeading} id="work-h" class="note"><span class="vh">${esc(SITE.name)}, film director — </span>Projects</${workHeading}>
        <div id="index">${renderIndex(PROJECTS, GROUPS, current)}</div>
      </div>
      <div class="strip-wrap" id="stripWrap">
        <div class="strip" id="strip">${renderStrip(PROJECTS, current)}</div>
        <span class="edge-label r" aria-hidden="true">${esc(SITE.name)} — Director — ${esc(SITE.city)}</span>
      </div>
      <aside class="ficha" id="ficha" aria-live="polite">${renderFicha(PROJECTS[current], { withPlay: true })}</aside>
    </div>
  </section>

  <section id="page-about" class="page${onAbout ? ' is-active' : ''}" aria-labelledby="about-h">
    ${renderAbout(SITE).replace('<h1 id="about-h">', onAbout ? '<h1 id="about-h">' : '<h2 id="about-h">').replace(/<\/h1>/, onAbout ? '</h1>' : '</h2>')}
  </section>
</main>

<div class="viewer${p ? ' is-open' : ''}" id="viewer" role="dialog" aria-modal="true" aria-label="Project"${p ? ` data-slug="${p.slug}"` : ''}>${p ? renderViewer(p, PROJECTS, GROUPS, SITE, { h: 'h1' }) : ''}</div>

<div class="cur" id="cur" aria-hidden="true"><div class="part"></div></div>

<footer class="foot">
  <span>© ${esc(SITE.name)} ${new Date().getFullYear()}</span>
  <a href="/about/#contact">Represented by ${esc(SITE.agency.name)}</a>
</footer>

<script type="module" src="/js/app.js"></script>
</body>
</html>
`;
}

/* ---------------- pages ---------------- */
write('/', page({ page: 'work' }));
write('/about/', page({ page: 'about' }));
for (const p of PROJECTS) write(p.path, page({ page: 'work', project: p }));
writeFileSync(`${OUT}/404.html`, page({ page: 'work' })
  .replace(/<title>.*?<\/title>/, `<title>Page not found — ${esc(SITE.name)}</title>`)
  .replace('<meta name="robots" content="index, follow, max-image-preview:large, max-video-preview:-1">', '<meta name="robots" content="noindex">')
  .replace(/<link rel="canonical"[^>]*>\n/, ''));

/* ---------------- sitemap, robots, llms.txt ---------------- */
const urls = ['/', '/about/', ...PROJECTS.map(p => p.path)];
writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.map(u => {
  const p = PROJECTS.find(x => x.path === u);
  return `  <url><loc>${U}${u}</loc><lastmod>${TODAY}</lastmod>${p ? `
    <video:video><video:thumbnail_loc>${p.thumb}</video:thumbnail_loc><video:title>${esc(fullTitle(p))}</video:title><video:description>${esc(p.synopsis || p.summary)}</video:description><video:player_loc>https://player.vimeo.com/video/${p.vimeo}</video:player_loc><video:duration>${p.seconds}</video:duration><video:publication_date>${p.uploaded}</video:publication_date></video:video>` : ''}</url>`;
}).join('\n')}
</urlset>
`);

writeFileSync(`${OUT}/robots.txt`, `# Search engines and AI assistants are welcome to read this site.
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${U}/sitemap.xml
`);

const strip = h => h.replace(/<[^>]+>/g, '');
writeFileSync(`${OUT}/llms.txt`, `# ${SITE.name}

> ${SITE.name} (also credited as ${SITE.shortName} and J. Cano Larumbe) is a film director and screenwriter based in Barcelona, Spain. He directed the horror short film Vacío (Void, 2025), executive produced by J.A. Bayona, and commercials and fashion films for Zara, Boboli, Maragua Studio and Fundación La Caixa. He is represented by ${SITE.agency.name}.

## About

${SITE.bio.map(strip).join('\n\n')}

- Full profile: ${U}/about/
- Representation: ${SITE.agency.name}, ${SITE.agency.email} (${SITE.agency.url})
- Instagram: ${SITE.instagram.url}
- Vimeo (all films): ${SITE.vimeo.url}
- IMDb: ${SITE.imdb}

${GROUPS.map(g => `## ${g.label}

${PROJECTS.filter(p => p.group === g.id).map(p => `- [${fullTitle(p)}](${U}${p.path}) — ${p.kind}, ${p.year}. ${p.summary}${p.synopsis ? ` Synopsis: ${p.synopsis}` : ''}${p.laurels.length ? ` Festivals: ${p.laurels.map(l => `${l[1]} (${l[0]})`).join('; ')}.` : ''} Credits: ${p.credits.map(c => `${c[0]} ${c[1]}`).join('; ')}.`).join('\n')}`).join('\n\n')}
`);

console.log(`Built ${urls.length} pages into ${OUT}/ — ${U}`);
