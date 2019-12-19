const router = require('express').Router()

// Github login retrieval
router.get('/', (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID

  res.json({
    url: `https://github.com/login/oauth/authorize?scope=user:email&client_id=${client_id}`
  }) 
})

module.exports = router