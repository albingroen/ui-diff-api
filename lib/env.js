const argv = require('minimist')(process.argv.slice(2));

const env = process.env.CLIENT_ENV || argv.env || 'live';

const envs = {
  live: 'http://localhost:3000',
  local: 'http://localhost:3000',
};

const clientUrl = envs[env];

module.exports = {
  clientUrl,
  envs,
  env,
};
