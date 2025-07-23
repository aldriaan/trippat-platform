const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

// Create payment intent for Stripe
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { bookingId, paymentMethod = 'stripe' } = req.body;

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('package')
      .populate('activity');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Calculate total amount
    let totalAmount = booking.totalPrice;
    
    // Convert to cents for Stripe (Stripe uses cents)
    const amountInCents = Math.round(totalAmount * 100);

    if (paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd', // Change to 'sar' if using Saudi Riyal
        metadata: {
          bookingId: bookingId,
          userId: req.user.userId,
          type: booking.package ? 'package' : 'activity'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Update booking with payment intent ID
      booking.paymentIntentId = paymentIntent.id;
      booking.paymentStatus = 'pending';
      await booking.save();

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount,
        currency: 'usd'
      });
    } else {
      res.status(400).json({ error: 'Unsupported payment method' });
    }
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update booking status
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = 'completed';
        booking.bookingStatus = 'confirmed';
        booking.paymentDate = new Date();
        booking.paymentMethod = 'stripe';
        booking.transactionId = paymentIntent.id;
        await booking.save();

        // Send confirmation email (implement email service)
        // await sendBookingConfirmationEmail(booking);

        res.json({
          success: true,
          booking: booking,
          message: 'Payment successful and booking confirmed'
        });
      } else {
        res.status(404).json({ error: 'Booking not found' });
      }
    } else {
      res.status(400).json({ 
        error: 'Payment not successful',
        status: paymentIntent.status 
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Stripe webhook handler
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update booking status
      const booking = await Booking.findOne({ paymentIntentId: paymentIntent.id });
      if (booking) {
        booking.paymentStatus = 'completed';
        booking.bookingStatus = 'confirmed';
        booking.paymentDate = new Date();
        await booking.save();
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Update booking status
      const failedBooking = await Booking.findOne({ paymentIntentId: failedPayment.id });
      if (failedBooking) {
        failedBooking.paymentStatus = 'failed';
        failedBooking.bookingStatus = 'cancelled';
        await failedBooking.save();
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get payment methods
router.get('/payment-methods', auth, async (req, res) => {
  try {
    // Return available payment methods
    const paymentMethods = [
      {
        id: 'stripe',
        name: 'Credit/Debit Card',
        description: 'Pay securely with your credit or debit card',
        enabled: !!process.env.STRIPE_SECRET_KEY,
        currencies: ['usd', 'sar'],
        fees: {
          percentage: 2.9,
          fixed: 30 // in cents
        }
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with your PayPal account',
        enabled: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
        currencies: ['usd'],
        fees: {
          percentage: 3.49,
          fixed: 49 // in cents
        }
      }
    ];

    res.json({
      paymentMethods: paymentMethods.filter(method => method.enabled)
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Refund payment
router.post('/refund', auth, async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    // Get booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify user is admin or booking owner
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({ error: 'Cannot refund unpaid booking' });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
      reason: 'requested_by_customer',
      metadata: {
        bookingId: bookingId,
        reason: reason || 'Customer requested refund'
      }
    });

    // Update booking status
    booking.paymentStatus = 'refunded';
    booking.bookingStatus = 'cancelled';
    booking.refundId = refund.id;
    booking.refundDate = new Date();
    booking.refundReason = reason;
    await booking.save();

    res.json({
      success: true,
      refund: refund,
      booking: booking,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const query = req.user.role === 'admin' ? {} : { user: req.user.userId };
    
    const payments = await Booking.find(query)
      .select('totalPrice paymentStatus paymentDate paymentMethod transactionId bookingStatus')
      .populate('package', 'title destination')
      .populate('activity', 'title city')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      payments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPayments: total
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

module.exports = router;