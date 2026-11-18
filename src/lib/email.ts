// The email boundary. Do not modify this file.
//
// sendEmail() sends through Resend when RESEND_API_KEY is set. Otherwise it
// writes the message to .mailbox/outbox/ so you can build everything offline.
//
// Two things to know:
//
// 1. Every email is redirected. The owners in the sample data aren't real, so
//    sendEmail() delivers to EMAIL_REDIRECT_TO (your own address) and records
//    the real recipient in an X-Original-To header and at the top of the body.
//    That means every reply comes back *from you*, whichever owner it was
//    meant for. Working out which owner a reply belongs to is your problem.
//
// 2. The provider is not perfectly reliable. In local mode, roughly one send
//    in ten fails with a retryable EmailProviderError (set
//    EMAIL_LOCAL_FAILURE_RATE=0 to turn that off while debugging). Resend can
//    fail too. Decide what a retry should and shouldn't do.

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Resend } from "resend";

export type SendEmailRequest = {
  to: string;
  subject: string;
  text: string; // final rendered text, placeholders already filled in
  html?: string;
  replyTo?: string; // e.g. an address at your EMAIL_RECEIVING_DOMAIN
  // Resend ignores a repeated send with the same key for 24 hours.
  idempotencyKey?: string;
  reference?: string; // your own id, logged only
};

export type SendEmailResult = {
  providerId: string;
  mode: "resend" | "local";
  intendedTo: string;
  deliveredTo: string;
  sentAt: string;
};

export type ReceivedEmail = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text: string | null;
  html: string | null;
  messageId: string | null;
  headers: Record<string, string>;
  receivedAt: string;
};

export class EmailProviderError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "EmailProviderError";
  }
}

const MAILBOX_DIR = path.join(process.cwd(), ".mailbox");
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mode(): "resend" | "local" {
  return process.env.RESEND_API_KEY ? "resend" : "local";
}

function redirectTarget(intendedTo: string): string {
  const redirect = process.env.EMAIL_REDIRECT_TO?.trim();
  if (mode() === "resend" && !redirect) {
    throw new EmailProviderError(
      "EMAIL_REDIRECT_TO must be set when sending through Resend",
      false,
    );
  }
  return redirect || intendedTo;
}

export async function sendEmail(
  request: SendEmailRequest,
): Promise<SendEmailResult> {
  const to = request.to.trim();
  if (!EMAIL_PATTERN.test(to)) {
    throw new EmailProviderError(`Invalid recipient address: ${to}`, false);
  }
  if (!request.subject.trim()) {
    throw new EmailProviderError("Subject is empty", false);
  }
  if (!request.text.trim()) {
    throw new EmailProviderError("Body is empty", false);
  }
  if (/\{\{\s*\w+\s*\}\}/.test(`${request.subject}\n${request.text}`)) {
    throw new EmailProviderError(
      "Email still contains unfilled placeholders",
      false,
    );
  }
  if (request.replyTo && !EMAIL_PATTERN.test(request.replyTo)) {
    throw new EmailProviderError(`Invalid reply-to: ${request.replyTo}`, false);
  }

  const deliveredTo = redirectTarget(to);
  const banner = `[Levyline test email. Intended for ${to}]\n\n`;
  const sentAt = new Date().toISOString();

  if (mode() === "local") {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const failureRate = Number(process.env.EMAIL_LOCAL_FAILURE_RATE ?? "0.1");
    if (Math.random() < failureRate) {
      throw new EmailProviderError("Local provider timed out (simulated)", true);
    }
    const providerId = `local_${randomUUID()}`;
    await mkdir(path.join(MAILBOX_DIR, "outbox"), { recursive: true });
    await writeFile(
      path.join(MAILBOX_DIR, "outbox", `${providerId}.json`),
      JSON.stringify(
        {
          id: providerId,
          to: deliveredTo,
          intendedTo: to,
          replyTo: request.replyTo ?? null,
          subject: request.subject,
          text: banner + request.text,
          idempotencyKey: request.idempotencyKey ?? null,
          sentAt,
        },
        null,
        2,
      ),
    );
    console.log(
      `[email] local ${providerId} to ${to}` +
        (request.reference ? ` (ref ${request.reference})` : ""),
    );
    return { providerId, mode: "local", intendedTo: to, deliveredTo, sentAt };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send(
    {
      from: process.env.EMAIL_FROM || "Levyline <onboarding@resend.dev>",
      to: deliveredTo,
      subject: request.subject,
      text: banner + request.text,
      html: request.html,
      replyTo: request.replyTo,
      headers: { "X-Original-To": to },
    },
    request.idempotencyKey
      ? { idempotencyKey: request.idempotencyKey }
      : undefined,
  );
  if (error || !data) {
    const retryable = !error || !/validation|invalid|not.?allowed/i.test(error.name ?? "");
    throw new EmailProviderError(
      `Resend refused the email: ${error?.message ?? "no response"}`,
      retryable,
    );
  }
  console.log(
    `[email] resend ${data.id} to ${to}` +
      (request.reference ? ` (ref ${request.reference})` : ""),
  );
  return { providerId: data.id, mode: "resend", intendedTo: to, deliveredTo, sentAt };
}

// Fetches the full content of a received email. Resend's email.received
// webhook carries only metadata (data.email_id, from, to, subject...), so call
// this with data.email_id to get the body and headers.
export async function getReceivedEmail(emailId: string): Promise<ReceivedEmail> {
  if (!/^[\w-]+$/.test(emailId)) {
    throw new EmailProviderError("Invalid email id", false);
  }

  if (mode() === "local") {
    const raw = await readFile(
      path.join(MAILBOX_DIR, "inbox", `${emailId}.json`),
      "utf8",
    ).catch(() => {
      throw new EmailProviderError(`No local email ${emailId}`, false);
    });
    return JSON.parse(raw) as ReceivedEmail;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.receiving.get(emailId);
  if (error || !data) {
    throw new EmailProviderError(
      `Could not fetch received email: ${error?.message ?? "no response"}`,
      true,
    );
  }
  return {
    id: data.id,
    from: data.from,
    to: data.to,
    subject: data.subject,
    text: data.text ?? null,
    html: data.html ?? null,
    messageId: data.message_id ?? null,
    headers: (data.headers ?? {}) as Record<string, string>,
    receivedAt: data.created_at,
  };
}
