// Bookings API Routes
// POST /api/bookings - Create a new booking

const express = require('express');
const router = express.Router();
const { requireAuth } = require('./middleware/auth');

// Optional auth middleware - allows both authenticated and guest bookings
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.substring(7);
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      // Invalid token, continue as guest
      req.user = null;
    }
  }
  next();
};

// POST create a new booking
// Supports both authenticated members and guest bookings
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      tour_id,
      guide_id,
      booking_date,
      group_size,
      customer_name,
      customer_email,
      customer_phone,
      special_requests
    } = req.body;

    // Validation
    const errors = [];

    if (!tour_id) errors.push('tour_id is required');
    if (!guide_id) errors.push('guide_id is required');
    if (!booking_date) errors.push('booking_date is required (format: YYYY-MM-DD)');
    if (!group_size || group_size < 1) errors.push('group_size must be at least 1');
    if (!customer_name || customer_name.trim().length < 2) errors.push('customer_name is required (min 2 characters)');
    if (!customer_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      errors.push('valid customer_email is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: errors
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(booking_date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Validate date is not in the past
    const selectedDate = new Date(booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Booking date cannot be in the past'
      });
    }

    // TODO: Validate guide availability
    // 1. Check if guide is active
    // 2. Check if guide is available on the date (not booked, not blocked)
    // 3. Check guide_availability table

    // TODO: Get tour pricing and calculate total
    // const tour = await getTour(tour_id);
    // const price_per_person = calculateTourPrice(tour, group_size);
    // const total_amount = price_per_person * group_size;

    // For now, use placeholder values
    const price_per_person = 0; // Will be calculated from tour pricing
    const total_amount = 0; // Will be calculated

    // Get user_id if member is logged in
    const userId = req.user && req.user.role === 'MEMBER' ? req.user.id : null;

    // TODO: Insert booking into database
    // const { data, error } = await supabase
    //   .from('bookings')
    //   .insert({
    //     tour_id,
    //     guide_id,
    //     user_id: userId, // Link to member account if logged in
    //     date: booking_date,
    //     group_size,
    //     customer_name: customer_name.trim(),
    //     customer_email: customer_email.trim().toLowerCase(),
    //     customer_phone: customer_phone?.trim() || null,
    //     price_per_person,
    //     total_price: total_amount,
    //     status: 'pending', // Always start as PENDING until payment confirmed
    //     special_requests: special_requests?.trim() || null
    //   })
    //   .select()
    //   .single();

    // if (error) {
    //   // Check for double-booking error
    //   if (error.code === '23505') { // Unique constraint violation
    //     return res.status(409).json({
    //       success: false,
    //       error: 'Guide is already booked on this date'
    //     });
    //   }
    //   throw error;
    // }

    // Placeholder response
    const booking = {
      id: 'placeholder-id', // Will be UUID from database
      tour_id,
      guide_id,
      user_id: userId, // Link to member if logged in
      date: booking_date,
      group_size,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      customer_phone: customer_phone?.trim() || null,
      price_per_person,
      total_price: total_amount,
      status: 'pending',
      special_requests: special_requests?.trim() || null,
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully (pending payment confirmation)'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      message: error.message
    });
  }
});

module.exports = router;


