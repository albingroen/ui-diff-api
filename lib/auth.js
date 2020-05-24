const jwt = require('jsonwebtoken');
const { clientUrl } = require('./env');

const createTokens = (user, secret) => {
  const token = jwt.sign({ _id: user._id }, secret, { expiresIn: '7d' });

  return { token };
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
