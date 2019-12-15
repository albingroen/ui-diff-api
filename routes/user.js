const router = require('express').Router()
const verify = require('./verifyToken')
const User = require('../schemas/user')

router.get('/', verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id })

  res.json({
    user
  })
})

module.exports = router