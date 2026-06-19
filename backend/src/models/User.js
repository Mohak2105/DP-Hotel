const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    const { email, password, firstName, lastName, phone, address } = userData;
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, phone, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, email, hashedPassword, firstName, lastName, phone || null, address || null]
    );

    return { id, email, firstName, lastName, phone, address };
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, address, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Update user
  static async update(id, userData) {
    const { firstName, lastName, phone, address } = userData;
    
    await pool.query(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ? WHERE id = ?`,
      [firstName, lastName, phone, address, id]
    );

    return this.findById(id);
  }

  // Verify password
  static async verifyPassword(inputPassword, hashedPassword) {
    return bcrypt.compare(inputPassword, hashedPassword);
  }

  // Get all users (admin only)
  static async findAll() {
    const [rows] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }
}

module.exports = User;
