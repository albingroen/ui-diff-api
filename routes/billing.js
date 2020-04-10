const router = require("express").Router();
const verify = require("./verifyToken");

const stripe = require('stripe')('sk_test_OjLTaqffHxMDSE8PybQvGnEM00UqzZnAHc');

// Create a team
router.get("/plans", async (req, res) => {
  const plans = await stripe.plans.list()

  res.json({
    plans
  })
});

module.exports = router;
