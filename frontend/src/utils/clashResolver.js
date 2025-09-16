import { MOVES, GAME_CONSTANTS, CE_GAINS } from './gameLogic';

export function resolveClash(move1, move2, player1State, player2State) {
  let winner = null;
  let damage = GAME_CONSTANTS.CLASH_DAMAGE;

  // Determine clash winner based on rock-paper-scissors logic
  if (move1 === move2) {
    // Tie - player with lower HP loses
    if (player1State.hp < player2State.hp) {
      winner = 'player2';
    } else if (player2State.hp < player1State.hp) {
      winner = 'player1';
    } else {
      winner = 'tie'; // True tie
    }
  } else {
    // Attack > Special > Defense > Attack
    const winConditions = {
      [MOVES.ATTACK]: MOVES.SPECIAL,
      [MOVES.SPECIAL]: MOVES.DEFENSE,
      [MOVES.DEFENSE]: MOVES.ATTACK
    };

    if (winConditions[move1] === move2) {
      winner = 'player1';
    } else {
      winner = 'player2';
    }
  }

  // Apply domain multiplier if active
  if (winner === 'player1' && player1State.domainActive) {
    damage *= GAME_CONSTANTS.DOMAIN_MULTIPLIER;
  } else if (winner === 'player2' && player2State.domainActive) {
    damage *= GAME_CONSTANTS.DOMAIN_MULTIPLIER;
  }

  return {
    winner,
    loser: winner === 'player1' ? 'player2' : (winner === 'player2' ? 'player1' : null),
    damage: winner === 'tie' ? 0 : damage,
    moves: { player1: move1, player2: move2 },
    tie: winner === 'tie' || (move1 === move2 && player1State.hp === player2State.hp)
  };
}

export function updateCEFromClash(currentCE, result, playerKey) {
  let ceGain = 0;
  
  if (result.tie) {
    ceGain = CE_GAINS.TIE;
  } else if (result.winner === playerKey) {
    ceGain = CE_GAINS.WIN;
  } else {
    ceGain = CE_GAINS.LOSE;
  }

  return Math.min(currentCE + ceGain, GAME_CONSTANTS.MAX_CE);
}

export function resolveFinisher(finisherMove, defenderMove, finisherWins) {
  const damage = GAME_CONSTANTS.FINISHER_DAMAGE;
  const heal = GAME_CONSTANTS.FINISHER_HEAL;

  if (finisherWins) {
    // Black Flash lands - game ending
    return {
      type: 'blackFlash',
      gameEnd: true,
      damage: 999999, // Instant kill
      heal: 0
    };
  } else {
    // Black Flash reversed
    return {
      type: 'reversed',
      gameEnd: false,
      damage: damage,
      heal: heal
    };
  }
}
