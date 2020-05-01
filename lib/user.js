const md5 = require('md5');

const getAvatarFromEmail = (email) => {
  const hash = md5(email);

  return `https://www.gravatar.com/avatar/${hash}`;
};

module.exports = {
  getAvatarFromEmail,
};
