const router = require('express').Router();
const uuid = require('uuid/v5');
const { getRedirectUrl } = require('../lib/auth');

const oauthBaseUrls = {
  github: 'https://github.com/login/oauth/authorize',
  gitlab: 'https://gitlab.com/oauth/authorize',
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
};

const clientIds = {
  github: process.env.GITHUB_CLIENT_ID,
  gitlab: process.env.GITLAB_CLIENT_ID,
  google: process.env.GOOGLE_CLIENT_ID,
};

router.get('/:method', (req, res) => {
  const { method } = req.params;

  const client_id = clientIds[method];

  let authUrl;

  if (client_id) {
    switch (method) {
      case 'github':
        authUrl = `${
          oauthBaseUrls.github
        }?scope=user&client_id=${client_id}&redirect_uri=${getRedirectUrl(
          'github',
        )}&state=${uuid.URL}`;
        break;
      case 'gitlab':
        authUrl = `${
          oauthBaseUrls.gitlab
        }?client_id=${client_id}&redirect_uri=${getRedirectUrl(
          'gitlab',
        )}&response_type=code&state=${uuid.URL}&scope=read_user`;
        break;
      case 'google':
        authUrl = `${
          oauthBaseUrls.google
        }?scope=profile+email&response_type=code&client_id=${client_id}&redirect_uri=${getRedirectUrl(
          'google',
        )}&state=${uuid.URL}`;
        break;

      default:
        break;
    }
  }

  res.json({
    url: authUrl,
  });
});

module.exports = router;
