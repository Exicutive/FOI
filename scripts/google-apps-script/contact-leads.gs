const LEADS_SHEET_NAME = 'Website Leads';
const RATE_LIMIT_WINDOW_SECONDS = 600;
const MAX_LEADS_PER_WINDOW = 3;
const LEAD_HEADERS = [
  'Received at',
  'Name',
  'Email',
  'Phone',
  'Enquiry type',
  'Message',
  'Source',
  'Page',
  'Status',
];

function doGet() {
  return response_({ ok: true, message: 'FOI lead endpoint is running.' });
}

function doPost(event) {
  try {
    const lead = parseLead_(event);

    // Silent success for bots that fill the hidden field.
    if (lead.website) return response_({ ok: true });
    if (!lead.name || !isValidEmail_(lead.email)) return response_({ ok: false, error: 'A name and valid email are required.' });
    if (isRateLimited_(lead)) return response_({ ok: false, error: 'Please wait a few minutes before sending another message.' });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getLeadsSheet_();
      sheet.appendRow([
        new Date(),
        safeSheetValue_(lead.name),
        safeSheetValue_(lead.email),
        safeSheetValue_(lead.phone),
        safeSheetValue_(lead.interest),
        safeSheetValue_(lead.message),
        safeSheetValue_(lead.source || 'Website contact form'),
        safeSheetValue_(lead.page),
        'New',
      ]);
    } finally {
      lock.releaseLock();
    }

    return response_({ ok: true });
  } catch (error) {
    return response_({ ok: false, error: 'Unable to save lead.' });
  }
}

function getLeadsSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(LEADS_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(LEADS_SHEET_NAME);
    sheet.getRange(1, 1, 1, LEAD_HEADERS.length).setValues([LEAD_HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, LEAD_HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#0c295a')
      .setFontColor('#ffffff');
    sheet.autoResizeColumns(1, LEAD_HEADERS.length);
  }

  return sheet;
}

function parseLead_(event) {
  const raw = event && event.postData && event.postData.contents ? event.postData.contents : '{}';
  const data = JSON.parse(raw);
  return {
    name: clean_(data.name, 120),
    email: clean_(data.email, 160),
    phone: clean_(data.phone, 60),
    interest: clean_(data.interest, 120),
    message: clean_(data.message, 2000),
    source: clean_(data.source, 120),
    page: clean_(data.page, 500),
    website: clean_(data.website, 200),
  };
}

function clean_(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRateLimited_(lead) {
  const fingerprint = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    `${lead.email.toLowerCase()}|${lead.phone}`,
  ).map((byte) => (byte + 256).toString(16).slice(-2)).join('');
  const cache = CacheService.getScriptCache();
  const cacheKey = `lead-rate:${fingerprint}`;
  const attempts = Number(cache.get(cacheKey) || '0');
  if (attempts >= MAX_LEADS_PER_WINDOW) return true;
  cache.put(cacheKey, String(attempts + 1), RATE_LIMIT_WINDOW_SECONDS);
  return false;
}

function safeSheetValue_(value) {
  // Prevent spreadsheet formula execution from untrusted form input.
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function response_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
