export default async function handler(req, res) {
  try {
    const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();

    console.log(text);

    return res.status(200).json({
      status: 'ok',
      response: text
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      status: 'error',
      message: err.toString()
    });
  }
}
