// Payments API Routes
// Yoco PayGate integration for online payments
// YOCO ONLY - Stripe/PayFast removed, not customer-facing

const express = require('express');
const router = express.Router();

// Environment variables
// YOCO_SECRET_KEY - Yoco secret key (server-side only)
// YOCO_PUBLIC_KEY - Yoco public key (frontend only, not used in backend)
// BASE_URL - Base URL for success/cancel redirects

// POST /api/payments/create-session
// DISABLED - Stripe removed, Yoco only
// ADMIN ONLY - Not customer-facing
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

    // DISABLED - Stripe removed, Yoco only
    res.status(410).json({
      success: false,
      error: 'Stripe payment gateway disabled',
      message: 'This payment method is no longer available. Please use Yoco PayGate for payments.'
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
// DISABLED - Stripe removed, Yoco only
// ADMIN ONLY - Not customer-facing
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

// POST /api/create-payment
// Creates a Yoco PayGate checkout session
// Accepts: amount (in cents), bookingRef
// Returns: { redirectUrl }
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, bookingRef } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'amount is required and must be greater than 0'
      });
    }

    if (!bookingRef) {
      return res.status(400).json({
        success: false,
        error: 'bookingRef is required'
      });
    }

    // Validate environment variables
    const yocoSecretKey = process.env.YOCO_SECRET_KEY;
    const baseUrl = process.env.BASE_URL || 'https://www.unicabtravelandtours.com';

    if (!yocoSecretKey) {
      console.error('YOCO_SECRET_KEY is not set in environment variables');
      return res.status(500).json({
        success: false,
        error: 'Payment gateway configuration error',
        message: 'Payment service is not properly configured'
      });
    }

    // Ensure amount is in cents (integer)
    const amountInCents = Math.round(amount);

    // Build success and cancel URLs
    const successUrl = `${baseUrl}/payment-success?bookingRef=${encodeURIComponent(bookingRef)}`;
    const cancelUrl = `${baseUrl}/payment-failed?bookingRef=${encodeURIComponent(bookingRef)}`;

    // Create Yoco checkout via API
    // Documentation: https://developer.yoco.com/inline/api-reference/
    const yocoApiUrl = 'https://payments.yoco.com/api/checkouts';

    const checkoutPayload = {
      amount: amountInCents,
      currency: 'ZAR',
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      metadata: {
        bookingRef: bookingRef
      }
    };

    // Make request to Yoco API
    const yocoResponse = await fetch(yocoApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yocoSecretKey}`
      },
      body: JSON.stringify(checkoutPayload)
    });

    // Check if request was successful
    if (!yocoResponse.ok) {
      const errorText = await yocoResponse.text();
      console.error('Yoco API error:', yocoResponse.status, errorText);
      
      return res.status(yocoResponse.status).json({
        success: false,
        error: 'Failed to create payment checkout',
        message: 'Payment gateway returned an error. Please try again.'
      });
    }

    // Parse Yoco response
    const yocoData = await yocoResponse.json();

    // Yoco returns a redirectUrl in the response
    if (!yocoData.redirectUrl) {
      console.error('Yoco response missing redirectUrl:', yocoData);
      return res.status(500).json({
        success: false,
        error: 'Invalid response from payment gateway',
        message: 'Payment gateway did not return a valid redirect URL'
      });
    }

    // Return redirect URL to frontend
    return res.json({
      success: true,
      redirectUrl: yocoData.redirectUrl
    });

  } catch (error) {
    console.error('Error creating Yoco payment checkout:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create payment checkout',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

module.exports = router;







