const Room = require('../models/Room');

// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    const { type, available, maxPrice, capacity } = req.query;
    
    const filters = {};
    if (type) filters.roomType = type;
    if (available !== undefined) filters.isAvailable = available === 'true';
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (capacity) filters.capacity = parseInt(capacity);

    const rooms = await Room.findAll(filters);

    res.json({
      success: true,
      data: { rooms }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms'
    });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: { room }
    });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room'
    });
  }
};

// Get available rooms for date range
const getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, type } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required'
      });
    }

    const rooms = await Room.findAvailable(checkIn, checkOut, type);

    res.json({
      success: true,
      data: { rooms }
    });
  } catch (error) {
    console.error('Get available rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms'
    });
  }
};

// Get room types with pricing
const getRoomTypes = async (req, res) => {
  try {
    const roomTypes = await Room.getRoomTypes();

    res.json({
      success: true,
      data: { roomTypes }
    });
  } catch (error) {
    console.error('Get room types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room types'
    });
  }
};

// Create room (admin only)
const createRoom = async (req, res) => {
  try {
    const roomData = req.body;
    const room = await Room.create(roomData);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room'
    });
  }
};

// Update room (admin only)
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const updatedRoom = await Room.update(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: { room: updatedRoom }
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room'
    });
  }
};

module.exports = {
  getAllRooms,
  getRoomById,
  getAvailableRooms,
  getRoomTypes,
  createRoom,
  updateRoom
};
