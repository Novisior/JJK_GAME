import React from 'react';
import './Menu.css';

function Menu({ onModeSelect }) {
  return (
    <div className="menu-container">
      <div className="menu-content">
        <h2>Select Game Mode</h2>
        <div className="menu-buttons">
          <button 
            className="menu-button vs-ai"
            onClick={() => onModeSelect('vsAI')}
          >
            <div className="button-icon">🤖</div>
            <div className="button-text">
              <h3>VS AI</h3>
              <p>Fight against computer</p>
            </div>
          </button>
          
          <button 
            className="menu-button vs-player"
            onClick={() => onModeSelect('vsPlayer')}
          >
            <div className="button-icon">⚔️</div>
            <div className="button-text">
              <h3>VS Player</h3>
              <p>Fight against another player</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;