import express from 'express';
import crypto from 'crypto';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { getEmailQueue } from '../config/queues.js';

const router = express.Router();

// Razorpay webhook endpoint
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn('Invalid Razorpay webhook signature');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(body.toString());
    logger.info('Razorpay webhook received:', { event: event.event, entity: event.payload.subscription?.entity || event.payload.payment?.entity });

    switch (event.event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload.subscription.entity);
        break;
      
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.payment.entity);
        break;
      
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity);
        break;
      
      case 'subscription.completed':
        await handleSubscriptionCompleted(event.payload.subscription.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      default:
        logger.info('Unhandled webhook event:', event.event);
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
});

async function handleSubscriptionActivated(subscription) {
  try {
    const { data: dbSubscription, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date(subscription.current_start * 1000),
        current_period_end: new Date(subscription.current_end * 1000)
      })
      .eq('razorpay_subscription_id', subscription.id)
      .select('user_id, plan_id')
      .single();

    if (error) {
      logger.error('Error updating subscription:', error);
      return;
    }

    // Update user plan
    await supabase
      .from('users')
      .update({ 
        plan: dbSubscription.plan_id,
        tasks_limit: -1 // Unlimited for paid plans
      })
      .eq('id', dbSubscription.user_id);

    // Send confirmation email
    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', dbSubscription.user_id)
      .single();

    if (user) {
      const emailQueue = getEmailQueue();
      await emailQueue.add('send-email', {
        to: user.email,
        subject: 'Subscription Activated - iknowpdf',
        template: 'subscription-activated',
        data: {
          name: user.name,
          plan: dbSubscription.plan_id,
          amount: subscription.plan_id === 'pro' ? '₹199' : '₹299'
        }
      });
    }

    logger.info('Subscription activated successfully:', subscription.id);
  } catch (error) {
    logger.error('Error handling subscription activation:', error);
  }
}

async function handleSubscriptionCharged(payment) {
  try {
    // Get subscription details
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id, plan_id')
      .eq('razorpay_subscription_id', payment.subscription_id)
      .single();

    if (!subscription) return;

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', subscription.user_id)
      .single();

    if (user) {
      // Send payment confirmation email
      const emailQueue = getEmailQueue();
      await emailQueue.add('send-email', {
        to: user.email,
        subject: 'Payment Confirmation - iknowpdf',
        template: 'payment-confirmation',
        data: {
          name: user.name,
          amount: (payment.amount / 100).toFixed(2),
          currency: payment.currency.toUpperCase(),
          payment_id: payment.id,
          date: new Date().toLocaleDateString()
        }
      });
    }

    logger.info('Subscription charged successfully:', payment.id);
  } catch (error) {
    logger.error('Error handling subscription charge:', error);
  }
}

async function handleSubscriptionCancelled(subscription) {
  try {
    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('razorpay_subscription_id', subscription.id);

    // Get user details
    const { data: dbSubscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('razorpay_subscription_id', subscription.id)
      .single();

    if (dbSubscription) {
      // Downgrade user to free plan
      await supabase
        .from('users')
        .update({ 
          plan: 'free',
          tasks_limit: 3
        })
        .eq('id', dbSubscription.user_id);

      // Get user email for notification
      const { data: user } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', dbSubscription.user_id)
        .single();

      if (user) {
        const emailQueue = getEmailQueue();
        await emailQueue.add('send-email', {
          to: user.email,
          subject: 'Subscription Cancelled - iknowpdf',
          template: 'subscription-cancelled',
          data: {
            name: user.name,
            end_date: new Date(subscription.current_end * 1000).toLocaleDateString()
          }
        });
      }
    }

    logger.info('Subscription cancelled successfully:', subscription.id);
  } catch (error) {
    logger.error('Error handling subscription cancellation:', error);
  }
}

async function handleSubscriptionCompleted(subscription) {
  try {
    await supabase
      .from('subscriptions')
      .update({ status: 'completed' })
      .eq('razorpay_subscription_id', subscription.id);

    logger.info('Subscription completed:', subscription.id);
  } catch (error) {
    logger.error('Error handling subscription completion:', error);
  }
}

async function handlePaymentFailed(payment) {
  try {
    // Get subscription and user details
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id, plan_id')
      .eq('razorpay_subscription_id', payment.subscription_id)
      .single();

    if (!subscription) return;

    const { data: user } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', subscription.user_id)
      .single();

    if (user) {
      // Send payment failed notification
      const emailQueue = getEmailQueue();
      await emailQueue.add('send-email', {
        to: user.email,
        subject: 'Payment Failed - iknowpdf',
        template: 'payment-failed',
        data: {
          name: user.name,
          amount: (payment.amount / 100).toFixed(2),
          currency: payment.currency.toUpperCase(),
          reason: payment.error_description || 'Payment processing failed'
        }
      });
    }

    logger.warn('Payment failed:', payment.id);
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
}

export default router;