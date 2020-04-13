const router = require("express").Router();
const verify = require("./verifyToken");
const { stripe } = require("../lib/billing")


// Create a team
router.get("/plans", async (req, res) => {
  const plans = await stripe.plans.list()

  res.json({
    plans
  })
});

// Get subscriptions
router.get("/:customerId/subscriptions", async (req, res) => {
  const { customerId } = req.params

  const subscriptions = await stripe.subscriptions.list({ customer: customerId })

  res.json({
    subscriptions
  })
});

// Create subscription
router.post("/subscriptions", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: 'sek',
    payment_method_types: ['card'],
    receipt_email: 'jenny.rosen@example.com',

  });

  res.json({
    paymentIntent
  })
});

module.exports = router;
