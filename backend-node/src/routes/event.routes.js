const express = require('express');
const { body } = require('express-validator');
const { 
  createEventBooking,
  getMyEventBookings,
  getAllEventBookings,
  updateEventBookingStatus,
  getEventTypes
} = require('../controllers/event.controller');
const { authenticate, optionalAuth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/types', getEventTypes);

// Create event booking (optional auth - can be used by guests too)
router.post('/', optionalAuth, [
  body('eventType').notEmpty().withMessage('Event type is required'),
  body('eventName').trim().notEmpty().withMessage('Event name is required'),
  body('eventDate').isDate().withMessage('Valid event date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('guestsCount').isInt({ min: 1 }).withMessage('Number of guests is required')
], createEventBooking);

// User routes (protected)
router.get('/my-events', authenticate, getMyEventBookings);

// Admin routes
router.get('/', authenticate, adminOnly, getAllEventBookings);
router.put('/:id/status', authenticate, adminOnly, updateEventBookingStatus);

module.exports = router;
