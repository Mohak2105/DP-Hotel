const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

// Submit contact message
const submitMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message } = req.body;
    const id = uuidv4();

    await pool.query(
      `INSERT INTO contact_messages (id, name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, email, phone || null, subject || null, message]
    );

    res.status(201).json({
      success: true,
      message: 'Message submitted successfully. We will get back to you soon!'
    });
  } catch (error) {
    console.error('Submit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit message'
    });
  }
};

// Get all messages (admin only)
const getAllMessages = async (req, res) => {
  try {
    const { isRead } = req.query;
    
    let query = 'SELECT * FROM contact_messages WHERE 1=1';
    const params = [];

    if (isRead !== undefined) {
      query += ' AND is_read = ?';
      params.push(isRead === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: { messages: rows }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Mark message as read (admin only)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE contact_messages SET is_read = TRUE WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
};

// Delete message (admin only)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

module.exports = {
  submitMessage,
  getAllMessages,
  markAsRead,
  deleteMessage
};
