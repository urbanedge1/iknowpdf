import Stripe from 'stripe';
import { logger } from '../utils/logger.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Plan configurations for Stripe
export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    amount: 19900, // $199 in cents
    currency: 'usd',
    interval: 'month'
  },
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    amount: 29900, // $299 in cents
    currency: 'usd',
    interval: 'month'
  }
};

export async function createCustomer(user) {
  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: user.id
      }
    });
    
    logger.info('Stripe customer created:', customer.id);
    return customer;
  } catch (error) {
    logger.error('Failed to create Stripe customer:', error);
    throw error;
  }
}

export async function createSubscription(customerId, priceId) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });
    
    logger.info('Stripe subscription created:', subscription.id);
    return subscription;
  } catch (error) {
    logger.error('Failed to create Stripe subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
    
    logger.info('Stripe subscription cancelled:', subscription.id);
    return subscription;
  } catch (error) {
    logger.error('Failed to cancel Stripe subscription:', error);
    throw error;
  }
}

export async function constructWebhookEvent(body, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    return event;
  } catch (error) {
    logger.error('Failed to construct webhook event:', error);
    throw error;
  }
}

export { stripe };