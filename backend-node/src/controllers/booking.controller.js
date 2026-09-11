const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { validationResult } = require('express-validator');

// Create booking
const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { roomId, checkInDate, checkOutDate, guests, specialRequests, gstNumber, companyName } = req.body;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check room availability
    const isAvailable = await Booking.isRoomAvailable(roomId, checkInDate, checkOutDate);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available for selected dates'
      });
    }

    // Calculate total nights and amount
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = totalNights * parseFloat(room.price_per_night);

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      roomId,
      checkInDate,
      checkOutDate,
      guests: guests || 1,
      totalNights,
      totalAmount,
      specialRequests,
      gstNumber,
      companyName
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
};

// Get user's bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findByUser(req.user.id);

    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (['checked_in', 'checked_out', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`
      });
    }

    const cancelledBooking = await Booking.cancel(req.params.id);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking: cancelledBooking }
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};

// Get all bookings (admin only)
const getAllBookings = async (req, res) => {
  try {
    const { status, fromDate, toDate } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;

    const bookings = await Booking.findAll(filters);

    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Update booking status (admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const updatedBooking = await Booking.updateStatus(req.params.id, status);

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};

// Get booking statistics (admin only)
const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.getStats();

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics'
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  getBookingStats
};
