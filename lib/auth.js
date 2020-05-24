const jwt = require('jsonwebtoken');
const { clientUrl } = require('./env');

const createTokens = (user, secret1, secret2) => {
  const token = jwt.sign({ _id: user._id }, secret1, { expiresIn: '5m' });
  const refreshToken = jwt.sign({ _id: user._id }, secret2, {
    expiresIn: '7d',
  });

  return { token, refreshToken };
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
  getRedirectUrl,
  validatePassword,
  passwordResetIsValid,
};
