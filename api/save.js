export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  try {
    const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!SCRIPT_URL) {
      return res.status(500).json({
        status: 'error',
        message: 'GOOGLE_SCRIPT_URL 환경변수가 없습니다.'
      });
    }

    const response = await fetch(SCRIPT_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain',
  },
  body: JSON.stringify(req.body),
});

    const text = await response.text();

    res.status(200).json({
  status: 'ok'
});

  } catch (err) {
    return ContentService
  .createTextOutput(JSON.stringify({ status: 'ok' }))
  .setMimeType(ContentService.MimeType.JSON);
  }
}
}

// redeploy
