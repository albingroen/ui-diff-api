const jwt = require("jsonwebtoken");
const { createTokens, setTokens, clearTokens } = require("../utils");

const secret1 = process.env.JWT_SECRET;
const secret2 = process.env.JWT_SECRET_2;

module.exports = function(req, res, next) {
  const token = req.cookies["x-token"];
  const refreshToken = req.cookies["x-refresh-token"];

  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, secret1);
    req.user = verified;
    next();
  } catch {
    if (!refreshToken) {
      res.status(400).send("Invalid token");
    } else {
      try {
        const verified2 = jwt.verify(refreshToken, secret2);
        const newTokens = createTokens(verified2, secret1, secret2);
        setTokens(res, newTokens.token, newTokens.refreshToken);
        req.user = verified2;
        next();
      } catch {
        clearTokens(res);
        res.status(400).send("Expired token");
      }
    }
  }
};
