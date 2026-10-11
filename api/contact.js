// Vercel serverless function: on-page Quote + Speaking forms -> hello@blackthaimedia.com via Resend.
// Needs env RESEND_API_KEY (and optionally CONTACT_FROM, a verified sender). Returns 503 if missing.
const TO = process.env.CONTACT_TO || 'hello@blackthaimedia.com';
const FROM = process.env.CONTACT_FROM || 'Chris P. Giles Site <forms@chrispgiles.com>';
const MIN_MS = 4000, MAX_LEN = 5000;
const FORMS = {
  quote: { title: 'On-site quote request', req: ['name', 'email', 'need'],
    fields: { name: 'Name', email: 'Email', organization: 'Organization', location: 'Location', need: 'What you need', dates: 'Preferred dates', budget: 'Budget' } },
  speaking: { title: 'Speaking / booking request', req: ['name', 'email', 'event'],
    fields: { name: 'Name', email: 'Email', event: 'Event or show name', date_location: 'Date and location', format: 'Audience and format', audience: 'Audience notes', budget: 'Budget or honorarium' } }
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  let raw = ''; for await (const c of req) { raw += c; if (raw.length > 50000) break; }
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { ok: false, error: 'Method not allowed' }); }
  const b = await readBody(req);
  const form = FORMS[b.form];
  if (!form) return json(res, 400, { ok: false, error: 'Unknown form' });
  // Spam: honeypot filled or submitted too fast -> pretend success, send nothing.
  const elapsed = Date.now() - Number(b.ts || 0);
  if ((b.website && String(b.website).trim()) || !b.ts || elapsed < MIN_MS || elapsed > 864e5) return json(res, 200, { ok: true });
  const data = {};
  for (const k of Object.keys(form.fields)) { const v = b[k]; data[k] = (Array.isArray(v) ? v.join(', ') : String(v ?? '')).trim().slice(0, MAX_LEN); }
  const missing = form.req.filter(k => !data[k]);
  if (missing.length) return json(res, 422, { ok: false, error: 'Missing required fields', fields: missing });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return json(res, 422, { ok: false, error: 'Invalid email', fields: ['email'] });
  const key = process.env.RESEND_API_KEY;
  if (!key) return json(res, 503, { ok: false, error: 'Email delivery is not configured (RESEND_API_KEY missing).' });
  const rows = Object.entries(form.fields).filter(([k]) => data[k]);
  const text = rows.map(([k, l]) => `${l}: ${data[k]}`).join('\n');
  const html = `<h2>${esc(form.title)}</h2><table cellpadding="6">${rows.map(([k, l]) => `<tr><td valign="top"><b>${esc(l)}</b></td><td>${esc(data[k]).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table><p style="color:#888">Sent from chrispgiles.com</p>`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [TO], reply_to: data.email, subject: `${form.title}: ${data.name}${data.organization || data.event ? ' — ' + (data.organization || data.event) : ''}`.slice(0, 200), text, html })
    });
    if (!r.ok) { console.error('resend', r.status, await r.text()); return json(res, 502, { ok: false, error: 'Email provider error' }); }
    return json(res, 200, { ok: true });
  } catch (e) { console.error(e); return json(res, 502, { ok: false, error: 'Email provider error' }); }
};
