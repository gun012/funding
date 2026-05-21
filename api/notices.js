export default async function handler(req, res) {
  try {

    const url =
      "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?crtfcKey=&dataType=xml&searchCnt=30";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Content-Type",
      "text/xml; charset=utf-8"
    );

    return res.status(200).send(text);

  } catch (error) {

    return res.status(500).json({
      ok: false,
      error: "notice proxy error",
      message: error.message,
    });
  }
}
