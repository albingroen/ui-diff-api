const router = require("express").Router();
const queryString = require("query-string");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../schemas/user");

// Authenticate user
router.post("/", (req, res) => {
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
            email: userRes.data.email,
            name: { $in: [userRes.data.name, userRes.data.login] }
          });

          if (!user) {
            user = await User.create({
              name: userRes.data.name || userRes.data.login,
              email: userRes.data.email,
              avatar: userRes.data.avatar_url
            });
          }

          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

          res.header("auth-token", token).send({
            token,
            user
          });
        })
        .catch(err => {
          console.error(err);
          res.error(err);
        });
    })
    .catch(err => {
      console.error(err);
      res.error(err);
    });
});

module.exports = router;
