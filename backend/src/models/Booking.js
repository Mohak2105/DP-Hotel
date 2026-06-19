const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Booking {
  // Create booking
  static async create(bookingData) {
    const id = uuidv4();
    const { userId, roomId, checkInDate, checkOutDate, guests, totalNights, totalAmount, specialRequests, gstNumber, companyName } = bookingData;

    await pool.query(
      `INSERT INTO bookings (id, user_id, room_id, check_in_date, check_out_date, guests, total_nights, total_amount, special_requests, gst_number, company_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, roomId, checkInDate, checkOutDate, guests, totalNights, totalAmount, specialRequests || null, gstNumber || null, companyName || null]
    );

    return this.findById(id);
  }

  // Find booking by ID
  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT b.*, 
             u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name, u.phone as user_phone,
             r.room_number, r.room_type, r.name as room_name, r.price_per_night
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `, [id]);
    return rows[0] || null;
  }

  // Find bookings by user
  static async findByUser(userId) {
    const [rows] = await pool.query(`
      SELECT b.*, r.room_number, r.room_type, r.name as room_name, r.price_per_night
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);
    return rows;
  }

  // Get all bookings (admin)
  static async findAll(filters = {}) {
    let query = `
      SELECT b.*, 
             u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name,
             r.room_number, r.room_type, r.name as room_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND b.status = ?';
      params.push(filters.status);
    }

    if (filters.fromDate) {
      query += ' AND b.check_in_date >= ?';
      params.push(filters.fromDate);
    }

    if (filters.toDate) {
      query += ' AND b.check_out_date <= ?';
      params.push(filters.toDate);
    }

    query += ' ORDER BY b.created_at DESC';

    const [rows] = await pool.query(query, params);
    return rows;
  }

  // Update booking status
  static async updateStatus(id, status) {
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  }

  // Cancel booking
  static async cancel(id) {
    return this.updateStatus(id, 'cancelled');
  }

  // Check if room is available for dates
  static async isRoomAvailable(roomId, checkIn, checkOut, excludeBookingId = null) {
    let query = `
      SELECT COUNT(*) as count FROM bookings 
      WHERE room_id = ? 
      AND status NOT IN ('cancelled', 'checked_out')
      AND (
        (check_in_date <= ? AND check_out_date > ?)
        OR (check_in_date < ? AND check_out_date >= ?)
        OR (check_in_date >= ? AND check_out_date <= ?)
      )
    `;
    const params = [roomId, checkOut, checkIn, checkOut, checkIn, checkIn, checkOut];

    if (excludeBookingId) {
      query += ' AND id != ?';
      params.push(excludeBookingId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count === 0;
  }

  // Get booking statistics (admin)
  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
        SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as checked_in_bookings,
        SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END) as checked_out_bookings,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(total_amount) as total_revenue
      FROM bookings
    `);
    return rows[0];
  }
}

module.exports = Booking;
