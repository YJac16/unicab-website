// Driver API Routes
// Protected by DRIVER role
// Drivers can only see their own data

const express = require('express');
const router = express.Router();
const { requireAuth, requireDriver } = require('./middleware/auth');

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(requireDriver);

// GET /api/driver/bookings
// Return CONFIRMED bookings assigned to the driver
router.get('/bookings', async (req, res) => {
  try {
    const driverId = req.user.driverId;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        error: 'Driver profile not linked to user account'
      });
    }

    // TODO: Query database for confirmed bookings
    // const { rows } = await db.query(
    //   `SELECT 
    //      b.*,
    //      t.name as tour_name,
    //      t.duration,
    //      json_build_object(
    //        'name', d.name,
    //        'email', d.email
    //      ) as driver
    //    FROM bookings b
    //    INNER JOIN tours t ON b.tour_id = t.id
    //    INNER JOIN drivers d ON b.driver_id = d.id
    //    WHERE b.driver_id = $1 
    //      AND b.status = 'confirmed'
    //      AND b.date >= CURRENT_DATE
    //    ORDER BY b.date ASC, b.created_at ASC`,
    //   [driverId]
    // );

    // Placeholder response
    res.json({
      success: true,
      data: [],
      message: 'Driver bookings endpoint - connect to database to fetch bookings'
    });
  } catch (error) {
    console.error('Error fetching driver bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
});

// GET /api/driver/unavailability
// Return list of blocked dates for the driver
router.get('/unavailability', async (req, res) => {
  try {
    const driverId = req.user.driverId;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        error: 'Driver profile not linked to user account'
      });
    }

    // TODO: Query database for unavailability
    // const { rows } = await db.query(
    //   `SELECT id, date, reason, created_at
    //    FROM driver_unavailability
    //    WHERE driver_id = $1
    //      AND date >= CURRENT_DATE
    //    ORDER BY date ASC`,
    //   [driverId]
    // );

    // Placeholder response
    res.json({
      success: true,
      data: [],
      message: 'Driver unavailability endpoint - connect to database'
    });
  } catch (error) {
    console.error('Error fetching unavailability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unavailability',
      message: error.message
    });
  }
});

// POST /api/driver/unavailability
// Block a date for the driver
router.post('/unavailability', async (req, res) => {
  try {
    const driverId = req.user.driverId;
    const { date, reason } = req.body;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        error: 'Driver profile not linked to user account'
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Date is required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Cannot block dates in the past'
      });
    }

    // TODO: Check if driver has CONFIRMED booking on this date
    // const bookingCheck = await db.query(
    //   `SELECT id FROM bookings 
    //    WHERE driver_id = $1 
    //      AND date = $2 
    //      AND status = 'confirmed'`,
    //   [driverId, date]
    // );
    // 
    // if (bookingCheck.rows.length > 0) {
    //   return res.status(409).json({
    //     success: false,
    //     error: 'Cannot block date with confirmed booking'
    //   });
    // }

    // TODO: Insert unavailability
    // const { rows } = await db.query(
    //   `INSERT INTO driver_unavailability (driver_id, date, reason)
    //    VALUES ($1, $2, $3)
    //    ON CONFLICT (driver_id, date) DO UPDATE SET reason = $3
    //    RETURNING id, date, reason, created_at`,
    //   [driverId, date, reason?.trim() || null]
    // );

    // Placeholder response
    res.status(201).json({
      success: true,
      data: {
        id: 'placeholder',
        driver_id: driverId,
        date,
        reason: reason?.trim() || null,
        created_at: new Date().toISOString()
      },
      message: 'Date blocked successfully'
    });
  } catch (error) {
    console.error('Error blocking date:', error);
    
    // Check for unique constraint violation (already blocked)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Date is already blocked'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to block date',
      message: error.message
    });
  }
});

// DELETE /api/driver/unavailability/:date
// Remove blocked date
router.delete('/unavailability/:date', async (req, res) => {
  try {
    const driverId = req.user.driverId;
    const { date } = req.params;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        error: 'Driver profile not linked to user account'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // TODO: Delete unavailability
    // const result = await db.query(
    //   `DELETE FROM driver_unavailability
    //    WHERE driver_id = $1 AND date = $2`,
    //   [driverId, date]
    // );
    // 
    // if (result.rowCount === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     error: 'Blocked date not found'
    //   });
    // }

    // Placeholder response
    res.json({
      success: true,
      message: 'Blocked date removed successfully'
    });
  } catch (error) {
    console.error('Error removing blocked date:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove blocked date',
      message: error.message
    });
  }
});

module.exports = router;
