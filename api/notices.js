export default async function handler(req, res) {
  try {
    const url =
      "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do?dataType=json&cnt=50";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json,text/plain,*/*",
      },
    });

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Content-Type",
      "application/json; charset=utf-8"
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
