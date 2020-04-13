const router = require("express").Router();
const verify = require("./verifyToken");
const { 
  stripe,
  getProductPlans,
  getCustomerSubscriptions,
  createSubcription
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

// Create a subscription
router.post("/subscriptions", async (req, res) => {
  const subscription = await createSubcription(req.body)

  res.json({
    subscription
  })
});

module.exports = router;
