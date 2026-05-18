export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { q1, q2, q3, q4, q5 } = req.body || {};
    const prompt = buildPrompt({ q1, q2, q3, q4, q5 });

    // 1차: 저비용 Gemini Flash
    try {
      const geminiResult = await callGemini(prompt);
      const parsed = parseJsonOnly(geminiResult);
      return res.status(200).json({
        ...parsed,
        aiProvider: 'gemini-flash'
      });
    } catch (geminiErr) {
      console.error('Gemini failed. Falling back to Claude:', geminiErr);
    }

    // 2차: Gemini 실패 시 Claude Sonnet 백업
    try {
      const claudeResult = await callClaude(prompt);
      const parsed = parseJsonOnly(claudeResult);
      return res.status(200).json({
        ...parsed,
        aiProvider: 'claude-sonnet-fallback'
      });
    } catch (claudeErr) {
      console.error('Claude fallback failed:', claudeErr);
      return res.status(500).json({
        error: 'AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || '서버 오류가 발생했습니다.' });
  }
}

function buildPrompt({ q1, q2, q3, q4, q5 }) {
  return (
    '당신은 대한민국 정책자금 전문 컨설턴트입니다.\n' +
    '아래 조건을 기준으로 정책자금 가능성을 분석하세요.\n\n' +
    '업종: ' + (q1 || '미입력') + '\n' +
    '설립: ' + (q2 || '미입력') + '\n' +
    '매출: ' + (q3 || '미입력') + '\n' +
    '목적: ' + (q4 || '미입력') + '\n' +
    '신용: ' + (q5 || '미입력') + '\n\n' +
    '반드시 순수 JSON만 출력하세요. 설명문, 마크다운, 코드블록 금지.\n' +
    '소진공, 신보, 기보, 중진공, 고용부 등 실제 국내 정책자금 성격에 맞게 작성하세요.\n' +
    '정책명은 너무 단정하지 말고, 실제 상담 전 확인이 필요하다는 현실적인 톤을 유지하세요.\n\n' +
    'JSON 형식:\n' +
    '{' +
      '"score":숫자0-100,' +
      '"grade":"등급 한 줄",' +
      '"summary":"3-4문장 종합분석. 실질적 조언 포함.",' +
      '"funds":[' +
        '{"name":"실제자금명","amount":"지원금액/조건","match":숫자0-100,"reason":"매칭이유 한 줄"},' +
        '{"name":"실제자금명","amount":"지원금액/조건","match":숫자0-100,"reason":"매칭이유 한 줄"},' +
        '{"name":"실제자금명","amount":"지원금액/조건","match":숫자0-100,"reason":"매칭이유 한 줄"}' +
      '],' +
      '"checklist":["서류1","서류2","서류3","서류4","서류5"]' +
    '}'
  );
}

async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY가 없습니다.');
  }

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1600,
          responseMimeType: 'application/json'
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini API 오류');
  }

  const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';

  if (!text.trim()) {
    throw new Error('Gemini 응답이 비어 있습니다.');
  }

  return text;
}

async function callClaude(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY가 없습니다.');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      // 기존에 결과가 잘 나오던 모델명을 유지합니다.
      // 만약 API 오류가 나면 Anthropic 콘솔의 최신 모델명으로 교체하세요.
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      temperature: 0.35,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Claude API 오류');
  }

  const text = data.content?.map(c => c.text || '').join('') || '';

  if (!text.trim()) {
    throw new Error('Claude 응답이 비어 있습니다.');
  }

  return text;
}

function parseJsonOnly(raw) {
  const cleaned = String(raw)
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('AI가 JSON 형식으로 응답하지 않았습니다.');
  }

  const jsonText = cleaned.slice(jsonStart, jsonEnd + 1);
  const parsed = JSON.parse(jsonText);

  if (typeof parsed.score !== 'number') parsed.score = Number(parsed.score || 0);
  if (!Array.isArray(parsed.funds)) parsed.funds = [];
  if (!Array.isArray(parsed.checklist)) parsed.checklist = [];

  parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score || 0)));
  parsed.funds = parsed.funds.slice(0, 3);
  parsed.checklist = parsed.checklist.slice(0, 5);

  return parsed;
}
