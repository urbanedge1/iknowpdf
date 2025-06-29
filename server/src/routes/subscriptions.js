import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { supabase } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { validateSubscription } from '../middleware/validation.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Plan configurations
const PLANS = {
  pro: {
    id: 'plan_pro_monthly',
    amount: 19900, // ₹199 in paise
    currency: 'INR',
    interval: 1,
    period: 'monthly'
  },
  premium: {
    id: 'plan_premium_monthly',
    amount: 29900, // ₹299 in paise
    currency: 'INR',
    interval: 1,
    period: 'monthly'
  }
};

// @route   GET /api/v1/subscriptions/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', async (req, res, next) => {
  try {
    const plans = Object.entries(PLANS).map(([key, plan]) => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      amount: plan.amount / 100, // Convert paise to rupees
      currency: plan.currency,
      interval: plan.interval,
      period: plan.period
    }));

    res.json({
      success: true,
      data: { plans }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/subscriptions/create
// @desc    Create subscription
// @access  Private
router.post('/create', authenticate, validateSubscription, async (req, res, next) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    if (!PLANS[planId]) {
      return next(new AppError('Invalid plan ID', 400));
    }

    const plan = PLANS[planId];

    // Create customer in Razorpay
    const customer = await razorpay.customers.create({
      name: req.user.name,
      email: req.user.email,
      contact: req.user.phone || '',
      notes: {
        user_id: userId
      }
    });

    // Create subscription in Razorpay
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.id,
      customer_id: customer.id,
      quantity: 1,
      total_count: 12, // 12 months
      notes: {
        user_id: userId,
        plan: planId
      }
    });

    // Save subscription to database
    const { data: dbSubscription, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          razorpay_subscription_id: subscription.id,
          razorpay_customer_id: customer.id,
          plan_id: planId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_start * 1000),
          current_period_end: new Date(subscription.current_end * 1000)
        }
      ])
      .select()
      .single();

    if (error) {
      logger.error('Error saving subscription:', error);
      return next(new AppError('Failed to create subscription', 500));
    }

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        subscription: {
          id: dbSubscription.id,
          razorpay_subscription_id: subscription.id,
          plan_id: planId,
          status: subscription.status,
          short_url: subscription.short_url
        }
      }
    });
  } catch (error) {
    logger.error('Subscription creation error:', error);
    next(new AppError('Failed to create subscription', 500));
  }
});

// @route   POST /api/v1/subscriptions/verify
// @desc    Verify payment
// @access  Private
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_payment_id + '|' + razorpay_subscription_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return next(new AppError('Invalid payment signature', 400));
    }

    // Update subscription status
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('razorpay_subscription_id', razorpay_subscription_id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error || !subscription) {
      return next(new AppError('Subscription not found', 404));
    }

    // Update user plan
    await supabase
      .from('users')
      .update({ 
        plan: subscription.plan_id,
        tasks_limit: subscription.plan_id === 'pro' ? -1 : -1 // Unlimited for paid plans
      })
      .eq('id', req.user.id);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: { subscription }
    });
  } catch (error) {
    logger.error('Payment verification error:', error);
    next(new AppError('Payment verification failed', 500));
  }
});

// @route   GET /api/v1/subscriptions/current
// @desc    Get current subscription
// @access  Private
router.get('/current', authenticate, async (req, res, next) => {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching subscription:', error);
      return next(new AppError('Failed to fetch subscription', 500));
    }

    res.json({
      success: true,
      data: { subscription: subscription || null }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/v1/subscriptions/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/cancel', authenticate, async (req, res, next) => {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return next(new AppError('Active subscription not found', 404));
    }

    // Cancel subscription in Razorpay
    await razorpay.subscriptions.cancel(subscription.razorpay_subscription_id, {
      cancel_at_cycle_end: 1
    });

    // Update subscription status
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('id', subscription.id);

    res.json({
      success: true,
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    logger.error('Subscription cancellation error:', error);
    next(new AppError('Failed to cancel subscription', 500));
  }
});

export default router;