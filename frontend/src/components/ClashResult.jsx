import React, { useState, useEffect } from 'react';
import { MOVES } from '../utils/gameLogic';
import './ClashResult.css';

function ClashResult({ results, playerMoves, opponentMoves }) {
  const [currentClash, setCurrentClash] = useState(0);
  const [showResults, setShowResults] = useState(false);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResults(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showResults && currentClash < results.length - 1) {
      const timer = setTimeout(() => {
        setCurrentClash(prev => prev + 1);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showResults, currentClash, results.length]);

  if (!showResults) {
    return (
      <div className="clash-result">
        <div className="clash-reveal">
          <h3>Revealing Moves...</h3>
          <div className="reveal-animation"></div>
        </div>
      </div>
    );
  }

  const currentResult = results[currentClash];
  const playerMove = playerMoves[currentClash];
  const opponentMove = opponentMoves[currentClash];

  return (
    <div className="clash-result">
      <div className="clash-header">
        <h3>Clash {currentClash + 1} Result</h3>
      </div>

      <div className="moves-reveal">
        <div className="player-move">
          <div className="move-display">
            <div className="move-icon">{moveIcons[playerMove]}</div>
            <div className="move-name">{moveNames[playerMove]}</div>
          </div>
          <div className="player-label">You</div>
        </div>

        <div className="vs-clash">VS</div>

        <div className="opponent-move">
          <div className="move-display">
            <div className="move-icon">{moveIcons[opponentMove]}</div>
            <div className="move-name">{moveNames[opponentMove]}</div>
          </div>
          <div className="player-label">Opponent</div>
        </div>
      </div>

      <div className={`clash-outcome ${currentResult.winner || 'tie'}`}>
        {currentResult.tie ? (
          <div className="result-message tie">
            <h4>TIE!</h4>
            <p>Lower HP player takes damage</p>
          </div>
        ) : (
          <div className={`result-message ${currentResult.winner}`}>
            <h4>{currentResult.winner === 'player1' ? 'YOU WIN!' : 'OPPONENT WINS!'}</h4>
            <p className="damage">-{currentResult.damage} HP</p>
          </div>
        )}
      </div>

      <div className="clash-progress">
        {results.map((_, index) => (
          <div 
            key={index} 
            className={`progress-dot ${index <= currentClash ? 'completed' : ''}`}
          />
        ))}
      </div>

      {currentClash === results.length - 1 && (
        <div className="round-summary">
          <h4>Round Complete!</h4>
          <p>Preparing next round...</p>
        </div>
      )}
    </div>
  );
}

export default ClashResult;
