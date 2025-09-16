import React from 'react';
import './HPBar.css';

function HPBar({ hp, maxHP, playerName }) {
  const percentage = Math.max(0, (hp / maxHP) * 100);
  const isLow = percentage <= 20;
  const isCritical = percentage <= 10;

  return (
    <div className="hp-bar-container">
      <div className="hp-label">
        <span>HP</span>
        <span className="hp-values">{Math.max(0, hp)} / {maxHP}</span>
      </div>
      <div className="hp-bar">
        <div 
          className={`hp-fill ${isLow ? 'low' : ''} ${isCritical ? 'critical' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          {isCritical && <div className="critical-pulse"></div>}
        </div>
      </div>
      {isLow && !isCritical && <div className="hp-warning">Low HP!</div>}
      {isCritical && <div className="hp-critical">Critical!</div>}
    </div>
  );
}

export default HPBar;