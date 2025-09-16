import React, { useState } from 'react';
import { MOVES } from '../utils/gameLogic';
import './MoveSelection.css';

function MoveSelection({ onMovesSelected, disabled, round }) {
  const [selectedMoves, setSelectedMoves] = useState([]);
  const [currentSelection, setCurrentSelection] = useState(0);

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
    if (disabled || selectedMoves.length >= 3) return;

    const newMoves = [...selectedMoves, move];
    setSelectedMoves(newMoves);
    setCurrentSelection(newMoves.length);

    if (newMoves.length === 3) {
      setTimeout(() => {
        onMovesSelected(newMoves);
      }, 500);
    }
  };

  const resetSelection = () => {
    if (disabled) return;
    setSelectedMoves([]);
    setCurrentSelection(0);
  };

  return (
    <div className="move-selection">
      <div className="selection-header">
        <h3>Select Your Moves for Round {round}</h3>
        <p>Choose 3 moves in order (Clash {selectedMoves.length + 1}/3)</p>
      </div>

      <div className="selected-moves">
        {[0, 1, 2].map((index) => (
          <div 
            key={index} 
            className={`move-slot ${selectedMoves[index] ? 'filled' : ''} ${index === currentSelection ? 'active' : ''}`}
          >
            {selectedMoves[index] ? (
              <>
                <div className="move-icon">{moveIcons[selectedMoves[index]]}</div>
                <div className="move-name">{moveNames[selectedMoves[index]]}</div>
              </>
            ) : (
              <div className="move-placeholder">?</div>
            )}
          </div>
        ))}
      </div>

      {selectedMoves.length < 3 && !disabled && (
        <div className="move-buttons">
          <button 
            className="move-button attack"
            onClick={() => handleMoveSelect(MOVES.ATTACK)}
          >
            <div className="move-icon">{moveIcons[MOVES.ATTACK]}</div>
            <div className="move-info">
              <span className="move-name">{moveNames[MOVES.ATTACK]}</span>
              <span className="move-desc">Beats Special</span>
            </div>
          </button>

          <button 
            className="move-button defense"
            onClick={() => handleMoveSelect(MOVES.DEFENSE)}
          >
            <div className="move-icon">{moveIcons[MOVES.DEFENSE]}</div>
            <div className="move-info">
              <span className="move-name">{moveNames[MOVES.DEFENSE]}</span>
              <span className="move-desc">Beats Attack</span>
            </div>
          </button>

          <button 
            className="move-button special"
            onClick={() => handleMoveSelect(MOVES.SPECIAL)}
          >
            <div className="move-icon">{moveIcons[MOVES.SPECIAL]}</div>
            <div className="move-info">
              <span className="move-name">{moveNames[MOVES.SPECIAL]}</span>
              <span className="move-desc">Beats Defense</span>
            </div>
          </button>
        </div>
      )}

      {selectedMoves.length > 0 && selectedMoves.length < 3 && !disabled && (
        <button className="reset-button" onClick={resetSelection}>
          Reset Selection
        </button>
      )}

      {disabled && (
        <div className="waiting-message">
          <div className="spinner"></div>
          <p>Waiting for opponent...</p>
        </div>
      )}
    </div>
  );
}

export default MoveSelection;