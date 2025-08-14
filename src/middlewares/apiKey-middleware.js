import "dotenv/config";

function apiKeyCheckPatient(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(401).json({ error: "API Key required" });
  }
  if (apiKey !== process.env.API_KEY_CHECK_NORM) {
    return res.status(403).json({ error: "Invalid API Key" });
  }
  next();
}

export default apiKeyCheckPatient;
