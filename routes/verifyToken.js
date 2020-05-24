const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.header('x-token');

  if (!token) return res.status(401).send('Access denied');

  try {
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).send('Expired token');
  }
};
