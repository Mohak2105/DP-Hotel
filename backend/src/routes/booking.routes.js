const express = require('express');
const { body } = require('express-validator');
const { 
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getBookingStats
} = require('../controllers/booking.controller');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// User routes (protected)
router.post('/', authenticate, [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('checkInDate').isDate().withMessage('Valid check-in date is required'),
  body('checkOutDate').isDate().withMessage('Valid check-out date is required'),
  body('guests').optional().isInt({ min: 1 }).withMessage('Guests must be at least 1')
], createBooking);

router.get('/my-bookings', authenticate, getMyBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/:id/cancel', authenticate, cancelBooking);

// Admin routes
router.get('/', authenticate, adminOnly, getAllBookings);
router.put('/:id/status', authenticate, adminOnly, updateBookingStatus);
router.get('/admin/stats', authenticate, adminOnly, getBookingStats);

module.exports = router;
