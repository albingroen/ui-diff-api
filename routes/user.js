const router = require("express").Router();
const verify = require("./verifyToken");
const User = require("../schemas/user");
const Team = require("../schemas/team");
const { createTokens, setTokens } = require('../lib/auth')
const { sendMail } = require('../lib/mail')
const welcome = require('../lib/email-templates/welcome')

// Get user
router.get("/", verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const teams = await Team.find({ 'members._user': { $in: user._id } });

  res.json({
    user: {
      ...user.toObject(),
      teams
    }
  });
});

// Confirm user
router.post('/:id/confirm', async (req, res) => {
  const { id } = req.params

  const user = await User.findOne({ _id: id })

  if (!user) {
    res.status(400).send({ error: 'user-not-found' })
  } else if (user.confirmed) {
    res.status(400).send({ error: 'email-already-confirmed' })
  } else {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id }, { confirmed: true }, { new: true }
    )
    
    const { token, refreshToken } = createTokens(
      updatedUser,
      process.env.JWT_SECRET,
      process.env.JWT_SECRET_2
    );

    setTokens(res, token, refreshToken);

    sendMail(
      updatedUser.email,
      'Welcome to ui-diff!',
      welcome(updatedUser.name)
    )

    res.send({
      user: updatedUser
    })
  }
})

module.exports = router;