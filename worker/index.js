/* Cloudflare Worker: serves the static site (public/) and handles POST /api/contact by sending the
   message through Resend. Secrets (set with `wrangler secret put`, never in the repo):
     RESEND_API_KEY  Resend API key
     CONTACT_TO      address that receives the messages
     MAIL_FROM       optional sender, e.g. "Growwth Garden <hello@yourdomain.com>" (domain verified in Resend);
                     defaults to Resend's test sender, which can only deliver to the Resend account owner */

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers } });

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleContact(request, env, url) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });

  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== url.host) return json({ error: 'Forbidden' }, 403);

  let data;
  try { data = await request.json(); } catch { return json({ error: 'Invalid request.' }, 400); }

  if (clean(data.website, 200)) return json({ ok: true }); // honeypot: bots fill the hidden field

  const name = clean(data.name, 100), email = clean(data.email, 200), phone = clean(data.phone, 40), country = clean(data.country, 80);
  const subject = clean(data.subject, 150), message = clean(data.message, 5000);
  if (!name || !EMAIL.test(email) || !message) return json({ error: 'Please fill in your name, a valid email and a message.' }, 400);

  if (!env.RESEND_API_KEY || !env.CONTACT_TO) {
    console.error('Missing RESEND_API_KEY or CONTACT_TO secret');
    return json({ error: 'The form is not set up yet. Please email us directly.' }, 500);
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.MAIL_FROM || 'Growwth Garden <onboarding@resend.dev>',
      to: [env.CONTACT_TO],
      reply_to: email,
      subject: `${subject || 'New website inquiry'} - ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nTelephone: ${phone || '-'}\nCountry: ${country || '-'}\nSubject: ${subject || '-'}\n\n${message}`,
      html: `<p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Telephone:</b> ${esc(phone || '-')}<br><b>Country:</b> ${esc(country || '-')}<br><b>Subject:</b> ${esc(subject || '-')}</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    }),
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return json({ error: 'Sorry, we could not send your message. Please try again or email us directly.' }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return handleContact(request, env, url);
    return env.ASSETS.fetch(request);
  },
};
