const router = require('express').Router();
const { v5: uuid } = require('uuid');
const { getRedirectUrl } = require('../lib/auth');
const { env } = require('../lib/env');

const oauthBaseUrls = {
  github: 'https://github.com/login/oauth/authorize',
  gitlab: 'https://gitlab.com/oauth/authorize',
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
};

const clientIds = {
  github: process.env[`GITHUB_${env.toUpperCase()}_CLIENT_ID`],
  gitlab: process.env[`GITLAB_${env.toUpperCase()}_CLIENT_ID`],
  google: process.env[`GOOGLE_${env.toUpperCase()}_CLIENT_ID`],
};

const getState = (invitationId) => (invitationId ? `${uuid.URL}invitationId${invitationId}` : uuid.URL);

router.get('/:method', (req, res) => {
  const { method } = req.params;
  const { invitationId } = req.query;

  const client_id = clientIds[method];

  let authUrl;

  if (client_id) {
    switch (method) {
      case 'github':
        authUrl = `${
          oauthBaseUrls.github
        }?scope=user&client_id=${client_id}&redirect_uri=${getRedirectUrl(
          'github',
          invitationId,
        )}&state=${getState(invitationId)}`;
        break;
      case 'gitlab':
        authUrl = `${
          oauthBaseUrls.gitlab
        }?client_id=${client_id}&redirect_uri=${getRedirectUrl(
          'gitlab',
          invitationId,
        )}&response_type=code&state=${getState(invitationId)}&scope=read_user`;
        break;
      case 'google':
        authUrl = `${
          oauthBaseUrls.google
        }?scope=profile+email&response_type=code&client_id=${client_id}&redirect_uri=${getRedirectUrl(
          'google',
          invitationId,
        )}&state=${getState(invitationId)}`;
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
