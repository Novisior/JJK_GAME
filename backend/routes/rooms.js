const express = require('express');
const router = express.Router();
const roomManager = require('../utils/roomManager');

router.post('/create', (req, res) => {
  const { playerName } = req.body;
  const room = roomManager.createRoom(playerName);
  res.json(room);
});

router.get('/:roomCode', (req, res) => {
  const room = roomManager.getRoom(req.params.roomCode);
  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ error: 'Room not found' });
  }
});

module.exports = router;
