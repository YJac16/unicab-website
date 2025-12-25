// Admin API Routes
// Protected by ADMIN role
// Admin has full visibility and override authority

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const db = require('../lib/db');

// Apply auth middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// GET /api/admin/bookings
// All bookings with filters
router.get('/bookings', async (req, res) => {
  try {
    const { status, date_from, date_to, driver_id } = req.query;

    // TODO: Build query with filters
    // let query = `
    //   SELECT 
    //     b.*,
    //     t.name as tour_name,
    //     json_build_object(
    //       'id', d.id,
    //       'name', d.name,
    //       'email', d.email
    //     ) as driver,
    //     json_build_object(
    //       'id', t.id,
    //       'name', t.name
    //     ) as tour
    //   FROM bookings b
    //   INNER JOIN tours t ON b.tour_id = t.id
    //   LEFT JOIN drivers d ON b.driver_id = d.id
    //   WHERE 1=1
    // `;
    // const params = [];
    // let paramCount = 1;
    // 
    // if (status) {
    //   query += ` AND b.status = $${paramCount}`;
    //   params.push(status);
    //   paramCount++;
    // }
    // if (date_from) {
    //   query += ` AND b.date >= $${paramCount}`;
    //   params.push(date_from);
    //   paramCount++;
    // }
    // if (date_to) {
    //   query += ` AND b.date <= $${paramCount}`;
    //   params.push(date_to);
    //   paramCount++;
    // }
    // if (driver_id) {
    //   query += ` AND b.driver_id = $${paramCount}`;
    //   params.push(driver_id);
    //   paramCount++;
    // }
    // 
    // query += ` ORDER BY b.date ASC, b.created_at DESC`;
    // 
    // const { rows } = await db.query(query, params);

    // Placeholder response
    res.json({
      success: true,
      data: [],
      filters: { status, date_from, date_to, driver_id },
      message: 'Admin bookings endpoint - connect to database'
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
});

// PATCH /api/admin/bookings/:id
// Update booking status
router.patch('/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: pending, confirmed, or cancelled'
      });
    }

    // TODO: Update booking status
    // const { rows } = await db.query(
    //   `UPDATE bookings 
    //    SET status = $1, updated_at = NOW()
    //    WHERE id = $2
    //    RETURNING *`,
    //   [status, id]
    // );
    // 
    // if (rows.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     error: 'Booking not found'
    //   });
    // }

    // Placeholder response
    res.json({
      success: true,
      data: {
        id,
        status,
        updated_at: new Date().toISOString()
      },
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking',
      message: error.message
    });
  }
});

// GET /api/admin/drivers
// List all drivers (guides with user accounts)
router.get('/drivers', async (req, res) => {
  try {
    if (!db.isConfigured()) {
      return res.status(501).json({
        success: false,
        error: 'Database not configured'
      });
    }

    const result = await db.getGuidesWithUsers();
    res.json({
      success: true,
      data: result.rows || []
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch drivers',
      message: error.message
    });
  }
});

// POST /api/admin/drivers
// Create guide + user account (driver)
router.post('/drivers', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
      });
    }

    if (!db.isConfigured()) {
      return res.status(501).json({
        success: false,
        error: 'Database not configured'
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if guide or user already exists
    const guideExists = await db.guideExists(email);
    const userExists = await db.userExists(email);

    if (guideExists || userExists) {
      return res.status(409).json({
        success: false,
        error: 'A guide or user with this email already exists'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Create guide first
    const guideResult = await db.createGuide({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      active: true
    });

    const guideId = guideResult.rows[0].id;

    // Hash password and create user account
    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await db.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: 'DRIVER',
      guide_id: guideId,
      active: true
    });

    res.status(201).json({
      success: true,
      data: {
        guide_id: guideId,
        user_id: userResult.rows[0].id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: 'DRIVER'
      },
      message: 'Driver and user account created successfully'
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create driver',
      message: error.message
    });
  }
});

// PATCH /api/admin/drivers/:id
// Activate / deactivate driver
router.patch('/drivers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'active must be a boolean value'
      });
    }

    // TODO: Update driver active status
    // const { rows } = await db.query(
    //   `UPDATE drivers 
    //    SET active = $1, updated_at = NOW()
    //    WHERE id = $2
    //    RETURNING *`,
    //   [active, id]
    // );
    // 
    // if (rows.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     error: 'Driver not found'
    //   });
    // }

    // Placeholder response
    res.json({
      success: true,
      data: {
        id,
        active,
        updated_at: new Date().toISOString()
      },
      message: `Driver ${active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update driver',
      message: error.message
    });
  }
});

// GET /api/admin/drivers/:id/unavailability
// View driver blocked dates
router.get('/drivers/:id/unavailability', async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Query driver unavailability
    // const { rows } = await db.query(
    //   `SELECT id, date, reason, created_at
    //    FROM driver_unavailability
    //    WHERE driver_id = $1
    //    ORDER BY date ASC`,
    //   [id]
    // );

    // Placeholder response
    res.json({
      success: true,
      data: [],
      driver_id: id,
      message: 'Driver unavailability endpoint - connect to database'
    });
  } catch (error) {
    console.error('Error fetching driver unavailability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unavailability',
      message: error.message
    });
  }
});

// POST /api/admin/drivers/:id/unavailability
// Admin blocks dates for driver
router.post('/drivers/:id/unavailability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, reason } = req.body;

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

    // TODO: Insert unavailability (admin override)
    // const { rows } = await db.query(
    //   `INSERT INTO driver_unavailability (driver_id, date, reason)
    //    VALUES ($1, $2, $3)
    //    ON CONFLICT (driver_id, date) DO UPDATE SET reason = $3
    //    RETURNING id, date, reason, created_at`,
    //   [id, date, reason?.trim() || null]
    // );

    // Placeholder response
    res.status(201).json({
      success: true,
      data: {
        id: 'placeholder',
        driver_id: id,
        date,
        reason: reason?.trim() || null,
        created_at: new Date().toISOString()
      },
      message: 'Date blocked successfully'
    });
  } catch (error) {
    console.error('Error blocking date:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to block date',
      message: error.message
    });
  }
});

// DELETE /api/admin/drivers/:id/unavailability/:date
// Admin override unblock
router.delete('/drivers/:id/unavailability/:date', async (req, res) => {
  try {
    const { id, date } = req.params;

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
    //   [id, date]
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

