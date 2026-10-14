const fs = require('node:fs');
const path = require('node:path');

const siteUrl = process.env.SITE_URL;
if (!siteUrl) {
  console.error('Set SITE_URL to the deployed site origin before generating the sitemap.');
  process.exit(1);
}

let origin;
try {
  const parsedUrl = new URL(siteUrl);
  if (parsedUrl.protocol !== 'https:' || parsedUrl.pathname !== '/' || parsedUrl.search || parsedUrl.hash) {
    throw new Error('SITE_URL must be an HTTPS origin with no path, query, or fragment.');
  }
  origin = parsedUrl.origin;
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

function readAttributeValues(filePath, attribute) {
  const html = fs.readFileSync(filePath, 'utf8');
  const matches = [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))];
  return [...new Set(matches.map(([, value]) => value))];
}

const staticPages = [
  '/',
  '/about',
  '/contact',
  '/development',
  '/properties',
];
const propertySlugs = readAttributeValues(path.join('pages', 'properties.html'), 'data-slug');
const developmentSlugs = readAttributeValues(path.join('pages', 'development.html'), 'data-development');
const detailPages = [
  ...propertySlugs.map((slug) => `/property/${encodeURIComponent(slug)}`),
  ...developmentSlugs.map((slug) => `/development/${encodeURIComponent(slug)}`),
];
const urls = [...staticPages, ...detailPages].map((page) => `${origin}${page}`);
const xmlEscape = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${xmlEscape(url)}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync('sitemap.xml', sitemap);

const robotsPath = 'robots.txt';
let robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8').trimEnd() : 'User-agent: *\nAllow: /';
const sitemapDirective = `Sitemap: ${origin}/sitemap.xml`;
if (/^Sitemap:\s*.+$/m.test(robots)) {
  robots = robots.replace(/^Sitemap:\s*.+$/m, sitemapDirective);
} else {
  robots += `\n${sitemapDirective}`;
}
fs.writeFileSync(robotsPath, `${robots}\n`);
console.log(`Generated sitemap.xml with ${urls.length} URLs for ${origin}.`);
