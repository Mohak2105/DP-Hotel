const express = require('express');
const { body } = require('express-validator');
const { 
  submitMessage, 
  getAllMessages, 
  markAsRead, 
  deleteMessage 
} = require('../controllers/contact.controller');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public route - submit contact message
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
], submitMessage);

// Admin routes
router.get('/', authenticate, adminOnly, getAllMessages);
router.put('/:id/read', authenticate, adminOnly, markAsRead);
router.delete('/:id', authenticate, adminOnly, deleteMessage);

module.exports = router;
