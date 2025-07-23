const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const tamaraService = require('../services/tamaraService');
const DraftBooking = require('../models/DraftBooking');
const Booking = require('../models/Booking');

// Rate limiting configuration
const regularOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Create Tamara order and get checkout URL
router.post('/create-order', regularOperationsLimiter, async (req, res) => {
  try {
    const { draftBookingId } = req.body;

    // Get draft booking details
    const draftBooking = await DraftBooking.findById(draftBookingId).populate('packageId');
    if (!draftBooking) {
      return res.status(404).json({
        success: false,
        message: 'Draft booking not found'
      });
    }

    // Get main traveler contact info
    const mainTraveler = draftBooking.travelersInfo.find(t => t.type === 'adult' && t.email && t.phone);
    if (!mainTraveler) {
      return res.status(400).json({
        success: false,
        message: 'Main traveler contact information is required'
      });
    }

    // Prepare order data for Tamara
    const orderData = {
      orderReferenceId: draftBooking._id.toString(),
      orderNumber: draftBooking.bookingNumber,
      totalAmount: draftBooking.totalPrice.toString(),
      currency: 'SAR',
      description: `Travel package booking - ${draftBooking.packageDetails.title}`,
      locale: 'en_US', // You can make this dynamic based on user preference
      items: [
        {
          referenceId: draftBooking.packageId._id ? draftBooking.packageId._id.toString() : draftBooking.packageId.toString(),
          type: 'Digital',
          name: draftBooking.packageDetails.title || 'Travel Package',
          sku: draftBooking.packageId._id ? draftBooking.packageId._id.toString() : draftBooking.packageId.toString(),
          quantity: 1,
          unitPrice: draftBooking.totalPrice.toString(),
          totalAmount: draftBooking.totalPrice.toString()
        }
      ],
      consumer: {
        firstName: mainTraveler.firstName,
        lastName: mainTraveler.lastName,
        phoneNumber: mainTraveler.phone,
        email: mainTraveler.email,
        dateOfBirth: mainTraveler.dateOfBirth, // Format: YYYY-MM-DD
        nationalId: null // Optional
      },
      shippingAddress: {
        firstName: mainTraveler.firstName,
        lastName: mainTraveler.lastName,
        line1: 'Travel Package Booking',
        city: 'Riyadh',
        countryCode: 'SA'
      },
      billingAddress: {
        firstName: mainTraveler.firstName,
        lastName: mainTraveler.lastName,
        line1: 'Travel Package Booking',
        city: 'Riyadh',
        countryCode: 'SA'
      },
      merchantUrls: {
        success: `${process.env.FRONTEND_URL}/en/booking/tamara-success?draftBookingId=${draftBookingId}`,
        failure: `${process.env.FRONTEND_URL}/en/booking/tamara-failure?draftBookingId=${draftBookingId}`,
        cancel: `${process.env.FRONTEND_URL}/en/booking/tamara-cancel?draftBookingId=${draftBookingId}`,
        notification: `https://webhook.site/d8b7c4a5-7f82-4e91-9b34-2c5d1a8b9e0f` // Temporary for testing
      }
    };

    // Create Tamara order
    const tamaraResult = await tamaraService.createOrder(orderData);

    if (!tamaraResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create Tamara order',
        error: tamaraResult.error,
        details: tamaraResult.details
      });
    }

    // Store Tamara order ID in draft booking for reference
    await DraftBooking.findByIdAndUpdate(draftBookingId, {
      tamaraOrderId: tamaraResult.data.order_id,
      tamaraCheckoutUrl: tamaraResult.data.checkout_url
    });

    res.json({
      success: true,
      data: {
        orderId: tamaraResult.data.order_id,
        checkoutUrl: tamaraResult.data.checkout_url,
        draftBookingId: draftBookingId
      }
    });

  } catch (error) {
    console.error('Error creating Tamara order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Handle Tamara webhook notifications
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const signature = req.headers['tamara-signature'];
    const payload = req.body;

    // Validate webhook signature
    if (!tamaraService.validateWebhookSignature(payload, signature)) {
      console.error('Invalid Tamara webhook signature');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const webhookData = JSON.parse(payload);
    const { order_id, order_status, order_reference_id } = webhookData;

    console.log('Tamara webhook received:', {
      orderId: order_id,
      status: order_status,
      reference: order_reference_id
    });

    // Find draft booking by reference ID
    const draftBooking = await DraftBooking.findById(order_reference_id);
    if (!draftBooking) {
      console.error('Draft booking not found for Tamara webhook:', order_reference_id);
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Handle different order statuses
    switch (order_status) {
      case 'approved':
        await handleApprovedPayment(draftBooking, webhookData);
        break;
      case 'expired':
      case 'declined':
      case 'canceled':
        await handleFailedPayment(draftBooking, webhookData);
        break;
      default:
        console.log('Unhandled Tamara order status:', order_status);
    }

    res.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('Error processing Tamara webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
});

// Handle successful payment
async function handleApprovedPayment(draftBooking, webhookData) {
  try {
    // Get main traveler contact info
    const mainTraveler = draftBooking.travelersInfo.find(t => t.type === 'adult' && t.email && t.phone);

    // Create confirmed booking from draft
    const confirmedBooking = new Booking({
      user: null, // Guest booking
      package: draftBooking.packageId,
      travelers: draftBooking.travelers,
      travelDates: {
        checkIn: new Date(draftBooking.dateRange.start),
        checkOut: new Date(draftBooking.dateRange.end)
      },
      totalPrice: draftBooking.totalPrice,
      bookingStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'tamara',
      contactInfo: {
        email: mainTraveler.email,
        phone: mainTraveler.phone
      },
      specialRequests: `Travelers: ${JSON.stringify(draftBooking.travelersInfo)}. Tamara Order ID: ${webhookData.order_id}`,
      tamaraOrderId: webhookData.order_id,
      tamaraPaymentData: webhookData
    });

    await confirmedBooking.save();

    // Remove draft booking
    await DraftBooking.findByIdAndDelete(draftBooking._id);

    console.log('Tamara payment approved, booking confirmed:', confirmedBooking.bookingReference);

  } catch (error) {
    console.error('Error handling approved Tamara payment:', error);
    throw error;
  }
}

// Handle failed payment
async function handleFailedPayment(draftBooking, webhookData) {
  try {
    // Update draft booking with failure info
    await DraftBooking.findByIdAndUpdate(draftBooking._id, {
      paymentStatus: 'failed',
      tamaraPaymentData: webhookData,
      failureReason: webhookData.order_status
    });

    console.log('Tamara payment failed for booking:', draftBooking.bookingNumber);

  } catch (error) {
    console.error('Error handling failed Tamara payment:', error);
    throw error;
  }
}

// Get Tamara order status
router.get('/order-status/:orderId', regularOperationsLimiter, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const result = await tamaraService.getOrder(orderId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get order status',
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error getting Tamara order status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get available installment plans
router.get('/installment-plans', regularOperationsLimiter, async (req, res) => {
  try {
    const { amount, currency = 'SAR' } = req.query;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const result = await tamaraService.getInstallmentPlans(amount, currency);
    
    res.json(result);

  } catch (error) {
    console.error('Error getting Tamara installment plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;