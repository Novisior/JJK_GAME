import React from 'react';
import './CEBar.css';

function CEBar({ ce, maxCE }) {
  const percentage = (ce / maxCE) * 100;
  const canActivateDomain = ce >= 100;

  return (
    <div className="ce-bar-container">
      <div className="ce-label">
        <span>CE</span>
        <span className="ce-values">{ce} / {maxCE}</span>
      </div>
      <div className="ce-bar">
        <div 
          className={`ce-fill ${canActivateDomain ? 'domain-ready' : ''}`}
          style={{ width: `${percentage}%` }}
        >
          {canActivateDomain && <div className="domain-pulse"></div>}
        </div>
        {canActivateDomain && (
          <div className="domain-threshold">
            <div className="threshold-line"></div>
          </div>
        )}
      </div>
      {canActivateDomain && (
        <div className="domain-ready-indicator">Domain Ready!</div>
      )}
    </div>
  );
}

export default CEBar;