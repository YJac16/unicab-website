// Payments API Routes
// Stub endpoints for future Stripe integration
// DO NOT process real payments yet

const express = require('express');
const router = express.Router();

// Environment variables for Stripe (will be set later)
// STRIPE_SECRET_KEY - Stripe secret key
// STRIPE_PUBLISHABLE_KEY - Stripe publishable key
// STRIPE_WEBHOOK_SECRET - Stripe webhook secret

// POST /api/payments/create-session
// Creates a Stripe Checkout session (stub for now)
router.post('/create-session', async (req, res) => {
  try {
    const { booking_id, amount, currency = 'zar' } = req.body;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: 'booking_id is required'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'amount must be greater than 0'
      });
    }

    // TODO: When Stripe is integrated, uncomment and configure:
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Tour Booking',
              description: `Booking ID: ${booking_id}`
            },
            unit_amount: Math.round(amount * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
      metadata: {
        booking_id: booking_id
      }
    });

    return res.json({
      success: true,
      data: {
        session_id: session.id,
        url: session.url
      }
    });
    */

    // Stub response - payments not yet enabled
    res.json({
      success: false,
      error: 'Online payments coming soon',
      message: 'Payment processing is not yet enabled. Please contact us to complete your booking.',
      // When Stripe is enabled, this will return:
      // data: {
      //   session_id: session.id,
      //   url: session.url
      // }
    });
  } catch (error) {
    console.error('Error creating payment session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment session',
      message: error.message
    });
  }
});

// POST /api/payments/webhook
// Stripe webhook endpoint (stub for now)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // TODO: When Stripe is integrated, uncomment and configure:
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const bookingId = session.metadata.booking_id;
        
        // Update booking status to confirmed
        // await updateBookingStatus(bookingId, 'confirmed');
        
        console.log(`Booking ${bookingId} confirmed via payment`);
        break;
      
      case 'payment_intent.succeeded':
        console.log('Payment succeeded');
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
    */

    // Stub response
    console.log('Webhook received (not yet configured)');
    res.json({
      success: true,
      message: 'Webhook endpoint ready for Stripe integration'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      message: error.message
    });
  }
});

module.exports = router;







