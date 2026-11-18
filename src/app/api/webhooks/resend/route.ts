// Resend posts here when someone replies to one of your emails. Point your
// Resend webhook at https://<your tunnel or deployment>/api/webhooks/resend
// and subscribe it to email.received. Locally, `npm run email:simulate-reply`
// posts the same shape of request.
//
// What's left for you (see Part 2 in the README):
// - check the request really came from Resend (svix-* headers, raw body);
// - fetch the reply with getReceivedEmail(data.email_id) from @/lib/email;
// - work out which owner it belongs to, and show it on their page;
// - cope with the same webhook arriving more than once.
export async function POST() {
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
