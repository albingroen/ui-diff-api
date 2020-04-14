const stripe = require('stripe')('sk_test_OjLTaqffHxMDSE8PybQvGnEM00UqzZnAHc');

// Creating customers
const createStripeCustomer = async ({ name, email }) => {
  if (!name && !email) {
    return;
  }

  const customer = await stripe.customers.create({
    name,
    email,
  });

  return customer;
};

// Creating new subscriptions
const createCustomerSubscription = async ({ customerId, items }) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items,
  });

  return subscription;
};

// Fetching product plans
const getProductPlans = async () => {
  const plans = await stripe.plans.list();

  return plans;
};

// Creating subscriptions
const getCustomerSubscriptions = async (customerId) => {
  if (!customerId) {
    return;
  }

  const res = await stripe.subscriptions.list({ customer: customerId });

  return res;
};

// Creating payment methods
const connectCustomerPaymentMethod = async ({ customerId, methodId }) => {
  const res = await stripe.paymentMethods.attach(
    methodId,
    { customer: customerId },
  );

  return res;
};

module.exports = {
  stripe,
  createStripeCustomer,
  createCustomerSubscription,
  getProductPlans,
  getCustomerSubscriptions,
  connectCustomerPaymentMethod,
};
