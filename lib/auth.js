const jwt = require('jsonwebtoken');
const { clientUrl, env } = require('./env');

const cookieConfig = {
  domain: env === 'live' ? 'ui-diff' : 'localhost',
  secure: env === 'live',
  maxAge: 1000000000,
};

const createTokens = (user, secret1, secret2) => {
  const token = jwt.sign({ _id: user._id }, secret1, { expiresIn: '5m' });
  const refreshToken = jwt.sign({ _id: user._id }, secret2, {
    expiresIn: '7d',
  });

  return { token, refreshToken };
};

const setTokens = (res, token, refreshToken) => {
  res.cookie('x-token', token, cookieConfig);
  res.cookie('x-refresh-token', refreshToken, cookieConfig);
};

const clearTokens = (res) => {
  res.clearCookie('x-token');
  res.clearCookie('x-refresh-token');
  return true;
};

const getRedirectUrl = (method) => `${clientUrl}/auth?method=${method}`;

const validatePassword = (password) => password.length > 5;

const passwordResetIsValid = (passwordReset) => {
  if (!passwordReset) {
    return false;
  }
  return new Date() < new Date(passwordReset.validThru);
};

module.exports = {
  createTokens,
  setTokens,
  clearTokens,
  getRedirectUrl,
  validatePassword,
  passwordResetIsValid,
};
