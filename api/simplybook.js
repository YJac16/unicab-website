// SimplyBook.me API Routes
// Server-side endpoints for SimplyBook integration
// Never exposes API keys to frontend

const express = require('express');
const router = express.Router();
const simplyBook = require('../lib/simplybook');

/**
 * GET /api/simplybook/services
 * Get list of available services (tours/transfers)
 */
router.get('/services', async (req, res) => {
  try {
    const { data, error } = await simplyBook.getServices();

    if (error) {
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch services',
        code: error.code
      });
    }

    return res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching SimplyBook services:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/simplybook/availability
 * Get availability for a service and date
 * Query params: serviceId, date, unitId (optional)
 */
router.get('/availability', async (req, res) => {
  try {
    const { serviceId, date, unitId } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        error: 'serviceId and date are required',
        message: 'Please provide serviceId and date query parameters'
      });
    }

    const { data, error } = await simplyBook.getAvailability(serviceId, date, unitId);

    if (error) {
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch availability',
        code: error.code
      });
    }

    return res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching SimplyBook availability:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/simplybook/create-booking
 * Create a new booking in SimplyBook
 * Body: { serviceId, date, time, unitId?, clientName, clientEmail, clientPhone?, customFields? }
 */
router.post('/create-booking', async (req, res) => {
  try {
    const {
      serviceId,
      date,
      time,
      unitId,
      clientName,
      clientEmail,
      clientPhone,
      customFields
    } = req.body;

    // Validate required fields
    if (!serviceId || !date || !time || !clientName || !clientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'serviceId, date, time, clientName, and clientEmail are required'
      });
    }

    const { data, error } = await simplyBook.createBooking({
      serviceId,
      date,
      time,
      unitId,
      clientName,
      clientEmail,
      clientPhone,
      customFields
    });

    if (error) {
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to create booking',
        code: error.code
      });
    }

    return res.json({
      success: true,
      data: data || {}
    });
  } catch (error) {
    console.error('Error creating SimplyBook booking:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/simplybook/booking/:id
 * Get booking details by ID
 */
router.get('/booking/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID is required'
      });
    }

    const { data, error } = await simplyBook.getBooking(id);

    if (error) {
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch booking',
        code: error.code
      });
    }

    return res.json({
      success: true,
      data: data || null
    });
  } catch (error) {
    console.error('Error fetching SimplyBook booking:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/simplybook/verify-booking
 * Verify booking exists and is completed (for review validation)
 * Body: { bookingId, clientEmail }
 */
router.post('/verify-booking', async (req, res) => {
  try {
    const { bookingId, clientEmail } = req.body;

    if (!bookingId || !clientEmail) {
      return res.status(400).json({
        success: false,
        error: 'bookingId and clientEmail are required'
      });
    }

    const { data, error } = await simplyBook.verifyBookingForReview(bookingId, clientEmail);

    if (error) {
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to verify booking',
        code: error.code
      });
    }

    return res.json({
      success: true,
      data: data || { exists: false, completed: false, booking: null }
    });
  } catch (error) {
    console.error('Error verifying SimplyBook booking:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/simplybook/providers
 * Get list of providers (drivers/guides)
 */
router.get('/providers', async (req, res) => {
  try {
    const { data, error } = await simplyBook.getProviders();

    if (error) {
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch providers',
        code: error.code
      });
    }

    return res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching SimplyBook providers:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/simplybook/reviews
 * Get reviews for a service or provider
 * Query params: serviceId, unitId, bookingId (all optional)
 */
router.get('/reviews', async (req, res) => {
  try {
    const { serviceId, unitId, bookingId } = req.query;

    const filters = {};
    if (serviceId) filters.serviceId = serviceId;
    if (unitId) filters.unitId = unitId;
    if (bookingId) filters.bookingId = bookingId;

    const { data, error } = await simplyBook.getReviews(filters);

    if (error) {
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to fetch reviews',
        code: error.code
      });
    }

    return res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching SimplyBook reviews:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/simplybook/submit-review
 * Submit a review for a completed booking
 * Body: { bookingId, clientEmail, rating, comment, serviceId?, unitId? }
 */
router.post('/submit-review', async (req, res) => {
  try {
    const {
      bookingId,
      clientEmail,
      rating,
      comment,
      serviceId,
      unitId
    } = req.body;

    // Validate required fields
    if (!bookingId || !clientEmail || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'bookingId, clientEmail, rating, and comment are required'
      });
    }

    const { data, error } = await simplyBook.submitReview({
      bookingId,
      clientEmail,
      rating,
      comment,
      serviceId,
      unitId
    });

    if (error) {
      return res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to submit review',
        code: error.code
      });
    }

    return res.json({
      success: true,
      data: data || {}
    });
  } catch (error) {
    console.error('Error submitting SimplyBook review:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;

