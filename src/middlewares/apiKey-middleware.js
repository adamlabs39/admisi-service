import "dotenv/config";

function apiKeyCheckPatient(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const faskesUuid = req.headers["faskes-uuid"];
  if (!apiKey || !faskesUuid) {
    return res.status(401).json({ error: "API Key dan Faskes UUID dibutuhkan" });
  }
  if (apiKey !== process.env.API_KEY_CHECK_NORM) {
    return res.status(403).json({ error: "API Key tidak valid" });
  }
  next();
}

export default apiKeyCheckPatient;
