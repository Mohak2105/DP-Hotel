const express = require('express');
const { body } = require('express-validator');
const { 
  getPaymentMethods,
  initiatePayment,
  processPayment,
  getPaymentById,
  getMyPayments,
  getPaymentByBooking,
  refundPayment,
  getAllPayments,
  getPaymentStats
} = require('../controllers/payment.controller');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public route - get available payment methods
router.get('/methods', getPaymentMethods);

// User routes (protected)
router.post('/initiate', authenticate, [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required')
], initiatePayment);

router.post('/process/:paymentId', authenticate, processPayment);
router.get('/my-payments', authenticate, getMyPayments);
router.get('/booking/:bookingId', authenticate, getPaymentByBooking);
router.get('/:id', authenticate, getPaymentById);

// Admin routes
router.get('/', authenticate, adminOnly, getAllPayments);
router.post('/:id/refund', authenticate, adminOnly, refundPayment);
router.get('/admin/stats', authenticate, adminOnly, getPaymentStats);

module.exports = router;
