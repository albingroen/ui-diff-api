const router = require("express").Router();

// Github login retrieval
router.get("/", (req, res) => {
  const { invitation } = req.query;
  const client_id = process.env.GITHUB_CLIENT_ID;

  const baseUrl = "https://app.ui-diff.com";

  if (!invitation || invitation === "undefined") {
    res.json({
      url: `https://github.com/login/oauth/authorize?scope=user:email&client_id=${client_id}&redirect_uri=${baseUrl}/login`;
    })
  } else {
    res.json({
      url: `https://github.com/login/oauth/authorize?scope=user:email&client_id=${client_id}&redirect_uri=${baseUrl}/login?invitation=${invitation}`;
    })
  }
});

module.exports = router;
