const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');

const PORT = Number(process.env.PORT || 3000);
const DIST_DIRECTORY = path.join(__dirname, 'dist');
const MAX_BODY_BYTES = 8 * 1024;
const FIELD_LIMITS = { name: 120, phone: 60, email: 160, subject: 120, preferredContactMethod: 30, message: 2000 };
const MIME_TYPES = {
  '.avif': 'image/avif', '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8',
};

function securityHeaders(response) {
  response.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src https://www.google.com; upgrade-insecure-requests");
  response.setHeader('Strict-Transport-Security', 'max-age=31536000');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
}

function json(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}

function clean(value, maximumLength, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new Error('A required field is missing.');
    return '';
  }
  if (typeof value !== 'string') throw new Error('A field has an invalid value.');
  const trimmed = value.trim();
  if (required && !trimmed) throw new Error('A required field is missing.');
  if (trimmed.length > maximumLength) throw new Error('A field exceeds its allowed length.');
  return trimmed;
}

function validateSubmission(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid request body.');
  const submission = {
    name: clean(body.name, FIELD_LIMITS.name, true),
    phone: clean(body.phone, FIELD_LIMITS.phone),
    email: clean(body.email, FIELD_LIMITS.email, true),
    subject: clean(body.subject, FIELD_LIMITS.subject, true),
    preferredContactMethod: clean(body.preferredContactMethod, FIELD_LIMITS.preferredContactMethod, true),
    message: clean(body.message, FIELD_LIMITS.message, true),
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) throw new Error('Invalid email address.');
  if (!['Phone', 'Email', 'WhatsApp'].includes(submission.preferredContactMethod)) throw new Error('Invalid preferred contact method.');
  return submission;
}

async function readJson(request) {
  const contentType = request.headers['content-type'] || '';
  if (!contentType.toLowerCase().startsWith('application/json')) throw new Error('Content-Type must be application/json.');
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Error('Request body must be valid JSON.'); }
}

async function submitToGoogle(submission) {
  const endpoint = process.env.GOOGLE_SHEETS_WEB_APP_URL;
  const token = process.env.GOOGLE_SHEETS_WEB_APP_TOKEN;
  if (!endpoint || !token) throw new Error('Contact endpoint is not configured.');
  let endpointUrl;
  try { endpointUrl = new URL(endpoint); } catch { throw new Error('Contact endpoint is misconfigured.'); }
  if (endpointUrl.protocol !== 'https:' || endpointUrl.hostname !== 'script.google.com') {
    throw new Error('Contact endpoint must be a Google Apps Script HTTPS URL.');
  }
  const googleResponse = await fetch(endpointUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...submission, webhookToken: token }), signal: AbortSignal.timeout(10000),
  });
  const text = await googleResponse.text();
  let result;
  try { result = JSON.parse(text); } catch { throw new Error('Contact endpoint returned an invalid response.'); }
  if (!googleResponse.ok || !result.ok) throw new Error('Contact endpoint rejected the submission.');
}

function routeFile(pathname) {
  const staticRoutes = {
    '/': 'index.html', '/about': '_internal/pages/about.html', '/contact': '_internal/pages/contact.html',
    '/development': '_internal/pages/development.html', '/properties': '_internal/pages/properties.html',
    '/property/tmlse': '_internal/pages/property-tmlse.html', '/property/tfgse': '_internal/pages/property-tfgse.html',
    '/property/mbe': '_internal/pages/property-mbe.html', '/property/qpe': '_internal/pages/property-qpe.html',
    '/property/oge': '_internal/pages/property-oge.html', '/property/ctv': '_internal/pages/property-ctv.html',
    '/development/site-feasibility': '_internal/pages/development-site-feasibility.html',
    '/development/design-approvals': '_internal/pages/development-design-approvals.html',
    '/development/construction-handover': '_internal/pages/development-construction-handover.html',
  };
  if (staticRoutes[pathname]) return staticRoutes[pathname];
  if (/^\/property\/[^/]+$/.test(pathname)) return '_internal/pages/property.html';
  if (/^\/development\/[^/]+$/.test(pathname)) return '_internal/pages/development-detail.html';
  return pathname.replace(/^\/+/, '');
}

async function serveFile(response, pathname) {
  const filename = routeFile(pathname);
  const resolved = path.resolve(DIST_DIRECTORY, filename);
  if (!resolved.startsWith(`${DIST_DIRECTORY}${path.sep}`) && resolved !== DIST_DIRECTORY) return json(response, 404, { error: 'Not found.' });
  try {
    const stats = await fs.promises.stat(resolved);
    if (!stats.isFile()) return json(response, 404, { error: 'Not found.' });
    const extension = path.extname(resolved).toLowerCase();
    response.writeHead(200, { 'Content-Type': MIME_TYPES[extension] || 'application/octet-stream', 'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=3600, must-revalidate' : 'no-cache' });
    await pipeline(fs.createReadStream(resolved), response);
  } catch (error) {
    if (error.code === 'ENOENT') return json(response, 404, { error: 'Not found.' });
    throw error;
  }
}

const server = http.createServer(async (request, response) => {
  securityHeaders(response);
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (request.method === 'GET' && url.pathname === '/healthz') return json(response, 200, { ok: true });
    if (request.method === 'POST' && url.pathname === '/api/contact') {
      try {
        const body = await readJson(request);
        await submitToGoogle(validateSubmission(body));
        return json(response, 200, { ok: true });
      } catch (error) {
        console.error('Contact submission failed:', error.message);
        const status = /configured/.test(error.message) ? 503 : /endpoint/.test(error.message) ? 502 : 400;
        return json(response, status, { ok: false, error: 'We could not receive your message. Please try again or contact us directly.' });
      }
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return json(response, 405, { error: 'Method not allowed.' });
    if (request.method === 'HEAD') { response.writeHead(200); return response.end(); }
    return await serveFile(response, decodeURIComponent(url.pathname));
  } catch (error) {
    console.error('Request failed:', error);
    if (!response.headersSent) json(response, 500, { error: 'Internal server error.' });
    else response.destroy();
  }
});

server.listen(PORT, () => console.log(`FOI Developments is listening on port ${PORT}.`));
