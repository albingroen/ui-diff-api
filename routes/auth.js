const router = require("express").Router();
const queryString = require("query-string");
const axios = require("axios");
const User = require("../schemas/user");
const { redirectUrl, createTokens } = require("../utils");

router.post("/github", (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  axios
    .post("https://github.com/login/oauth/access_token", {
      client_id,
      client_secret,
      code: req.body.code
    })
    .then(result => {
      const token = queryString.parse(result.data).access_token;

      axios
        .get("https://api.github.com/user", {
          headers: { Authorization: `token ${token}` }
        })
        .then(async userRes => {
          let user = await User.findOne({
            socialId: userRes.data.id
          });

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.avatar_url,
              socialId: userRes.data.id
            });
          }

          const { token } = createTokens(user, process.env.JWT_SECRET)

          res.header("auth-token", token).send({
            token,
            user
          });
        })
        .catch(err => {
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err);
    });
});

router.post("/gitlab", (req, res) => {
  const client_id = process.env.GITLAB_CLIENT_ID;
  const client_secret = process.env.GITLAB_CLIENT_SECRET;

  axios
    .post("https://gitlab.com/oauth/token", {
      client_id,
      client_secret,
      code: req.body.code,
      grant_type: "authorization_code",
      redirect_uri: redirectUrl('gitlab'),
    })
    .then(result => {
      const token = result.data.access_token;

      axios
        .get("https://gitlab.com/api/v3/user", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(async userRes => {
          let user = await User.findOne({
            socialId: userRes.data.id
          });

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.avatar_url,
              socialId: userRes.data.id
            });
          }

          const { token } = createTokens(user, process.env.JWT_SECRET)

          res.header("auth-token", token).send({
            token,
            user
          });
        })
        .catch(err => {
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err)
    });
});

router.post("/google", (req, res) => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;

  axios
    .post("https://oauth2.googleapis.com/token", {
      client_id,
      client_secret,
      code: req.body.code,
      grant_type: "authorization_code",
      redirect_uri: redirectUrl('google'),
    })
    .then(result => {
      const token = result.data.access_token;

      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`)
        .then(async userRes => {
          let user = await User.findOne({
            socialId: userRes.data.id
          });

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.picture,
              socialId: userRes.data.id
            });
          }

          const { token } = createTokens(user, process.env.JWT_SECRET)

          res.header("auth-token", token).send({
            token,
            user
          });
        })
        .catch(err => {
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err)
    });
});

module.exports = router;
