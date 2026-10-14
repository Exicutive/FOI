const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const outputDirectory = path.join(projectRoot, 'dist');
const publicEntries = ['index.html', 'assets', 'pages', 'robots.txt'];

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

for (const entry of publicEntries) {
  fs.cpSync(path.join(projectRoot, entry), path.join(outputDirectory, entry), { recursive: true });
}

const sitemapPath = path.join(projectRoot, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  fs.copyFileSync(sitemapPath, path.join(outputDirectory, 'sitemap.xml'));
}

console.log(`Prepared static site in ${outputDirectory}`);
