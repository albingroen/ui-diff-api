const router = require("express").Router();
const verify = require("./verifyToken");
const User = require("../schemas/user");
const Team = require("../schemas/team");
const { createTokens, setTokens } = require('../lib/auth')
const { sendMail } = require('../lib/mail')
const { createStripeCustomer, createSubcription } = require('../lib/billing')
const welcome = require('../lib/email-templates/welcome')

// Get user
router.get("/", verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const teams = await Team.find({ 'members._user': { $in: user._id } }).populate('members._user');

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
    // Confirm user
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id }, { confirmed: true }, { new: true }
    )
    
    // Create user
    const { token, refreshToken } = createTokens(
      updatedUser,
      process.env.JWT_SECRET,
      process.env.JWT_SECRET_2
    );

    // Create Stripe customer and update user
    const customer = await createStripeCustomer({
      name: updatedUser.name,
      email: updatedUser.email
    }) 
    await User.findOneAndUpdate(
      { _id: updatedUser._id },
      { stripeCustomerId: customer.id }
    )

    // Create subscription
    await createSubcription({
      customerId: customer.id,
      items: [{ plan: 'free' }]
    })

    // Set tokens
    setTokens(res, token, refreshToken);

    // Send welcome email
    sendMail(
      updatedUser.email,
      'Welcome to ui-diff!',
      welcome(updatedUser.name)
    )

    // Return user
    res.send({
      user: updatedUser
    })
  }
})

module.exports = router;