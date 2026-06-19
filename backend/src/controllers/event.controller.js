const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

// Create event booking inquiry
const createEventBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { eventType, eventName, eventDate, startTime, endTime, guestsCount, requirements } = req.body;
    const id = uuidv4();
    const userId = req.user ? req.user.id : null;

    await pool.query(
      `INSERT INTO event_bookings (id, user_id, event_type, event_name, event_date, start_time, end_time, guests_count, requirements)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, eventType, eventName, eventDate, startTime, endTime, guestsCount, requirements || null]
    );

    const [rows] = await pool.query('SELECT * FROM event_bookings WHERE id = ?', [id]);

    res.status(201).json({
      success: true,
      message: 'Event booking inquiry submitted successfully. Our team will contact you shortly.',
      data: { eventBooking: rows[0] }
    });
  } catch (error) {
    console.error('Create event booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit event booking inquiry'
    });
  }
};

// Get user's event bookings
const getMyEventBookings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM event_bookings WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      data: { eventBookings: rows }
    });
  } catch (error) {
    console.error('Get event bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event bookings'
    });
  }
};

// Get all event bookings (admin only)
const getAllEventBookings = async (req, res) => {
  try {
    const { status, eventType } = req.query;
    
    let query = `
      SELECT eb.*, u.email as user_email, u.first_name, u.last_name, u.phone 
      FROM event_bookings eb
      LEFT JOIN users u ON eb.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND eb.status = ?';
      params.push(status);
    }

    if (eventType) {
      query += ' AND eb.event_type = ?';
      params.push(eventType);
    }

    query += ' ORDER BY eb.event_date ASC';

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: { eventBookings: rows }
    });
  } catch (error) {
    console.error('Get all event bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event bookings'
    });
  }
};

// Update event booking status (admin only)
const updateEventBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, totalAmount } = req.body;

    const validStatuses = ['inquiry', 'pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let query = 'UPDATE event_bookings SET status = ?';
    const params = [status];

    if (totalAmount !== undefined) {
      query += ', total_amount = ?';
      params.push(totalAmount);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);

    const [rows] = await pool.query('SELECT * FROM event_bookings WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Event booking updated successfully',
      data: { eventBooking: rows[0] }
    });
  } catch (error) {
    console.error('Update event booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event booking'
    });
  }
};

// Get event types
const getEventTypes = async (req, res) => {
  try {
    const eventTypes = [
      { id: 'conference', name: 'Conference', description: 'Professional business conferences and seminars' },
      { id: 'wedding', name: 'Wedding', description: 'Wedding ceremonies and receptions' },
      { id: 'meeting', name: 'Meeting', description: 'Business meetings and corporate events' },
      { id: 'party', name: 'Party', description: 'Birthday parties and celebrations' },
      { id: 'other', name: 'Other', description: 'Other events and gatherings' }
    ];

    res.json({
      success: true,
      data: { eventTypes }
    });
  } catch (error) {
    console.error('Get event types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event types'
    });
  }
};

module.exports = {
  createEventBooking,
  getMyEventBookings,
  getAllEventBookings,
  updateEventBookingStatus,
  getEventTypes
};
