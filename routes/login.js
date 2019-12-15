const router = require('express').Router()

router.get('/', (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID

  res.json({
    url: `https://github.com/login/oauth/authorize?scope=repo&client_id=${client_id}`
  }) 
})

module.exports = router