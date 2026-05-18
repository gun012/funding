export default async function handler(req, res) {
  try {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const inputPassword = req.query.password;

    if (!ADMIN_PASSWORD) {
      return res.status(500).json({
        ok: false,
        error: "ADMIN_PASSWORD 환경변수가 없습니다.",
      });
    }

    if (inputPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({
        ok: false,
        error: "관리자 비밀번호가 올바르지 않습니다.",
      });
    }

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
