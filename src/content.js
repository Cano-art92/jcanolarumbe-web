/* All site content lives here. Edit this file, then rebuild (node build.mjs) and deploy. */

export const SITE = {
  name: 'Javier Cano Larumbe',
  shortName: 'Javier Cano',
  role: 'Film director',
  city: 'Barcelona',
  url: 'https://jcanolarumbe.com',
  portrait: '/assets/javier-cano.jpg',
  instagram: { handle: '@jcanolarumbe', url: 'https://www.instagram.com/jcanolarumbe/' },
  vimeo: { label: 'vimeo.com/jcanolarumbe', url: 'https://vimeo.com/jcanolarumbe' },
  imdb: 'https://www.imdb.com/name/nm6407866/',           // linked from his agency profile — confirm
  agency: { name: 'IPD Talent Agency', email: 'hello@ipdtalent.com', url: 'https://ipdtalent.com/talentos/javier-cano/' },
  /* About text. Draft built from his agency profile and press — replace with Javier's own words when ready. */
  bio: [
    'Javier Cano Larumbe is a film director and screenwriter based in Barcelona. He studied film direction at ESCAC, where he made his short film <em>Interferencias</em>.',
    'His latest short film, <em>Vacío (Void)</em>, executive produced by J.A. Bayona and starring María Valverde, premiered in Spain at ALCINE and has screened at festivals including Raindance and the Cleveland International Film Festival.',
    'In advertising he has directed work for Zara, Boboli and Maragua Studio, and has worked as second unit director for J.A. Bayona, including Cupra’s <em>There’s No Second</em>. His work has been selected at La Jolla International Fashion Film Festival, Berlin Commercial, Bokeh and Aesthetica. He is currently writing his first feature film.',
  ],
};

export const GROUPS = [
  { id: 'film',       label: 'Films' },
  { id: 'commercial', label: 'Commercials' },
  { id: 'music',      label: 'Music videos' },
];

const thumb = id => `https://i.vimeocdn.com/video/${id}-d_1280`;

