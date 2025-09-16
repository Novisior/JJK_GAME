function generateRandomMove() {
  const moves = ['attack', 'defense', 'special'];
  return moves[Math.floor(Math.random() * moves.length)];
}

function generateAIMoves() {
  return [
    generateRandomMove(),
    generateRandomMove(),
    generateRandomMove()
  ];
}

module.exports = {
  generateRandomMove,
  generateAIMoves
};
