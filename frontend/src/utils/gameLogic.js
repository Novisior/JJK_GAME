export const MOVES = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  SPECIAL: 'special'
};

export const GAME_CONSTANTS = {
  STARTING_HP: 1000,
  STARTING_CE: 0,
  MAX_CE: 120,
  DOMAIN_THRESHOLD: 100,
  FINISHER_HP_THRESHOLD: 200,
  CLASH_DAMAGE: 100,
  DOMAIN_MULTIPLIER: 2,
  FINISHER_DAMAGE: 200,
  FINISHER_HEAL: 100,
  CLASHES_PER_ROUND: 3
};

export const CE_GAINS = {
  WIN: 20,
  LOSE: 10,
  TIE: 15
};

export function canTriggerFinisher(hp) {
  return hp <= GAME_CONSTANTS.FINISHER_HP_THRESHOLD;
}

export function shouldActivateDomain(ce) {
  return ce >= GAME_CONSTANTS.DOMAIN_THRESHOLD;
}

export function generateRandomMove() {
  const moves = Object.values(MOVES);
  return moves[Math.floor(Math.random() * moves.length)];
}

export function generateAIMoves() {
  return [
    generateRandomMove(),
    generateRandomMove(),
    generateRandomMove()
  ];
}