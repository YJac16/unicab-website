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
// Create driver account using Supabase Auth
// Creates: auth user, profile with role='driver', drivers table record
router.post('/drivers', async (req, res) => {
  try {
    const { name, email, phone, license_number, password } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(501).json({
        success: false,
        error: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Check if user already exists in auth.users
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email.toLowerCase().trim());
    
    if (existingUser?.user) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email already exists'
      });
    }

    // Check if driver record already exists
    const { data: existingDriver } = await supabaseAdmin
      .from('drivers')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingDriver) {
      return res.status(409).json({
        success: false,
        error: 'A driver with this email already exists'
      });
    }

    let authUser;
    let inviteSent = false;

    // Create auth user
    if (password) {
      // Create user with password (immediate login)
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: name.trim(),
          role: 'driver'
        }
      });

      if (createError) {
        return res.status(400).json({
          success: false,
          error: 'Failed to create auth user',
          message: createError.message
        });
      }

      authUser = userData.user;
    } else {
      // Invite user via email (no password set)
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email.toLowerCase().trim(),
        {
          data: {
            full_name: name.trim(),
            role: 'driver'
          }
        }
      );

      if (inviteError) {
        return res.status(400).json({
          success: false,
          error: 'Failed to invite user',
          message: inviteError.message
        });
      }

      authUser = inviteData.user;
      inviteSent = true;
    }

    if (!authUser?.id) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create auth user'
      });
    }

    const userId = authUser.id;

    // Create profile with role='driver'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email: email.toLowerCase().trim(),
        role: 'driver',
        full_name: name.trim()
      });

    if (profileError) {
      // If profile insert fails, try to clean up auth user
      console.error('Profile creation error:', profileError);
      // Note: We don't delete auth user as it might be intentional (e.g., profile already exists)
    }

    // Create driver record
    const { data: driverData, error: driverError } = await supabaseAdmin
      .from('drivers')
      .insert({
        user_id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        license_number: license_number?.trim() || null,
        active: true
      })
      .select()
      .single();

    if (driverError) {
      console.error('Driver creation error:', driverError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create driver record',
        message: driverError.message
      });
    }

    res.status(201).json({
      success: true,
      data: {
        user_id: userId,
        driver_id: driverData.id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        license_number: license_number?.trim() || null,
        invite_sent: inviteSent,
        status: inviteSent ? 'pending_invite' : 'active'
      },
      message: inviteSent 
        ? 'Driver invited successfully. They will receive an email to set their password.'
        : 'Driver account created successfully'
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

