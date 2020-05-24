const jwt = require('jsonwebtoken');
const { clearTokens } = require('../lib/auth');

const secret1 = process.env.JWT_SECRET;
const secret2 = process.env.JWT_SECRET_2;

module.exports = (req, res, next) => {
  const token = req.header('x-token');
  const refreshToken = req.header('x-refresh-token');

  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, secret1);
    req.user = verified;
    next();
  } catch (err) {
    if (!refreshToken) {
      return res.status(400).send('Invalid token');
    }
    try {
      const verified2 = jwt.verify(refreshToken, secret2);

      // TODO: Update this
      // const newTokens = createTokens(verified2, secret1, secret2);
      // setTokens(res, newTokens.token, newTokens.refreshToken);

      req.user = verified2;
      next();
    } catch (err2) {
      clearTokens(res);
      return res.status(400).send('Expired token');
    }
  }
};
