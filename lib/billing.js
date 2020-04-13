const stripe = require('stripe')('sk_test_OjLTaqffHxMDSE8PybQvGnEM00UqzZnAHc');

const createStripeCustomer = async ({ name, email }) => {
  const customer = await stripe.customers.create({
    name,
    email
  })
  
  return customer
}

const createSubcription = async ({ customerId, items }) => {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items
  })
  
  return subscription
}

module.exports = {
  stripe,
  createStripeCustomer,
  createSubcription
}