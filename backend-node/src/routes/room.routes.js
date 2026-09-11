const express = require('express');
const { 
  getAllRooms, 
  getRoomById, 
  getAvailableRooms, 
  getRoomTypes,
  createRoom,
  updateRoom
} = require('../controllers/room.controller');
const { authenticate, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllRooms);
router.get('/types', getRoomTypes);
router.get('/available', getAvailableRooms);
router.get('/:id', getRoomById);

// Admin routes
router.post('/', authenticate, adminOnly, createRoom);
router.put('/:id', authenticate, adminOnly, updateRoom);

module.exports = router;
