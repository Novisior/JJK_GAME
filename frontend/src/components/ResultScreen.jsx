import React from 'react';
import { useGame } from '../context/GameContext';
import './ResultScreen.css';

function ResultScreen({ onRestart }) {
  const { state, dispatch } = useGame();
  const isVictory = state.gameState.winner === 'player1';

  const handleRestart = () => {
    dispatch({ type: 'RESET_GAME' });
    onRestart();
  };

  return (
    <div className="result-screen">
      <div className="result-content">
        <div className={`result-header ${isVictory ? 'victory' : 'defeat'}`}>
          <h1>{isVictory ? 'VICTORY!' : 'DEFEAT!'}</h1>
          <div className="result-icon">
            {isVictory ? '👑' : '💀'}
          </div>
        </div>

        <div className="final-stats">
          <div className="stat-row">
            <span>Final HP:</span>
            <span>{Math.max(0, state.gameState.players.player1.hp)} / 1000</span>
          </div>
          <div className="stat-row">
            <span>Final CE:</span>
            <span>{state.gameState.players.player1.ce} / 120</span>
          </div>
          <div className="stat-row">
            <span>Rounds Fought:</span>
            <span>{state.gameState.round - 1}</span>
          </div>
        </div>

        <div className="result-actions">
          <button className="play-again-btn" onClick={handleRestart}>
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultScreen;
