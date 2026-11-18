#!/usr/bin/env node
// Simulates an owner replying to one of your emails, without Resend.
//
// It writes the reply to .mailbox/inbox/ (where getReceivedEmail() reads it in
// local mode) and POSTs a signed email.received webhook to your app, shaped
// like the one Resend sends.
//
//   npm run email:simulate-reply -- --to reply+abc@example.resend.app \
//     --text "I can pay €500 on Friday" [--subject "Re: ..."] [--deliveries 2]
//
// --to          the address the owner replied to (your Reply-To)
// --from        who it's from (default: EMAIL_REDIRECT_TO, i.e. you)
// --deliveries  send the same webhook more than once, as real providers do
// --url         default http://localhost:3000/api/webhooks/resend

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { Webhook } from "svix";

async function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const raw = await readFile(file, "utf8").catch(() => "");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  }
}

await loadEnv();

const { values } = parseArgs({
  options: {
    to: { type: "string" },
    from: { type: "string" },
    subject: { type: "string", default: "Re: your account" },
    text: { type: "string", default: "Thanks, I'll pay by the end of the month." },
    deliveries: { type: "string", default: "1" },
    url: { type: "string", default: "http://localhost:3000/api/webhooks/resend" },
  },
});

if (!values.to) {
  console.error("--to is required: the address the owner is replying to");
  process.exit(2);
}

const secret = process.env.RESEND_WEBHOOK_SECRET;
if (!secret) {
  console.error("RESEND_WEBHOOK_SECRET is not set (see .env.example)");
  process.exit(2);
}

const emailId = randomUUID();
const from = values.from || process.env.EMAIL_REDIRECT_TO || "you@example.com";
const now = new Date().toISOString();
const messageId = `<${randomUUID()}@simulator.local>`;

await mkdir(path.join(".mailbox", "inbox"), { recursive: true });
await writeFile(
  path.join(".mailbox", "inbox", `${emailId}.json`),
  JSON.stringify(
    {
      id: emailId,
      from,
      to: [values.to],
      subject: values.subject,
      text: values.text,
      html: null,
      messageId,
      headers: { "message-id": messageId },
      receivedAt: now,
    },
    null,
    2,
  ),
);

const payload = JSON.stringify({
  type: "email.received",
  created_at: now,
  data: {
    email_id: emailId,
    created_at: now,
    from,
    to: [values.to],
    bcc: [],
    cc: [],
    received_for: [values.to],
    message_id: messageId,
    subject: values.subject,
    attachments: [],
  },
});

const webhookId = `msg_${randomUUID()}`;
const deliveries = Math.max(1, Number(values.deliveries) || 1);

for (let attempt = 1; attempt <= deliveries; attempt++) {
  const timestamp = new Date();
  const signature = new Webhook(secret).sign(webhookId, timestamp, payload);
  const response = await fetch(values.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "svix-id": webhookId,
      "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
      "svix-signature": signature,
    },
    body: payload,
  }).catch((error) => {
    console.error(`Could not reach ${values.url}: ${error.message}`);
    process.exit(1);
  });
  console.log(
    `delivery ${attempt}/${deliveries}: ${response.status} ${(await response.text()).slice(0, 300)}`,
  );
}
