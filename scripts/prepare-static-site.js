const fs = require('node:fs');
const path = require('node:path');
const { origin, organization, routes } = require('./seo-route-manifest');

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.join(projectRoot, 'dist');
const publicEntries = ['index.html', 'assets', 'robots.txt'];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const entry of publicEntries) {
  fs.cpSync(path.join(projectRoot, entry), path.join(outputDirectory, entry), { recursive: true });
}

const internalPagesDirectory = path.join(outputDirectory, '_internal', 'pages');
fs.mkdirSync(internalPagesDirectory, { recursive: true });
fs.cpSync(path.join(projectRoot, 'pages'), internalPagesDirectory, { recursive: true });

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function replaceMeta(html, attribute, key, value) {
  const expression = new RegExp(`<meta\\s+${attribute}="${key}"\\s+content="[^"]*"\\s*\\/?>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  return expression.test(html) ? html.replace(expression, tag) : html.replace('</head>', `  ${tag}\n</head>`);
}

function routeSchema(route, metadata) {
  const canonical = `${origin}/${route}`;
  const breadcrumbs = metadata.breadcrumbs.map(([name, item], index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    ...(item ? { item: new URL(item, origin).href } : {}),
  }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization,
      { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'FOI Developments', publisher: { '@id': `${origin}/#organization` } },
      { '@type': 'WebPage', '@id': `${canonical}#webpage`, url: canonical, name: metadata.title, description: metadata.description, isPartOf: { '@id': `${origin}/#website` }, about: { '@id': `${origin}/#organization` } },
      { '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: breadcrumbs },
    ],
  };
}

function prepareRoutePage(route, metadata) {
  const templatePath = path.join(projectRoot, 'pages', metadata.template);
  let html = fs.readFileSync(templatePath, 'utf8');
  const canonical = `${origin}/${route}`;
  const image = new URL(metadata.image, origin).href;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  html = replaceMeta(html, 'name', 'description', metadata.description);
  html = replaceMeta(html, 'name', 'robots', 'index,follow,max-image-preview:large');
  html = replaceMeta(html, 'property', 'og:title', metadata.title);
  html = replaceMeta(html, 'property', 'og:description', metadata.description);
  html = replaceMeta(html, 'property', 'og:url', canonical);
  html = replaceMeta(html, 'property', 'og:image', image);
  html = replaceMeta(html, 'property', 'og:image:alt', metadata.imageAlt);
  html = replaceMeta(html, 'name', 'twitter:title', metadata.title);
  html = replaceMeta(html, 'name', 'twitter:description', metadata.description);
  html = replaceMeta(html, 'name', 'twitter:image', image);
  const canonicalTag = `<link rel="canonical" href="${canonical}" />`;
  html = /<link\s+rel="canonical"[^>]*>/i.test(html)
    ? html.replace(/<link\s+rel="canonical"[^>]*>/i, canonicalTag)
    : html.replace('</head>', `  ${canonicalTag}\n</head>`);
  const schema = `<script id="seo-structured-data" type="application/ld+json">${JSON.stringify(routeSchema(route, metadata))}</script>`;
  html = html.replace('</head>', `  ${schema}\n</head>`);
  fs.writeFileSync(path.join(internalPagesDirectory, metadata.output), html);
}

for (const [route, metadata] of Object.entries(routes)) {
  prepareRoutePage(route, metadata);
}

const sitemapPath = path.join(projectRoot, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  fs.copyFileSync(sitemapPath, path.join(outputDirectory, 'sitemap.xml'));
}

console.log(`Prepared static site in ${outputDirectory}`);
