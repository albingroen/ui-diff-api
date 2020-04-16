const router = require('express').Router();
const verify = require('./verifyToken');
const {
  getProductPlans,
  getCustomerSubscriptions,
  connectCustomerPaymentMethod,
  getCustomerPaymentMethods,
} = require('../lib/billing');

// Get all product plans
router.get('/plans', async (req, res) => {
  const plans = await getProductPlans();

  res.json({
    plans,
  });
});

// Get customer subscriptions
router.get('/:customerId/subscriptions', verify, async (req, res) => {
  const { customerId } = req.params;

  const subscriptions = await getCustomerSubscriptions(customerId);

  res.json({
    subscriptions,
  });
});

// Connect customer payment method
router.post('/:customerId/payment-methods', verify, async (req, res) => {
  const { customerId } = req.params;

  const paymentMethod = await connectCustomerPaymentMethod({
    customerId,
    methodId: req.body.paymentMethod,
  });

  res.json({
    paymentMethod,
  });
});

// Retrieve customer payment methods
router.get('/:customerId/payment-methods/:type', verify, async (req, res) => {
  const { customerId, type } = req.params;

  const paymentMethods = await getCustomerPaymentMethods({
    customerId,
    type,
  });

  res.json({
    paymentMethods,
  });
});

module.exports = router;
