import React, { useState } from 'react';
import { MOVES } from '../utils/gameLogic';
import { resolveFinisher } from '../utils/clashResolver';
import './FinisherModal.css';

function FinisherModal({ gameMode, onFinisherComplete }) {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  const moveIcons = {
    [MOVES.ATTACK]: '⚔️',
    [MOVES.DEFENSE]: '🛡️',
    [MOVES.SPECIAL]: '✨'
  };

  const moveNames = {
    [MOVES.ATTACK]: 'Attack',
    [MOVES.DEFENSE]: 'Defense',
    [MOVES.SPECIAL]: 'Special'
  };

  const handleMoveSelect = (move) => {
    if (playerChoice) return;
    
    setPlayerChoice(move);

    // Generate opponent move (AI or wait for real opponent)
    if (gameMode === 'vsAI') {
      const moves = Object.values(MOVES);
      const aiMove = moves[Math.floor(Math.random() * moves.length)];
      setOpponentChoice(aiMove);
      
      setTimeout(() => {
        resolveFinisherClash(move, aiMove);
      }, 1500);
    }
  };

  const resolveFinisherClash = (finisherMove, defenderMove) => {
    // Determine if finisher wins based on clash rules
    let finisherWins = false;
    
    if (finisherMove === defenderMove) {
      finisherWins = true; // Tie goes to finisher (Black Flash lands)
    } else {
      // Normal clash resolution
      const winConditions = {
        [MOVES.ATTACK]: MOVES.SPECIAL,
        [MOVES.SPECIAL]: MOVES.DEFENSE,
        [MOVES.DEFENSE]: MOVES.ATTACK
      };
      
      finisherWins = winConditions[finisherMove] === defenderMove;
    }

    const finisherResult = resolveFinisher(finisherMove, defenderMove, finisherWins);
    setResult(finisherResult);
    setShowResult(true);

    setTimeout(() => {
      onFinisherComplete(finisherResult);
    }, 4000);
  };

  if (showResult) {
    return (
      <div className="finisher-modal-overlay">
        <div className="finisher-modal">
          <div className="finisher-result">
            {result.type === 'blackFlash' ? (
              <div className="black-flash-success">
                <h1>BLACK FLASH!</h1>
                <div className="flash-animation">⚡</div>
                <p>Game Over - Instant Victory!</p>
              </div>
            ) : (
              <div className="black-flash-reversed">
                <h1>BLACK FLASH REVERSED!</h1>
                <div className="reverse-animation">🔄</div>
                <p>Opponent takes 200 damage!</p>
                <p>You heal 100 HP!</p>
                <p>Fight continues...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="finisher-modal-overlay">
      <div className="finisher-modal">
        <div className="finisher-header">
          <h2>BLACK FLASH FINISHER!</h2>
          <p>Choose your move carefully...</p>
          <div className="finisher-rules">
            <p>• Win or Tie = Black Flash lands (Instant Victory)</p>
            <p>• Lose = Black Flash reversed (200 damage + 100 heal)</p>
          </div>
        </div>

        <div className="finisher-moves">
          <div className="moves-display">
            <div className="player-finisher-move">
              <h4>Your Move</h4>
              {playerChoice ? (
                <div className="selected-move">
                  <div className="move-icon">{moveIcons[playerChoice]}</div>
                  <div className="move-name">{moveNames[playerChoice]}</div>
                </div>
              ) : (
                <div className="move-placeholder">Select Move</div>
              )}
            </div>

            <div className="vs-finisher">⚡ VS ⚡</div>

            <div className="opponent-finisher-move">
              <h4>Opponent Move</h4>
              {opponentChoice ? (
                <div className="selected-move">
                  <div className="move-icon">{moveIcons[opponentChoice]}</div>
                  <div className="move-name">{moveNames[opponentChoice]}</div>
                </div>
              ) : (
                <div className="move-placeholder">???</div>
              )}
            </div>
          </div>

          {!playerChoice && (
            <div className="finisher-buttons">
              <button 
                className="finisher-move-button attack"
                onClick={() => handleMoveSelect(MOVES.ATTACK)}
              >
                <div className="move-icon">{moveIcons[MOVES.ATTACK]}</div>
                <span>{moveNames[MOVES.ATTACK]}</span>
              </button>

              <button 
                className="finisher-move-button defense"
                onClick={() => handleMoveSelect(MOVES.DEFENSE)}
              >
                <div className="move-icon">{moveIcons[MOVES.DEFENSE]}</div>
                <span>{moveNames[MOVES.DEFENSE]}</span>
              </button>

              <button 
                className="finisher-move-button special"
                onClick={() => handleMoveSelect(MOVES.SPECIAL)}
              >
                <div className="move-icon">{moveIcons[MOVES.SPECIAL]}</div>
                <span>{moveNames[MOVES.SPECIAL]}</span>
              </button>
            </div>
          )}

          {playerChoice && !showResult && (
            <div className="waiting-resolution">
              <div className="finisher-spinner"></div>
              <p>Black Flash in progress...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinisherModal;
