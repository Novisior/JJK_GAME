const express = require('express');
const router = express.Router();
const aiLogic = require('../utils/aiLogic');
const { resolveClash } = require('../utils/gameState');

router.post('/ai-move', (req, res) => {
  const aiMove = aiLogic.generateRandomMove();
  res.json({ move: aiMove });
});

router.post('/resolve-clash', (req, res) => {
  const { playerMoves, aiMoves } = req.body;
  const results = resolveClash(playerMoves, aiMoves);
  res.json(results);
});

module.exports = router;
