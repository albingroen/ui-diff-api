const router = require("express").Router();
const uuid = require("uuid/v5");
const { clientUrl, redirectUrl } = require("../utils");

// Github login retrieval
router.get("/github", (req, res) => {
  const { invitation } = req.query;
  const client_id = process.env.GITHUB_CLIENT_ID;

  if (!invitation || invitation === "undefined") {
    res.json({
      url: `https://github.com/login/oauth/authorize?scope=user&client_id=${client_id}&redirect_uri=${redirectUrl(
        "github"
      )}&state=${uuid.URL}`
    });
  } else {
    res.json({
      url: `https://github.com/login/oauth/authorize?scope=user&client_id=${client_id}&redirect_uri=${clientUrl}?invitation=${invitation}&state=${uuid.URL}`
    });
  }
});

router.get("/gitlab", (req, res) => {
  const { invitation } = req.query;
  const client_id = process.env.GITLAB_CLIENT_ID;

  if (!invitation || invitation === "undefined") {
    res.json({
      url: `https://gitlab.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirectUrl(
        "gitlab"
      )}&response_type=code&state=${uuid.URL}&scope=read_user`
    });
  } else {
    res.json({
      url: `https://gitlab.com/oauth/authorize?scope=user&client_id=${client_id}&redirect_uri=${clientUrl}?invitation=${invitation}&state=${uuid.URL}`
    });
  }
});

router.get("/google", (req, res) => {
  const { invitation } = req.query;
  const client_id = process.env.GOOGLE_CLIENT_ID;

  if (!invitation || invitation === "undefined") {
    res.json({
      url: `https://accounts.google.com/o/oauth2/v2/auth?scope=profile+email&response_type=code&client_id=${client_id}&redirect_uri=${redirectUrl(
        "google"
      )}&state=${uuid.URL}`
    });
  } else {
    res.json({
      url: `https://gitlab.com/oauth/authorize?scope=user&client_id=${client_id}&redirect_uri=${clientUrl}?invitation=${invitation}&state=${uuid.URL}`
    });
  }
});

module.exports = router;
