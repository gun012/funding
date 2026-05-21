export default async function handler(req, res) {
  try {
    const url = "https://mss.go.kr/rss/smba/board/310.do";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/rss+xml,text/xml,*/*",
      },
    });

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/xml; charset=utf-8");

    return res.status(200).send(text);

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "mss notice proxy error",
      message: error.message,
    });
  }
}
