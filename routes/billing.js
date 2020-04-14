const router = require("express").Router();
const verify = require("./verifyToken");
const { 
  stripe,
  getProductPlans,
  getCustomerSubscriptions,
  createCustomerSubscription,
  connectCustomerPaymentMethod
} = require("../lib/billing")


// Get all product plans
router.get("/plans", async (req, res) => {
  const plans = await getProductPlans()

  res.json({
    plans
  })
});

// Get customer subscriptions
router.get("/:customerId/subscriptions", async (req, res) => {
  const { customerId } = req.params

  const subscriptions = await getCustomerSubscriptions(customerId)

  res.json({
    subscriptions
  })
});

// Create customer payment method
router.post("/:customerId/payment-methods", async (req, res) => {
  const { customerId } = req.params

  const paymentMethod = await connectCustomerPaymentMethod({ 
    customerId, methodId: req.body.paymentMethod
  })

  res.json({
    paymentMethod
  })
})

module.exports = router;
