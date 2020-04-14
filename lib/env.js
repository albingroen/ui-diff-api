const argv = require('minimist')(process.argv.slice(2));

const env = argv.env || 'live';

const envs = {
  live: 'https://app.ui-diff.com',
  local: 'http://localhost:3000',
};

const clientUrl = envs[env];

module.exports = {
  clientUrl,
};
