import React, { useEffect, useRef } from 'react';
import './BattleLog.css';

function BattleLog({ logs }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="battle-log">
      <div className="battle-log-header">
        <h4>Battle Log</h4>
      </div>
      <div className="battle-log-content" ref={logRef}>
        {logs.length === 0 ? (
          <div className="log-empty">Battle begins...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="log-entry">
              <span className="log-time">R{Math.floor(index / 3) + 1}</span>
              <span className="log-message">{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BattleLog;