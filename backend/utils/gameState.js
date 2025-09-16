function createInitialGameState() {
  return {
    players: {
      player1: { hp: 1000, ce: 0, name: '', domainActive: false, domainQueued: false },
      player2: { hp: 1000, ce: 0, name: '', domainActive: false, domainQueued: false }
    },
    round: 1,
    clash: 1,
    phase: 'moveSelection',
    battleLog: [],
    pendingMoves: {},
    finisherActive: false,
    doubleDomain: false
  };
}

function resolveClash(moves1, moves2, gameState) {
  const results = {
    clashes: [],
    newState: { ...gameState },
    winner: null
  };

  // Check for domain activation
  const player1Domain = gameState.players.player1.ce >= 100;
  const player2Domain = gameState.players.player2.ce >= 100;
  
  if (player1Domain && player2Domain) {
    results.newState.doubleDomain = true;
    results.newState.players.player1.domainActive = false;
    results.newState.players.player2.domainActive = false;
  } else if (player1Domain) {
    results.newState.players.player1.domainActive = true;
    results.newState.players.player1.ce = 0; // Reset CE after domain use
  } else if (player2Domain) {
    results.newState.players.player2.domainActive = true;
    results.newState.players.player2.ce = 0; // Reset CE after domain use
  }

  // Resolve 3 clashes
  for (let i = 0; i < 3; i++) {
    const clash = resolveIndividualClash(
      moves1[i], 
      moves2[i], 
      results.newState.players.player1, 
      results.newState.players.player2,
      results.newState.doubleDomain
    );
    
    results.clashes.push(clash);
    
    // Apply damage
    if (clash.winner === 'player1') {
      results.newState.players.player2.hp -= clash.damage;
    } else if (clash.winner === 'player2') {
      results.newState.players.player1.hp -= clash.damage;
    }
    
    // Update CE
    results.newState.players.player1.ce = Math.min(
      results.newState.players.player1.ce + getCEGain(clash, 'player1'),
      120
    );
    results.newState.players.player2.ce = Math.min(
      results.newState.players.player2.ce + getCEGain(clash, 'player2'),
      120
    );
    
    // Add to battle log
    const logEntry = `Clash ${i + 1}: ${moves1[i]} vs ${moves2[i]} - ${getClashResultText(clash)}`;
    results.newState.battleLog.push(logEntry);
  }

  // Check for winner
  if (results.newState.players.player1.hp <= 0) results.winner = 'player2';
  if (results.newState.players.player2.hp <= 0) results.winner = 'player1';
  
  // Reset domain states after round
  results.newState.players.player1.domainActive = false;
  results.newState.players.player2.domainActive = false;
  results.newState.doubleDomain = false;
  
  // Increment round
  results.newState.round += 1;

  return results;
}

function resolveIndividualClash(move1, move2, player1State, player2State, doubleDomain) {
  let winner = null;
  let damage = 100; // Base damage

  // Determine winner
  if (move1 === move2) {
    // Tie - lower HP player loses
    if (player1State.hp < player2State.hp) {
      winner = 'player2';
    } else if (player2State.hp < player1State.hp) {
      winner = 'player1';
    } else {
      winner = 'tie';
      damage = 0;
    }
  } else {
    // Attack > Special > Defense > Attack
    const winConditions = {
      'attack': 'special',
      'special': 'defense', 
      'defense': 'attack'
    };
    
    if (winConditions[move1] === move2) {
      winner = 'player1';
    } else {
      winner = 'player2';
    }
  }

  // Apply domain multiplier (2x damage) if not double domain
  if (!doubleDomain && winner !== 'tie') {
    if (winner === 'player1' && player1State.domainActive) {
      damage *= 2;
    } else if (winner === 'player2' && player2State.domainActive) {
      damage *= 2;
    }
  }

  return {
    winner,
    damage,
    moves: { player1: move1, player2: move2 },
    tie: winner === 'tie'
  };
}

function getCEGain(clashResult, playerKey) {
  if (clashResult.tie) {
    return 15;
  } else if (clashResult.winner === playerKey) {
    return 20;
  } else {
    return 10;
  }
}

function getClashResultText(clash) {
  if (clash.tie) {
    return 'Tie!';
  } else if (clash.winner === 'player1') {
    return 'Player 1 wins!';
  } else {
    return 'Player 2 wins!';
  }
}

function resolveFinisher(finisherMove, defenderMove) {
  let finisherWins = false;
  
  if (finisherMove === defenderMove) {
    finisherWins = true; // Tie goes to finisher
  } else {
    const winConditions = {
      'attack': 'special',
      'special': 'defense',
      'defense': 'attack'
    };
    
    finisherWins = winConditions[finisherMove] === defenderMove;
  }
  
  if (finisherWins) {
    return {
      type: 'blackFlash',
      gameEnd: true,
      damage: 9999,
      heal: 0
    };
  } else {
    return {
      type: 'reversed',
      gameEnd: false,
      damage: 200,
      heal: 100
    };
  }
}

module.exports = {
  createInitialGameState,
  resolveClash,
  resolveIndividualClash,
  resolveFinisher
};
