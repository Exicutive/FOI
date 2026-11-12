# Google Sheets contact form setup

The browser posts only to the website's same-origin `/api/contact` endpoint. That server forwards the request to Google Apps Script using environment variables, so the Apps Script URL and shared token never appear in browser code.

## 1. Create the Sheet and Apps Script project

1. Create a Google Sheet and copy its ID from the URL: `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`.
2. Open **Extensions → Apps Script** from that Sheet.
3. Replace the editor contents with [`scripts/google-apps-script/contact-leads.gs`](../scripts/google-apps-script/contact-leads.gs) and save.
4. In **Project Settings → Script properties**, add these values:

   | Property | Value |
   | --- | --- |
   | `GOOGLE_SHEET_ID` | The ID from step 1 |
   | `WEBHOOK_TOKEN` | A new random, high-entropy secret |
   | `NOTIFICATION_EMAIL` | The inbox that should receive submission alerts |

5. Deploy with **Deploy → New deployment → Web app**. Set **Execute as** to your Google account and **Who has access** to **Anyone**, authorize the requested Sheets and Mail permissions, then copy the `/exec` URL.

The first valid submission creates the `Website contact submissions` tab and exactly these headers: `Received at`, `Name`, `Phone`, `Email`, `Subject/Service`, `Preferred contact method`, and `Message`.

## 2. Configure Render

This project is now a Node Web Service, not a Render Static Site. In Render's environment settings, add the following *server-only* secrets:

| Variable | Value |
| --- | --- |
| `GOOGLE_SHEETS_WEB_APP_URL` | The Apps Script `/exec` URL from step 5 |
| `GOOGLE_SHEETS_WEB_APP_TOKEN` | The exact `WEBHOOK_TOKEN` value from Script Properties |

Do not use `NEXT_PUBLIC_`, put either value in HTML/JavaScript, or commit a real `.env` file. Redeploy after adding the values.

## Behaviour and safety

- Both the site server and Apps Script validate JSON, required fields, email format, allowed contact methods, and length limits.
- The Apps Script serializes writes with `LockService` and escapes a leading `=`, `+`, `-`, or `@` before appending any user text to the sheet.
- A row is appended before `MailApp.sendEmail` runs. A mail failure is logged but returns success, so visitors are not asked to resubmit a saved enquiry.
- Keep the Sheet and Script private. Public access applies only to the Web App endpoint and is protected by the shared token.
