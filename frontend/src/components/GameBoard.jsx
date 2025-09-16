import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useWebSocket } from '../hooks/useWebSocket';
import HPBar from './HPBar';
import CEBar from './CEBar';
import MoveSelection from './MoveSelection';
import ClashResult from './ClashResult';
import DomainBanner from './DomainBanner';
import FinisherModal from './FinisherModal';
import BattleLog from './BattleLog';
import { gameAPI } from '../utils/api';
import { resolveClash, updateCEFromClash } from '../utils/clashResolver';
import { shouldActivateDomain, canTriggerFinisher, generateAIMoves } from '../utils/gameLogic';
import './GameBoard.css';

function GameBoard({ gameMode, onGameEnd }) {
  const { state, dispatch } = useGame();
  const { submitMoves, startFinisher } = useWebSocket();
  const [playerMoves, setPlayerMoves] = useState([]);
  const [aiMoves, setAIMoves] = useState([]);
  const [currentClash, setCurrentClash] = useState(0);
  const [showFinisherOption, setShowFinisherOption] = useState(false);
  const [roundResults, setRoundResults] = useState([]);

  const gameState = state.gameState;
  const isPlayer1 = true; // In real app, determine based on room position

  useEffect(() => {
    // Check for domain activation at start of each round
    if (gameState.phase === 'moveSelection' && gameState.clash === 1) {
      const player1Domain = shouldActivateDomain(gameState.players.player1.ce);
      const player2Domain = shouldActivateDomain(gameState.players.player2.ce);
      
      if (player1Domain && player2Domain) {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: { doubleDomain: true }});
      } else if (player1Domain) {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: { 
          players: { 
            ...gameState.players,
            player1: { ...gameState.players.player1, domainActive: true }
          }
        }});
      } else if (player2Domain) {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: { 
          players: { 
            ...gameState.players,
            player2: { ...gameState.players.player2, domainActive: true }
          }
        }});
      }
    }
  }, [gameState.round, gameState.clash, dispatch]);

  useEffect(() => {
    // Check for finisher opportunity
    const opponentHP = isPlayer1 ? gameState.players.player2.hp : gameState.players.player1.hp;
    if (canTriggerFinisher(opponentHP) && gameState.phase === 'moveSelection') {
      setShowFinisherOption(true);
    }
  }, [gameState.players, gameState.phase, isPlayer1]);

  const handleMovesSelected = async (moves) => {
    setPlayerMoves(moves);
    dispatch({ type: 'LOCK_MOVES' });

    if (gameMode === 'vsAI') {
      // Generate AI moves and resolve immediately
      const aiMovesList = generateAIMoves();
      setAIMoves(aiMovesList);
      await resolveRound(moves, aiMovesList);
    } else {
      // Submit to server for multiplayer
      submitMoves(state.roomCode, moves);
    }
  };

  const resolveRound = async (playerMovesList, aiMovesList) => {
    const results = [];
    let newGameState = { ...gameState };

    // Resolve all 3 clashes
    for (let i = 0; i < 3; i++) {
      const clashResult = resolveClash(
        playerMovesList[i],
        aiMovesList[i],
        newGameState.players.player1,
        newGameState.players.player2
      );

      results.push(clashResult);

      // Apply damage
      if (clashResult.winner === 'player1') {
        newGameState.players.player2.hp -= clashResult.damage;
      } else if (clashResult.winner === 'player2') {
        newGameState.players.player1.hp -= clashResult.damage;
      }

      // Update CE
      newGameState.players.player1.ce = updateCEFromClash(
        newGameState.players.player1.ce,
        clashResult,
        'player1'
      );
      newGameState.players.player2.ce = updateCEFromClash(
        newGameState.players.player2.ce,
        clashResult,
        'player2'
      );

      // Add to battle log
      const logEntry = `Clash ${i + 1}: ${clashResult.moves.player1} vs ${clashResult.moves.player2} - ${clashResult.winner === 'player1' ? 'You win!' : clashResult.winner === 'player2' ? 'AI wins!' : 'Tie!'}`;
      newGameState.battleLog.push(logEntry);
    }

    setRoundResults(results);
    
    // Check for game end
    if (newGameState.players.player1.hp <= 0 || newGameState.players.player2.hp <= 0) {
      newGameState.phase = 'gameEnd';
      newGameState.winner = newGameState.players.player1.hp <= 0 ? 'player2' : 'player1';
    } else {
      // Reset for next round
      newGameState.round += 1;
      newGameState.clash = 1;
      newGameState.phase = 'moveSelection';
      newGameState.players.player1.domainActive = false;
      newGameState.players.player2.domainActive = false;
      newGameState.doubleDomain = false;
    }

    dispatch({ type: 'UPDATE_GAME_STATE', payload: newGameState });
    dispatch({ type: 'UNLOCK_MOVES' });

    // Show clash results
    setTimeout(() => {
      dispatch({ type: 'UPDATE_GAME_STATE', payload: { phase: 'clashReveal' }});
    }, 500);

    // Auto-advance after showing results
    setTimeout(() => {
      if (newGameState.phase === 'gameEnd') {
        onGameEnd();
      } else {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: { phase: 'moveSelection' }});
      }
    }, 5000);
  };

  const handleFinisherStart = () => {
    setShowFinisherOption(false);
    dispatch({ type: 'UPDATE_GAME_STATE', payload: { phase: 'finisher', finisherActive: true }});
    
    if (gameMode === 'vsPlayer') {
      startFinisher(state.roomCode);
    }
  };

  const handleSkipFinisher = () => {
    setShowFinisherOption(false);
  };

  if (gameState.phase === 'gameEnd') {
    setTimeout(() => onGameEnd(), 1000);
    return (
      <div className="game-board">
        <div className="game-end-overlay">
          <h1>{gameState.winner === 'player1' ? 'Victory!' : 'Defeat!'}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="game-board">
      <div className="game-header">
        <div className="round-info">
          <h2>Round {gameState.round}</h2>
          <span className="clash-counter">Clash {gameState.clash}/3</span>
        </div>
      </div>

      <div className="players-section">
        <div className="player-stats">
          <h3>{gameState.players.player1.name || 'You'}</h3>
          <HPBar hp={gameState.players.player1.hp} maxHP={1000} />
          <CEBar ce={gameState.players.player1.ce} maxCE={120} />
          {gameState.players.player1.domainActive && (
            <div className="domain-indicator">🔥 Domain Active</div>
          )}
        </div>

        <div className="vs-divider">VS</div>

        <div className="player-stats">
          <h3>{gameMode === 'vsAI' ? 'AI' : (gameState.players.player2.name || 'Opponent')}</h3>
          <HPBar hp={gameState.players.player2.hp} maxHP={1000} />
          <CEBar ce={gameState.players.player2.ce} maxCE={120} />
          {gameState.players.player2.domainActive && (
            <div className="domain-indicator">🔥 Domain Active</div>
          )}
        </div>
      </div>

      {(gameState.players.player1.domainActive || gameState.players.player2.domainActive) && (
        <DomainBanner 
          player1Domain={gameState.players.player1.domainActive}
          player2Domain={gameState.players.player2.domainActive}
          doubleDomain={gameState.doubleDomain}
        />
      )}

      <div className="game-content">
        {gameState.phase === 'moveSelection' && (
          <MoveSelection 
            onMovesSelected={handleMovesSelected}
            disabled={state.movesLocked}
            round={gameState.round}
          />
        )}

        {gameState.phase === 'clashReveal' && (
          <ClashResult 
            results={roundResults}
            playerMoves={playerMoves}
            opponentMoves={aiMoves}
          />
        )}

        {showFinisherOption && (
          <div className="finisher-option">
            <div className="finisher-choice">
              <p>Your opponent has low HP! Initiate Black Flash?</p>
              <button onClick={handleFinisherStart} className="finisher-yes">
                Black Flash!
              </button>
              <button onClick={handleSkipFinisher} className="finisher-no">
                Continue Fighting
              </button>
            </div>
          </div>
        )}

        {gameState.finisherActive && (
          <FinisherModal 
            gameMode={gameMode}
            onFinisherComplete={(result) => {
              if (result.gameEnd) {
                dispatch({ type: 'UPDATE_GAME_STATE', payload: { 
                  phase: 'gameEnd', 
                  winner: result.type === 'blackFlash' ? 'player1' : 'player2' 
                }});
              } else {
                // Apply reverse damage and heal
                const newState = { ...gameState };
                newState.players.player2.hp -= result.damage;
                newState.players.player1.hp = Math.min(newState.players.player1.hp + result.heal, 1000);
                newState.finisherActive = false;
                newState.phase = 'moveSelection';
                dispatch({ type: 'UPDATE_GAME_STATE', payload: newState });
              }
            }}
          />
        )}
      </div>

      <BattleLog logs={gameState.battleLog} />
    </div>
  );
}

export default GameBoard;