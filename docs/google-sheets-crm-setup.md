# Google Sheets contact-lead setup

The contact form saves each enquiry to Google Sheets through the Apps Script in `scripts/google-apps-script/contact-leads.gs`.

The Apps Script also emails a plain-text alert to `info@foidevs.com` after saving each new lead. Change `LEAD_NOTIFICATION_EMAIL` in the script if alerts should go to a different inbox.

1. Create a new Google Sheet named `FOI Website Leads`.
2. In that sheet, select **Extensions → Apps Script**.
3. Replace the default code with the contents of `scripts/google-apps-script/contact-leads.gs`, then save it.
4. Run `authorizeEmailNotifications` from the Apps Script editor once and approve the requested email permission.
5. Select **Deploy → New deployment**. Choose **Web app**, set **Execute as** to your Google account, and grant access to **Anyone**.
6. Copy the deployment URL. In `pages/contact.html`, paste it inside `data-crm-endpoint=""` on the contact form.
7. Rebuild and publish the website. Submit one test enquiry. A `Website Leads` sheet and its column headings are created automatically on the first successful submission, and an alert is sent to the configured inbox.

Keep the deployment URL in the form configuration only. It is safe for visitors to submit to it, but do not share edit access to the spreadsheet or Apps Script project.

## Production safety

- Keep the web-app access setting at **Anyone** only because the public website needs to submit leads. Do not grant anyone edit access to the Sheet or Apps Script project.
- The script validates required fields, blocks spreadsheet formulas in lead content, and applies a short per-contact rate limit. Whenever this file changes, paste the updated code into Apps Script and create a **new version** through **Deploy → Manage deployments → Edit → New version → Deploy**.
- The web-app URL is a public submission address, not a secret. Do not put account passwords, Google credentials, or any private key in the website or Apps Script code.
- If this script is already deployed, publish its changes through **Deploy → Manage deployments → Edit → New version → Deploy**. Confirm that email permission is authorized by the account that owns the deployment. If a lead is saved but its notification fails, check the Apps Script execution log.
