const router = require("express").Router();

// Github login retrieval
router.get("/", (req, res) => {
  const { invitation } = req.query;
  const client_id = process.env.GITHUB_CLIENT_ID;

  let url;

  if (!invitation || invitation === "undefined") {
    url = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${client_id}`;
  } else {
    url = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${client_id}&redirect_uri=https://app.ui-diff.com/login?invitation=${invitation}`;
  }

  res.json({
    url
  });
});

module.exports = router;
