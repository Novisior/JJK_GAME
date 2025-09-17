const express = require('express');
const router = express.Router();
const roomManager = require('./roomManager');

router.post('/create', (req, res) => {
  try {
    const { playerName } = req.body;
    if (!playerName) {
      return res.status(400).json({ error: 'Player name is required' });
    }
    const room = roomManager.createRoom(playerName);
    res.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
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
