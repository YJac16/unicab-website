// Bookings API Routes
// POST /api/bookings - Create a new booking

const express = require('express');
const router = express.Router();
const { requireAuth } = require('./middleware/auth');

// Optional auth middleware - allows both authenticated and guest bookings
// Supports both JWT and Supabase tokens
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.substring(7);
  if (token) {
    try {
      // Try JWT token first (legacy support)
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role?.toLowerCase() || 'customer'
      };
    } catch (jwtError) {
      // If JWT fails, try Supabase token
      try {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseUrl && supabaseServiceKey && supabaseUrl !== 'https://placeholder.supabase.co') {
          const { createClient } = require('@supabase/supabase-js');
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          });

          const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

          if (!error && user) {
            // Get user role from profiles
            const { data: profile, error: profileError } = await supabaseAdmin
              .from('profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();

            // If profile doesn't exist, that's okay - default to customer
            req.user = {
              id: user.id,
              email: user.email,
              role: profile?.role?.toLowerCase() || 'customer'
            };
          } else {
            req.user = null;
          }
        } else {
          req.user = null;
        }
      } catch (supabaseError) {
        // Invalid token or Supabase error, continue as guest
        console.warn('Supabase token verification failed:', supabaseError.message);
        req.user = null;
      }
    }
  } else {
    req.user = null;
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
      driver_id, // Accept driver_id as well (newer format)
      booking_date,
      booking_time,
      group_size,
      customer_name,
      customer_email,
      customer_phone,
      special_requests,
      status // Accept status from request
    } = req.body;

    // Use driver_id if provided, otherwise use guide_id (for backward compatibility)
    const finalGuideId = driver_id || guide_id;

    // Validation
    const errors = [];

    if (!tour_id) errors.push('tour_id is required');
    if (!finalGuideId) errors.push('guide_id or driver_id is required');
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

    // Helper function to parse duration hours from text
    function parseDurationHours(durationText) {
      if (!durationText) return null;
      
      const rangeMatch = durationText.match(/(\d+\.?\d*)\s*-?\s*(\d+\.?\d*)\s*hours?/i);
      if (rangeMatch) {
        const start = parseFloat(rangeMatch[1]);
        const end = parseFloat(rangeMatch[2]);
        return (start + end) / 2;
      }
      
      const singleMatch = durationText.match(/(\d+\.?\d*)\s*hours?/i);
      if (singleMatch) {
        return parseFloat(singleMatch[1]);
      }
      
      if (durationText.toLowerCase().includes('full day')) return 8.0;
      if (durationText.toLowerCase().includes('half day')) return 4.0;
      
      return null;
    }

    // Validate time if provided
    if (booking_time) {
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(booking_time)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid time format. Use HH:MM (24-hour format)'
        });
      }

      // Check if tour would end after cutoff time (8 PM = 20:00)
      // Get tour duration from database
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = require('@supabase/supabase-js');
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });

        const { data: tourData } = await supabaseAdmin
          .from('tours')
          .select('duration_hours, duration')
          .eq('id', tour_id)
          .single();

        if (tourData) {
          const durationHours = tourData.duration_hours || parseDurationHours(tourData.duration) || 8;
          const [hours, minutes] = booking_time.split(':').map(Number);
          const startDateTime = new Date(booking_date);
          startDateTime.setHours(hours, minutes || 0, 0, 0);
          
          const endDateTime = new Date(startDateTime.getTime() + (durationHours * 60 * 60 * 1000));
          const cutoffTime = new Date(booking_date);
          cutoffTime.setHours(20, 0, 0, 0); // 8 PM cutoff
          
          if (endDateTime > cutoffTime) {
            const endTimeStr = endDateTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            });
            return res.status(400).json({
              success: false,
              error: `This tour would end at ${endTimeStr}, which is after our 8:00 PM cutoff time. Please select an earlier start time.`
            });
          }
        }
      }
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

    // Get user_id if member is logged in (support both 'member' and 'MEMBER' role names)
    const userRole = req.user?.role?.toLowerCase();
    const userId = req.user && (userRole === 'member' || userRole === 'customer') ? req.user.id : null;

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

    // Determine status - if status is provided and valid, use it, otherwise default to 'reserved'
    const bookingStatus = req.body.status && ['reserved', 'pending', 'confirmed'].includes(req.body.status.toLowerCase())
      ? req.body.status.toLowerCase()
      : 'reserved';

    // Placeholder response
    const booking = {
      id: 'placeholder-id', // Will be UUID from database
      tour_id,
      guide_id: finalGuideId,
      driver_id: finalGuideId, // Also include driver_id for consistency
      user_id: userId, // Link to member if logged in
      date: booking_date,
      booking_date: booking_date, // Include both formats
      booking_time: booking_time || null,
      group_size,
      customer_name: customer_name.trim(),
      customer_email: customer_email.trim().toLowerCase(),
      customer_phone: customer_phone?.trim() || null,
      price_per_person,
      total_price: total_amount,
      status: bookingStatus,
      special_requests: special_requests?.trim() || null,
      created_at: new Date().toISOString()
    };

    const message = bookingStatus === 'reserved' 
      ? 'Reservation created successfully. Payment required to finalize booking.'
      : 'Booking created successfully (pending payment confirmation)';

    res.status(201).json({
      success: true,
      data: booking,
      message
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







