export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { q1, q2, q3, q4, q5 } = req.body;

    const prompt =
      '당신은 대한민국 정책자금 전문 컨설턴트입니다.\n' +
      '업종: ' + (q1||'미입력') + '\n' +
      '설립: ' + (q2||'미입력') + '\n' +
      '매출: ' + (q3||'미입력') + '\n' +
      '목적: ' + (q4||'미입력') + '\n' +
      '신용: ' + (q5||'미입력') + '\n\n' +
      '다른 텍스트 없이 순수 JSON만 출력:\n' +
      '{"score":숫자0-100,"grade":"등급 한 줄","summary":"3-4문장 종합분석. 실질적 조언 포함.",' +
      '"funds":[' +
        '{"name":"실제자금명","amount":"지원금액/조건","match":숫자0-100,"reason":"매칭이유 한 줄"},' +
        '{"name":"","amount":"","match":숫자,"reason":""},' +
        '{"name":"","amount":"","match":숫자,"reason":""}' +
      '],"checklist":["서류1","서류2","서류3","서류4","서류5"]}\n' +
      '소진공/기보/신보/중진공/고용부 실제 정책자금만 포함.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'API 오류' });

    const raw = data.content.map(c => c.text || '').join('');
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
