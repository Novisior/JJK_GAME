import React, { useState, useEffect } from 'react';
import './DomainBanner.css';

function DomainBanner({ player1Domain, player2Domain, doubleDomain }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="domain-banner-overlay">
      <div className="domain-banner">
        {doubleDomain ? (
          <div className="double-domain">
            <h1 className="domain-title">DOUBLE DOMAIN CLASH!</h1>
            <p className="domain-subtitle">Both domains cancel out - normal damage</p>
            <div className="domain-effects">⚡ ⚔️ ⚡</div>
          </div>
        ) : (
          <div className="single-domain">
            <h1 className="domain-title">DOMAIN EXPANSION!</h1>
            <p className="domain-subtitle">
              {player1Domain ? 'Your' : "Opponent's"} domain is active
            </p>
            <p className="domain-effect">2x Damage Multiplier!</p>
            <div className="domain-effects">🔥 ⚡ 🔥</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DomainBanner;
