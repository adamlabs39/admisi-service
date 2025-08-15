import "dotenv/config";

function apiKeyCheckPatient(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ error: "API Key dibutuhkan" });
  }
  if (apiKey !== process.env.API_KEY_CHECK_NORM) {
    return res.status(403).json({ error: "API Key tidak valid" });
  }
  next();
}

export default apiKeyCheckPatient;
