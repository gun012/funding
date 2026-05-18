export default async function handler(req, res) {
  try {
    const WEB_APP_URL = process.env.GOOGLE_SCRIPT_URL;

    if (!WEB_APP_URL) {
      return res.status(500).json({
        ok: false,
        error: "GOOGLE_SCRIPT_URL 환경변수가 없습니다.",
      });
    }

    const response = await fetch(WEB_APP_URL + "?action=dashboard");

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "dashboard api error",
      message: error.message,
    });
  }
}
