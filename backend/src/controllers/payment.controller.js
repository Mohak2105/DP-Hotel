const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

// Get available payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const methods = Payment.getAvailablePaymentMethods();

    res.json({
      success: true,
      data: { methods }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
};

// Initiate payment
const initiatePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { bookingId, paymentMethod, cardLastFour, cardBrand, upiId } = req.body;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if payment already exists for this booking
    const existingPayment = await Payment.findByBooking(bookingId);
    if (existingPayment && existingPayment.payment_status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this booking'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      userId: req.user.id,
      amount: booking.total_amount,
      paymentMethod,
      cardLastFour,
      cardBrand,
      upiId
    });

    res.status(201).json({
      success: true,
      message: 'Payment initiated',
      data: { 
        payment,
        // In production, this would include payment gateway redirect URL or SDK data
        paymentGateway: {
          method: paymentMethod,
          amount: booking.total_amount,
          orderId: payment.id
        }
      }
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment'
    });
  }
};

// Process payment (called after gateway callback or for simulated payments)
const processPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const paymentDetails = req.body; // Contains gateway response or card details

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Process the payment
    const processedPayment = await Payment.processPayment(paymentId, paymentDetails);

    // If payment successful, update booking status
    if (processedPayment.payment_status === 'completed') {
      await Booking.updateStatus(payment.booking_id, 'confirmed');
    }

    res.json({
      success: true,
      message: processedPayment.payment_status === 'completed' 
        ? 'Payment successful' 
        : 'Payment failed',
      data: { payment: processedPayment }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment or is admin
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
};

// Get user's payments
const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.findByUser(req.user.id);

    res.json({
      success: true,
      data: { payments }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
};

// Get payment by booking ID
const getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findByBooking(req.params.bookingId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this booking'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('Get payment by booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
};

// Refund payment (admin only)
const refundPayment = async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const refundedPayment = await Payment.refund(req.params.id, reason);

    // Update booking status
    await Booking.updateStatus(payment.booking_id, 'cancelled');

    res.json({
      success: true,
      message: 'Payment refunded successfully',
      data: { payment: refundedPayment }
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to refund payment'
    });
  }
};

// Get all payments (admin only)
const getAllPayments = async (req, res) => {
  try {
    const { status, method, fromDate, toDate } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (method) filters.method = method;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    const payments = await Payment.findAll(filters);

    res.json({
      success: true,
      data: { payments }
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
};

// Get payment statistics (admin only)
const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.getStats();

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
};

module.exports = {
  getPaymentMethods,
  initiatePayment,
  processPayment,
  getPaymentById,
  getMyPayments,
  getPaymentByBooking,
  refundPayment,
  getAllPayments,
  getPaymentStats
};
