// Payments API — YOCO Checkout only
const express = require('express');
const router = express.Router();
const { getSupabaseAdmin, isSupabaseConfigured } = require('../lib/supabaseAdmin');

const getBaseUrl = () =>
  process.env.BASE_URL ||
  process.env.FRONTEND_URL ||
  'https://www.unicabtravelandtours.com';

// POST /api/payments/create-payment
// Create YOCO checkout for an existing Supabase booking
router.post('/create-payment', async (req, res) => {
  try {
    const { amount, bookingRef, booking_id } = req.body;
    const bookingId = booking_id || bookingRef;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'amount is required and must be greater than 0'
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'bookingRef (booking id) is required'
      });
    }

    const yocoSecretKey = process.env.YOCO_SECRET_KEY;
    if (!yocoSecretKey) {
      return res.status(500).json({
        success: false,
        error: 'Payment gateway configuration error',
        message: 'YOCO_SECRET_KEY is not configured'
      });
    }

    const amountInCents = Math.round(Number(amount));
    const baseUrl = getBaseUrl();
    const successUrl = `${baseUrl}/payment-success?bookingRef=${encodeURIComponent(bookingId)}`;
    const cancelUrl = `${baseUrl}/payment-failed?bookingRef=${encodeURIComponent(bookingId)}`;

    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${yocoSecretKey}`
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: 'ZAR',
        successUrl,
        cancelUrl,
        metadata: {
          bookingRef: String(bookingId),
          booking_id: String(bookingId)
        }
      })
    });

    if (!yocoResponse.ok) {
      const errorText = await yocoResponse.text();
      console.error('Yoco API error:', yocoResponse.status, errorText);
      return res.status(yocoResponse.status).json({
        success: false,
        error: 'Failed to create payment checkout',
        message: 'Payment gateway returned an error. Please try again.'
      });
    }

    const yocoData = await yocoResponse.json();
    if (!yocoData.redirectUrl) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response from payment gateway'
      });
    }

    // Store checkout id + pending payment on booking
    if (isSupabaseConfigured()) {
      try {
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin
          .from('bookings')
          .update({
            payment_status: 'pending',
            yoco_checkout_id: yocoData.id || yocoData.checkoutId || null,
            payment_reference: yocoData.id || bookingId
          })
          .eq('id', bookingId);
      } catch (dbError) {
        console.warn('Could not update booking payment fields:', dbError.message);
      }
    }

    return res.json({
      success: true,
      data: {
        redirectUrl: yocoData.redirectUrl,
        checkoutId: yocoData.id || yocoData.checkoutId || null
      },
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

// POST /api/payments/webhook
// YOCO webhook — confirm booking payment in Supabase
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body || {};
    const eventType = payload.type || payload.event || payload.eventType;
    const data = payload.payload || payload.data || payload;

    const bookingId =
      data?.metadata?.booking_id ||
      data?.metadata?.bookingRef ||
      payload?.metadata?.booking_id ||
      payload?.metadata?.bookingRef;

    const paymentRef =
      data?.id ||
      data?.checkoutId ||
      data?.paymentId ||
      payload?.id ||
      null;

    console.log('YOCO webhook received:', { eventType, bookingId, paymentRef });

    const isPaid =
      /payment\.succeeded|checkout\.succeeded|payment_succeeded|succeeded/i.test(String(eventType || '')) ||
      data?.status === 'succeeded' ||
      data?.status === 'successful';

    const isFailed =
      /payment\.failed|checkout\.failed|failed/i.test(String(eventType || '')) ||
      data?.status === 'failed';

    if (bookingId && isSupabaseConfigured()) {
      const supabaseAdmin = getSupabaseAdmin();
      const updates = {
        payment_reference: paymentRef || bookingId
      };

      if (isPaid) {
        updates.status = 'confirmed';
        updates.payment_status = 'paid';
        updates.paid_at = new Date().toISOString();
      } else if (isFailed) {
        updates.payment_status = 'failed';
      }

      const { error } = await supabaseAdmin
        .from('bookings')
        .update(updates)
        .eq('id', bookingId);

      if (error) {
        console.error('Failed to update booking from YOCO webhook:', error);
      }
    }

    return res.json({ success: true, received: true });
  } catch (error) {
    console.error('Error processing YOCO webhook:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
      message: error.message
    });
  }
});

// POST /api/payments/confirm
// Fallback confirm after redirect (when webhook is delayed)
router.post('/confirm', async (req, res) => {
  try {
    const { bookingRef, booking_id } = req.body;
    const bookingId = booking_id || bookingRef;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'bookingRef is required'
      });
    }

    if (!isSupabaseConfigured()) {
      return res.status(501).json({
        success: false,
        error: 'Supabase not configured'
      });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
      message: error.message
    });
  }
});

module.exports = router;