/* summary: one factual sentence used for search engines, link previews and AI assistants (not shown on the page). */
export const PROJECTS = [
  { slug: 'vacio', title: 'Vacío', alt: 'Void', group: 'film', kind: 'Short film', genre: 'Horror', year: 2025, length: '14 min',
    vimeo: '1189656779', seconds: 36, uploaded: '2026-05-06', videoLabel: 'trailer',
    thumb: thumb('2154227389-20cf53aa229e20563d8c0cb54fe138c54711e3784259889b9e34d071d184cfe9'),
    synopsis: 'All children are afraid of the dark. But for eight-year-old Félix, this darkness is different. Every night, Félix senses this strange presence, but tonight might be different. Tonight might change his life forever.',
    summary: 'Vacío (Void), a horror short film directed by Javier Cano Larumbe, executive produced by J.A. Bayona and starring María Valverde, Javier Beltrán and Tomeu Artigas.',
    credits: [['Directed by', 'Javier Cano Larumbe'], ['Cast', 'María Valverde, Javier Beltrán, Tomeu Artigas'], ['Executive producer', 'J.A. Bayona'], ['Produced by', 'Forty Entertainment & Mamma Team'], ['Co-producer', 'Arcadia Motion Pictures']],
    note: ['“A stunning 14-minute short that achieves more than many features do in a two-hour runtime.”', 'Cinerama'],
    laurels: [['Official Selection', 'Cleveland International Film Festival'], ['Official Selection', 'Raindance Film Festival'], ['Official Selection', 'Mecal Pro Barcelona 2026'], ['Official Finalist', 'CortoBerlanga'], ['Official Selection', 'Centelles en Curt FICC'], ['Sección Paralela', 'Festival de Ciudad Real'], ['Best Horror Short', 'Filmsere La Florida 2026'], ['Official Selection', 'Montevideo Fantástico XVI'], ['Selección Oficial', 'Valdivia']] },

  { slug: 'cupra-theres-no-second', title: 'Cupra — There’s No Second', brand: 'Cupra', group: 'commercial', kind: 'Commercial', genre: 'Automotive', year: 2024, length: '2 min 09',
    vimeo: '1010562750', seconds: 129, uploaded: '2024-09-18', secondUnit: true,
    thumb: thumb('1927944764-1a4feb0639f6012b9c6dd8d1a7d881879b4844f9def301af3dfd1843f7d0674f'),
    summary: 'Cupra — There’s No Second, a commercial directed by J.A. Bayona with Javier Cano Larumbe as second unit director. Agency Rosàs, produced by ROMA.',
    credits: [['Directed by', 'J.A. Bayona'], ['2nd unit director', 'Javier Cano Larumbe'], ['Agency', 'Rosàs'], ['Produced by', 'ROMA']], laurels: [] },

  { slug: 'zara-leap-a-new-beginning', title: 'Zara — Leap, A New Beginning', brand: 'Zara', group: 'commercial', kind: 'Commercial', genre: 'Fashion', year: 2024, length: '2 min 20',
    vimeo: '1029711842', seconds: 140, uploaded: '2024-11-14',
    thumb: thumb('1950103745-43953030a6bef388425ca6e038c4dd4ad7fcb80e3c57d340e4f08f7d86eae7d9'),
    summary: 'Zara — Leap, A New Beginning, a fashion commercial directed by Javier Cano Larumbe and produced by El Estudio (2024).',
    credits: [['Directed by', 'Javier Cano Larumbe'], ['Produced by', 'El Estudio']], laurels: [] },

  { slug: 'maragua-studio-saphi', title: 'Maragua Studio — Saphi', brand: 'Maragua Studio', group: 'commercial', kind: 'Fashion film', genre: 'Dance', year: 2022, length: '2 min 35',
    vimeo: '698590978', seconds: 155, uploaded: '2022-04-12',
    thumb: thumb('1428616436-3389cf3252a70bae03386bf556ac6c90d51aaca09b3cc509780c8e9d5fd8f651'),
    synopsis: 'Saphi is an adventure to our origins, back to our roots and the deepest of our essence. A vision of free femininity in a journey which connects our inner selves through nature and the world around us.',
    summary: 'Saphi, a fashion film for Maragua Studio written and directed by Javier Cano Larumbe, with dancer Paula Losada (2022).',
    credits: [['Directed by', 'Javier Cano Larumbe'], ['Dancer', 'Paula Losada'], ['Produced by', 'whitemoose']], laurels: [] },

  { slug: 'boboli-the-bench-where-we-all-fit', title: 'Boboli — The Bench Where We All Fit', brand: 'Boboli', group: 'commercial', kind: 'Commercial', genre: 'Kids fashion', year: 2024, length: '1 min 33',
    vimeo: '899795066', seconds: 93, uploaded: '2024-01-04',
    thumb: thumb('1777640122-5fab158306d9aa02743c24f7651e5fe9461c5b1873be82fa8f9252d25b35c0ea'),
    summary: 'Boboli — The Bench Where We All Fit, a commercial for Boboli directed by Javier Cano Larumbe. Agency Soon In Tokyo, produced by Mamma Team (2024).',
    credits: [['Directed by', 'Javier Cano Larumbe'], ['Agency', 'Soon In Tokyo'], ['Produced by', 'Mamma Team']], laurels: [] },

  { slug: 'monte-vista-drive-pale-blue-coal-black', title: 'Monte Vista Drive — Pale Blue / Coal Black', group: 'music', kind: 'Music video', genre: 'Indie', year: 2024, length: '2 min 11',
    vimeo: '899890899', seconds: 131, uploaded: '2024-01-04',
    thumb: thumb('1777775828-f0f99d92b666085d41ea06c75ed1b15672e8aeed46e85b2d6ccdef515f37cc41'),
    summary: 'Pale Blue / Coal Black, a music video for Monte Vista Drive directed by Javier Cano Larumbe and Diego Amela (2024).',
    credits: [['Directed by', 'Javier Cano Larumbe & Diego Amela']], laurels: [] },
];

PROJECTS.forEach((p, i) => {
  p.i = i;
  p.num = String(i + 1).padStart(3, '0');
  p.frame = (i + 7) + (i % 2 ? 'A' : '');
  p.tilt = [-1.6, 1.1, -0.7, 1.8, -1.2, 0.9, -1.9, 1.4, -0.5][i % 9];
  p.path = `/work/${p.slug}/`;
  p.videoLabel = p.videoLabel || 'film';
});
