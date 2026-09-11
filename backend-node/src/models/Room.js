const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Helper function to safely parse JSON
const safeJsonParse = (value, defaultValue = []) => {
  if (!value) return defaultValue;
  try {
    // If it's already an object/array, return it
    if (typeof value === 'object') return value;
    return JSON.parse(value);
  } catch (e) {
    // If parsing fails, return as-is or default
    return defaultValue;
  }
};

class Room {
  // Get all rooms
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM rooms WHERE 1=1';
    const params = [];

    if (filters.roomType) {
      query += ' AND room_type = ?';
      params.push(filters.roomType);
    }

    if (filters.isAvailable !== undefined) {
      query += ' AND is_available = ?';
      params.push(filters.isAvailable);
    }

    if (filters.maxPrice) {
      query += ' AND price_per_night <= ?';
      params.push(filters.maxPrice);
    }

    if (filters.capacity) {
      query += ' AND capacity >= ?';
      params.push(filters.capacity);
    }

    query += ' ORDER BY price_per_night ASC';

    const [rows] = await pool.query(query, params);
    return rows.map(room => ({
      ...room,
      amenities: safeJsonParse(room.amenities, []),
      images: safeJsonParse(room.images, [])
    }));
  }

  // Get room by ID
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    if (rows[0]) {
      return {
        ...rows[0],
        amenities: safeJsonParse(rows[0].amenities, []),
        images: safeJsonParse(rows[0].images, [])
      };
    }
    return null;
  }

  // Get available rooms for date range
  static async findAvailable(checkIn, checkOut, roomType = null) {
    let query = `
      SELECT r.* FROM rooms r
      WHERE r.is_available = TRUE
      AND r.id NOT IN (
        SELECT b.room_id FROM bookings b
        WHERE b.status NOT IN ('cancelled', 'checked_out')
        AND (
          (b.check_in_date <= ? AND b.check_out_date > ?)
          OR (b.check_in_date < ? AND b.check_out_date >= ?)
          OR (b.check_in_date >= ? AND b.check_out_date <= ?)
        )
      )
    `;
    const params = [checkOut, checkIn, checkOut, checkIn, checkIn, checkOut];

    if (roomType) {
      query += ' AND r.room_type = ?';
      params.push(roomType);
    }

    query += ' ORDER BY r.price_per_night ASC';

    const [rows] = await pool.query(query, params);
    return rows.map(room => ({
      ...room,
      amenities: safeJsonParse(room.amenities, []),
      images: safeJsonParse(room.images, [])
    }));
  }

  // Create room (admin)
  static async create(roomData) {
    const id = uuidv4();
    const { roomNumber, roomType, name, description, pricePerNight, capacity, amenities, images } = roomData;

    await pool.query(
      `INSERT INTO rooms (id, room_number, room_type, name, description, price_per_night, capacity, amenities, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, roomNumber, roomType, name, description, pricePerNight, capacity, 
       JSON.stringify(amenities || []), JSON.stringify(images || [])]
    );

    return this.findById(id);
  }

  // Update room (admin)
  static async update(id, roomData) {
    const { name, description, pricePerNight, capacity, amenities, images, isAvailable } = roomData;

    await pool.query(
      `UPDATE rooms SET name = ?, description = ?, price_per_night = ?, capacity = ?, 
       amenities = ?, images = ?, is_available = ? WHERE id = ?`,
      [name, description, pricePerNight, capacity, 
       JSON.stringify(amenities || []), JSON.stringify(images || []), isAvailable, id]
    );

    return this.findById(id);
  }

  // Get room types with pricing
  static async getRoomTypes() {
    const [rows] = await pool.query(`
      SELECT room_type, MIN(price_per_night) as min_price, MAX(price_per_night) as max_price, 
             COUNT(*) as total_rooms, SUM(CASE WHEN is_available = TRUE THEN 1 ELSE 0 END) as available_rooms
      FROM rooms GROUP BY room_type
    `);
    return rows;
  }
}

module.exports = Room;
