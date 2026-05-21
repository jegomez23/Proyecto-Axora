const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || 'contact_leads';
const SITE_ORIGIN = process.env.SITE_ORIGIN || '';

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(body),
  };
}

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function hasSuspiciousContent(value) {
  return /<[^>]*>|https?:\/\/|www\.|[\r\n]{2,}/i.test(value);
}

function getClientIp(headers) {
  return (
    headers['x-nf-client-connection-ip'] ||
    headers['x-forwarded-for'] ||
    headers['client-ip'] ||
    ''
  )
    .split(',')[0]
    .trim() || null;
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method not allowed.' });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return response(500, { error: 'Missing Supabase environment variables.' });
  }

  const origin = event.headers.origin || event.headers.Origin || '';
  if (SITE_ORIGIN && origin && origin !== SITE_ORIGIN) {
    return response(403, { error: 'Origin not allowed.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return response(400, { error: 'Invalid payload.' });
  }

  if (payload.empresa) {
    return response(400, { error: 'Spam detected.' });
  }

  const submittedAt = Number(payload.submitted_at || 0);
  if (!submittedAt || Date.now() - submittedAt < 2500) {
    return response(400, { error: 'Submission rejected.' });
  }

  const nombre = normalize(payload.nombre);
  const email = normalize(payload.email).toLowerCase();
  const negocio = normalize(payload.negocio);
  const mensaje = normalize(payload.mensaje);
  const consentimiento = payload.consentimiento === true;

  if (!consentimiento) {
    return response(400, { error: 'Consent is required.' });
  }

  if (nombre.length < 2 || nombre.length > 80) {
    return response(400, { error: 'Invalid nombre.' });
  }

  if (email.length < 5 || email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return response(400, { error: 'Invalid email.' });
  }

  if (negocio.length < 2 || negocio.length > 100) {
    return response(400, { error: 'Invalid negocio.' });
  }

  if (mensaje.length < 10 || mensaje.length > 1200) {
    return response(400, { error: 'Invalid mensaje.' });
  }

  if ([nombre, negocio, mensaje].some(hasSuspiciousContent)) {
    return response(400, { error: 'Suspicious content detected.' });
  }

  const lead = {
    nombre,
    email,
    negocio,
    mensaje,
    consentimiento: true,
    source: 'web_axora',
    ip_address: getClientIp(event.headers || {}),
    user_agent: (event.headers['user-agent'] || event.headers['User-Agent'] || '').slice(0, 512) || null,
  };

  const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(lead),
  });

  if (!insertResponse.ok) {
    const details = await insertResponse.text();
    console.error('Supabase insert failed:', details);
    return response(500, { error: 'Could not save the contact request.' });
  }

  return response(200, { ok: true, redirectTo: '/gracias.html' });
};
