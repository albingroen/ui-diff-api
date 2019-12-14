const router = require('express').Router()
const axios = require('axios')

router.post('/', (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID
  const client_secret = process.env.GITHUB_CLIENT_SECRET

  axios.post('https://github.com/login/oauth/access_token', {
    client_id,
    client_secret,
    code: req.body.code
  }).then(result => {
    res.json({
      result: result.data
    })
  }).catch(err => {
    res.err({
      err
    })
  })
})

module.exports = router