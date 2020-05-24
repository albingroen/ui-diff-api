const router = require('express').Router();
const moment = require('moment');
const bcrypt = require('bcrypt');
const queryString = require('query-string');
const axios = require('axios');
const User = require('../schemas/user');
const PasswordReset = require('../schemas/password-reset');
const {
  createTokens,
  getRedirectUrl,
  validatePassword,
  passwordResetIsValid,
} = require('../lib/auth');
const { clientUrl } = require('../lib/env');
const { sendMail } = require('../lib/mail');
const { getAvatarFromEmail } = require('../lib/user');
const { acceptInvitation } = require('../lib/invitation');
const emailConfirmation = require('../lib/email-templates/email-confirmation');
const passwordReset = require('../lib/email-templates/password-reset');

router.post('/github', (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  axios
    .post('https://github.com/login/oauth/access_token', {
      client_id,
      client_secret,
      code: req.body.code,
    })
    .then((result) => {
      const token = queryString.parse(result.data).access_token;

      axios
        .get('https://api.github.com/user', {
          headers: { Authorization: `token ${token}` },
        })
        .then(async (userRes) => {
          let user = await User.findOne({
            $or: [{ email: userRes.data.email }, { socialId: userRes.data.id }],
          });

          console.log({
            user
          })

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.avatar_url,
              socialId: userRes.data.id,
            });

            if (req.body.invitationId) {
              const { invitationId } = req.body;
              await acceptInvitation(invitationId, user._id);
            }
          }

          const { token: authToken, refreshToken } = createTokens(
            user,
            process.env.JWT_SECRET,
            process.env.JWT_SECRET_2,
          );

          res.send({
            user,
            authToken,
            refreshToken,
          });
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post('/gitlab', (req, res) => {
  const client_id = process.env.GITLAB_CLIENT_ID;
  const client_secret = process.env.GITLAB_CLIENT_SECRET;

  axios
    .post('https://gitlab.com/oauth/token', {
      client_id,
      client_secret,
      code: req.body.code,
      grant_type: 'authorization_code',
      redirect_uri: getRedirectUrl('gitlab'),
    })
    .then((result) => {
      const token = result.data.access_token;

      axios
        .get('https://gitlab.com/api/v3/user', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(async (userRes) => {
          let user = await User.findOne({
            $or: [{ email: userRes.data.email }, { socialId: userRes.data.id }],
          });

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.avatar_url,
              socialId: userRes.data.id,
            });

            if (req.body.invitationId) {
              const { invitationId } = req.body;
              await acceptInvitation(invitationId, user._id);
            }
          }

          const { token: authToken, refreshToken } = createTokens(
            user,
            process.env.JWT_SECRET,
            process.env.JWT_SECRET_2,
          );

          res.send({
            user,
            authToken,
            refreshToken,
          });
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post('/google', (req, res) => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;

  axios
    .post('https://oauth2.googleapis.com/token', {
      client_id,
      client_secret,
      code: req.body.code,
      grant_type: 'authorization_code',
      redirect_uri: getRedirectUrl('google'),
    })
    .then((result) => {
      const token = result.data.access_token;

      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
        )
        .then(async (userRes) => {
          let user = await User.findOne({
            $or: [{ email: userRes.data.email }, { socialId: userRes.data.id }],
          });

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.picture,
              socialId: userRes.data.id,
            });

            if (req.body.invitationId) {
              const { invitationId } = req.body;
              await acceptInvitation(invitationId, user._id);
            }
          }

          const { token: authToken, refreshToken } = createTokens(
            user,
            process.env.JWT_SECRET,
            process.env.JWT_SECRET_2,
          );

          res.send({
            user,
            authToken,
            refreshToken,
          });
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.post('/email/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // Return if no credentials
  if (!(email && password)) {
    return res.status(400).send({ error: 'missing-credentials' });
  }

  if (!validatePassword(password)) {
    return res.status(400).send({ error: 'lacking-password' });
  }

  // Check for existing user
  const user = await User.findOne({ email });

  if (user) {
    res.status(500).send({ error: 'email-mismatch' });
  } else {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmed: false,
      avatar: getAvatarFromEmail(email),
    });

    sendMail(
      newUser.email,
      'Confirm email on ui-diff',
      emailConfirmation(`${clientUrl}/confirmation/${newUser._id}`),
    );

    if (req.body.invitationId) {
      const { invitationId } = req.body;
      await acceptInvitation(invitationId, newUser._id);
    }

    res.status(200).send('Success');
  }
});

router.post('/email/login', async (req, res) => {
  const { email, password } = req.body;

  // Return if no credentials
  if (!(email && password)) {
    return res.status(400).send({ error: 'missing-credentials' });
  }

  // Find user with email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send({ error: 'invalid-credentials' });
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (passwordsMatch) {
    if (user.confirmed) {
      const { token: authToken, refreshToken } = createTokens(
        user,
        process.env.JWT_SECRET,
        process.env.JWT_SECRET_2,
      );

      res.send({
        user,
        authToken,
        refreshToken,
      });
    } else {
      res.status(400).send({ error: 'email-not-confirmed' });
    }
  } else {
    return res.status(400).send({ error: 'invalid-credentials' });
  }
});

router.post('/email/reset/create', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).send();
  }

  const pr = await PasswordReset.create({
    _user: user._id,
    validThru: moment().add('1', 'hour'),
  });

  const url = `${clientUrl}/reset-password/${pr._id}`;

  sendMail(user.email, 'Reset your password', passwordReset(url));

  res.status(200).send();
});

router.post('/email/reset/confirm', async (req, res) => {
  const { newPassword, confirmedPassword, passwordResetId } = req.body;

  // Find user with email
  const pr = await PasswordReset.findOne({ _id: passwordResetId });
  const user = await User.findOne({ _id: pr._user });

  // Return if no credentials
  if (!(newPassword && confirmedPassword)) {
    return res.status(400).send({ error: 'missing-credentials' });
  }
  if (!pr) {
    return res.status(400).send({ error: 'unvailable' });
  }
  if (new Date() > new Date(pr.validThru)) {
    return res.status(400).send({ error: 'reset-password-link-expired' });
  }
  if (!user) {
    return res.status(400).send({ error: 'network' });
  }

  const passwordsMatch = newPassword === confirmedPassword;

  if (passwordsMatch) {
    if (user.confirmed) {
      const salt = await bcrypt.genSalt(10);

      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      const updatedUser = await User.updateOne(
        { _id: user._id },
        { password: hashedNewPassword },
        { new: true },
      );

      await PasswordReset.updateOne({ _id: pr._id }, { validThru: new Date() });

      const { token: authToken, refreshToken } = createTokens(
        updatedUser,
        process.env.JWT_SECRET,
        process.env.JWT_SECRET_2,
      );

      res.send({
        user: updatedUser,
        authToken,
        refreshToken,
      });
    } else {
      res.status(400).send({ error: 'email-not-confirmed' });
    }
  } else {
    return res.status(400).send({ error: 'invalid-credentials' });
  }
});

router.get('/email/reset/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).send({ error: 'network' });
  }

  const pr = await PasswordReset.findOne({ _id: id });

  if (!passwordResetIsValid(pr)) {
    return res.status(400).send({ error: 'link-expired' });
  }

  res.send({
    pr,
  });
});

router.post('/logout', (req, res) => {
  res.status(200).send();
});

module.exports = router;
