/**
 * Configure these Script Properties before deploying this as a Web App:
 *   GOOGLE_SHEET_ID, WEBHOOK_TOKEN, NOTIFICATION_EMAIL
 */
const LEADS_SHEET_NAME = 'Website contact submissions';
const LEAD_HEADERS = [
  'Received at',
  'Name',
  'Phone',
  'Email',
  'Subject/Service',
  'Preferred contact method',
  'Message',
];
const FIELD_LIMITS = {
  name: 120,
  phone: 60,
  email: 160,
  subject: 120,
  preferredContactMethod: 30,
  message: 2000,
};

function doGet() {
  return jsonResponse_({ ok: true, message: 'Contact form endpoint is running.' });
}

function doPost(event) {
  try {
    const config = getConfig_();
    const request = parseRequest_(event);

    if (!secureEquals_(request.webhookToken, config.webhookToken)) {
      return jsonResponse_({ ok: false, error: 'Unauthorized request.' });
    }

    const submission = validateSubmission_(request);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getLeadsSheet_(config.sheetId);
      sheet.appendRow([
        new Date(),
        safeSheetValue_(submission.name),
        safeSheetValue_(submission.phone),
        safeSheetValue_(submission.email),
        safeSheetValue_(submission.subject),
        safeSheetValue_(submission.preferredContactMethod),
        safeSheetValue_(submission.message),
      ]);
    } finally {
      lock.releaseLock();
    }

    // The saved record is never rolled back if an email provider error occurs.
    try {
      sendNotification_(submission, config.notificationEmail);
      return jsonResponse_({ ok: true, notificationSent: true });
    } catch (error) {
      console.log(`Submission saved, but notification email failed: ${error}`);
      return jsonResponse_({ ok: true, notificationSent: false });
    }
  } catch (error) {
    console.log(`Contact submission rejected: ${error}`);
    return jsonResponse_({ ok: false, error: 'Unable to save the message.' });
  }
}

function getConfig_() {
  const properties = PropertiesService.getScriptProperties();
  const sheetId = properties.getProperty('GOOGLE_SHEET_ID');
  const webhookToken = properties.getProperty('WEBHOOK_TOKEN');
  const notificationEmail = properties.getProperty('NOTIFICATION_EMAIL');
  if (!sheetId || !webhookToken || !notificationEmail) {
    throw new Error('Required Script Properties have not been configured.');
  }
  return { sheetId, webhookToken, notificationEmail };
}

function parseRequest_(event) {
  const raw = event && event.postData && event.postData.contents;
  if (!raw) throw new Error('Request body is required.');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (_) {
    throw new Error('Request body must be JSON.');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Request body must be an object.');
  }
  return data;
}

function validateSubmission_(data) {
  const submission = {
    name: clean_(data.name, FIELD_LIMITS.name),
    phone: clean_(data.phone, FIELD_LIMITS.phone),
    email: clean_(data.email, FIELD_LIMITS.email),
    subject: clean_(data.subject, FIELD_LIMITS.subject),
    preferredContactMethod: clean_(data.preferredContactMethod, FIELD_LIMITS.preferredContactMethod),
    message: clean_(data.message, FIELD_LIMITS.message),
  };

  if (!submission.name || !submission.email || !submission.subject || !submission.preferredContactMethod || !submission.message) {
    throw new Error('All required fields must be supplied.');
  }
  if (!isValidEmail_(submission.email)) throw new Error('Email address is invalid.');
  if (!['Phone', 'Email', 'WhatsApp'].includes(submission.preferredContactMethod)) {
    throw new Error('Preferred contact method is invalid.');
  }
  return submission;
}

function clean_(value, maxLength) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new Error('A field exceeds its allowed length.');
  return trimmed;
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getLeadsSheet_(sheetId) {
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  let sheet = spreadsheet.getSheetByName(LEADS_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(LEADS_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    const headerRange = sheet.getRange(1, 1, 1, LEAD_HEADERS.length);
    headerRange.setValues([LEAD_HEADERS]);
    sheet.setFrozenRows(1);
    headerRange.setFontWeight('bold').setBackground('#0c295a').setFontColor('#ffffff');
    sheet.autoResizeColumns(1, LEAD_HEADERS.length);
  }
  return sheet;
}

function safeSheetValue_(value) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function sendNotification_(submission, notificationEmail) {
  const details = [
    `Name: ${submission.name}`,
    `Phone: ${submission.phone || 'Not provided'}`,
    `Email: ${submission.email}`,
    `Subject/Service: ${submission.subject}`,
    `Preferred contact method: ${submission.preferredContactMethod}`,
    `Message: ${submission.message}`,
  ];
  MailApp.sendEmail({
    to: notificationEmail,
    subject: 'New website contact submission',
    body: `A new contact message was received.\n\n${details.join('\n')}`,
  });
}

function secureEquals_(provided, expected) {
  if (typeof provided !== 'string' || !provided || provided.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= provided.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
