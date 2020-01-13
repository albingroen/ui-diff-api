const router = require("express").Router();
const uuid = require("uuid/v5");
const { clientUrl } = require("../utils");

// Github login retrieval
router.get("/", (req, res) => {
  const { invitation } = req.query;
  const client_id = process.env.GITHUB_CLIENT_ID;

  if (!invitation || invitation === "undefined") {
    res.json({
      url: `https://github.com/login/oauth/authorize?scope=user&client_id=${client_id}&redirect_uri=${clientUrl}/login&state=${uuid.URL}`
    });
  } else {
    res.json({
      url: `https://github.com/login/oauth/authorize?scope=user&client_id=${client_id}&redirect_uri=${clientUrl}/login?invitation=${invitation}&state=${uuid.URL}`
    });
  }
});

module.exports = router;
