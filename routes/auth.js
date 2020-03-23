const router = require("express").Router();
const bcrypt = require('bcrypt')
const queryString = require("query-string");
const axios = require("axios");
const User = require("../schemas/user");
const {
  createTokens,
  setTokens,
  clearTokens,
  getRedirectUrl,
  validatePassword
} = require("../lib/auth");
const { clientUrl } = require('../lib/env')
const { sendMail } = require('../lib/mail')
const emailConfirmation = require('../lib/email-templates/email-confirmation')

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
            $or: [
              { email : userRes.data.email },
              { socialId: userRes.data.id }
            ]
          });

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.avatar_url,
              socialId: userRes.data.id
            });
          }

          const { token, refreshToken } = createTokens(
            user,
            process.env.JWT_SECRET,
            process.env.JWT_SECRET_2
          );

          setTokens(res, token, refreshToken);

          res.send({
            user
          });
        })
        .catch(err => {
          console.error(err);
          res.status(400).send(err)
        });
    })
    .catch(err => {
      console.error(err);
      res.status(400).send(err)
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
      redirect_uri: getRedirectUrl("gitlab")
    })
    .then(result => {
      const token = result.data.access_token;

      axios
        .get("https://gitlab.com/api/v3/user", {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(async userRes => {
          let user = await User.findOne({
            $or: [
              { email : userRes.data.email },
              { socialId: userRes.data.id }
            ]
          });

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.avatar_url,
              socialId: userRes.data.id
            });
          }

          const { token, refreshToken } = createTokens(
            user,
            process.env.JWT_SECRET,
            process.env.JWT_SECRET_2
          );

          setTokens(res, token, refreshToken);

          res.send({
            user
          });
        })
        .catch(err => {
          console.error(err);
          res.status(400).send(err)
        });
    })
    .catch(err => {
      console.error(err);
      res.status(400).send(err)
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
      redirect_uri: getRedirectUrl("google")
    })
    .then(result => {
      const token = result.data.access_token;

      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`
        )
        .then(async userRes => {
          let user = await User.findOne({
            $or: [
              { email : userRes.data.email },
              { socialId: userRes.data.id }
            ]
          });

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.picture,
              socialId: userRes.data.id
            });
          }

          const { token, refreshToken } = createTokens(
            user,
            process.env.JWT_SECRET,
            process.env.JWT_SECRET_2
          );

          setTokens(res, token, refreshToken);

          res.send({
            user
          });
        })
        .catch(err => {
          console.error(err);
          res.status(400).send(err)
        });
    })
    .catch(err => {
      console.error(err);
      res.status(400).send(err)
    });
});

router.post("/email/signup", async (req, res, next) => {
  const { name, email, password } = req.body

  // Return if no credentials
  if (!(email && password)) {
    return res.status(400).send({ error: 'missing-credentials' })
  }

  if (!validatePassword(password)) {
    return res.status(400).send({ error: 'lacking-password' })
  }

  // Check for existing user
  const user = await User.findOne({ email })

  if (user) {
    res.status(500).send({ error: "email-mismatch" })
  } else {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmed: false
    })

    sendMail(
      newUser.email,
      'Confirm email on ui-diff',
      emailConfirmation(`${clientUrl}/confirmation/${newUser._id}`)
    )

    res.status(200).send("Success")
  }
});

router.post("/email/login", async (req, res, next) => {
  const { email, password } = req.body

  // Return if no credentials
  if (!(email && password)) {
    return res.status(400).send({ error: 'missing-credentials' })
  }

  // Find user with email
  const user = await User.findOne({ email })

  if (!user) {
    return res.status(400).send({ error: 'invalid-credentials' })
  }

  const passwordsMatch = await bcrypt.compare(password, user.password)

  if (passwordsMatch) {
    if (user.confirmed) {
      const { token, refreshToken } = createTokens(
        user,
        process.env.JWT_SECRET,
        process.env.JWT_SECRET_2
      );

      setTokens(res, token, refreshToken);

      res.send({
        user
      })
    } else {
      res.status(400).send({ error: 'email-not-confirmed' })
    }
  } else {
    return res.status(400).send({ error: 'invalid-credentials' })
  }
});

router.post("/logout", (req, res) => {
  clearTokens(res);
  res.status(200).send();
});

module.exports = router;
