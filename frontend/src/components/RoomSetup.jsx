// src/components/RoomSetup.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { roomAPI } from '../utils/api';
import './RoomSetup.css';

function RoomSetup({ gameMode, onGameStart, onBack }) {
  const { state, dispatch } = useGame();
  const { joinRoom, connected } = useWebSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);

  // Listen for room status updates
  useEffect(() => {
    if (waitingForPlayer && state.gameState.players.player1.name && state.gameState.players.player2.name) {
      setWaitingForPlayer(false);
      setGameStarting(true);
      
      // Show "Game Starting..." for 2 seconds before actually starting
      setTimeout(() => {
        dispatch({ type: 'START_FRESH_GAME', payload: {
          player1Name: state.gameState.players.player1.name,
          player2Name: state.gameState.players.player2.name
        }});
        setGameStarting(false);
        onGameStart();
      }, 2000);
    }
  }, [state.gameState.players, waitingForPlayer, dispatch, onGameStart]);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      if (gameMode === 'vsAI') {
        dispatch({ type: 'SET_PLAYER_NAME', payload: playerName });
        dispatch({ type: 'SET_GAME_MODE', payload: gameMode });
        dispatch({ type: 'START_FRESH_GAME', payload: {
          player1Name: playerName,
          player2Name: 'AI'
        }});
        onGameStart();
      } else {
        const response = await roomAPI.createRoom(playerName);
        const room = response.data;
        
        dispatch({ type: 'SET_ROOM_CODE', payload: room.code });
        dispatch({ type: 'SET_PLAYER_NAME', payload: playerName });
        dispatch({ type: 'SET_GAME_MODE', payload: gameMode });
        dispatch({ type: 'SET_PLAYER_ID', payload: room.playerId });
        
        // Update game state with player1 name
        dispatch({ type: 'UPDATE_GAME_STATE', payload: {
          players: {
            ...state.gameState.players,
            player1: { ...state.gameState.players.player1, name: playerName }
          }
        }});
        
        joinRoom(room.code, playerName);
        setWaitingForPlayer(true);
      }
    } catch (err) {
      console.error('Room creation error:', err);
      setError(err.response?.data?.error || 'Failed to create room. Make sure the server is running.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter room code');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      dispatch({ type: 'SET_ROOM_CODE', payload: roomCode.toUpperCase() });
      dispatch({ type: 'SET_PLAYER_NAME', payload: playerName });
      dispatch({ type: 'SET_GAME_MODE', payload: gameMode });
      
      joinRoom(roomCode.toUpperCase(), playerName);
      // WebSocket events will handle the game start
      
    } catch (err) {
      setError('Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="room-setup-container">
      <div className="room-setup-content">
        <button className="back-button" onClick={onBack}>← Back</button>
        
        <h2>{gameMode === 'vsAI' ? 'VS AI Setup' : 'VS Player Setup'}</h2>
        
        <div className="setup-form">
          <div className="input-group">
            <label>Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          {gameMode === 'vsPlayer' && (
            <>
              <div className="room-options">
                <button 
                  className="create-room-btn"
                  onClick={handleCreateRoom}
                  disabled={isCreating || waitingForPlayer || gameStarting}
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </button>
                
                <div className="divider">OR</div>
                
                <div className="join-section">
                  <div className="input-group">
                    <label>Room Code</label>
                    <input
                      type="text"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="Enter room code"
                      maxLength={6}
                    />
                  </div>
                  <button 
                    className="join-room-btn"
                    onClick={handleJoinRoom}
                    disabled={isJoining}
                  >
                    {isJoining ? 'Joining...' : 'Join Room'}
                  </button>
                </div>
              </div>

              {state.roomCode && waitingForPlayer && (
                <div className="room-info">
                  <h3>Room Created!</h3>
                  <div className="room-code">Code: {state.roomCode}</div>
                  <p>Share this code with your opponent</p>
                  <p className="status">
                    {connected ? '🟢 Connected - Waiting for opponent...' : '🔴 Connecting...'}
                  </p>
                </div>
              )}

              {gameStarting && (
                <div className="game-starting">
                  <h3>Game Starting...</h3>
                  <div className="spinner"></div>
                  <p>Both players ready! Initializing game...</p>
                </div>
              )}
            </>
          )}

          {gameMode === 'vsAI' && (
            <button 
              className="start-game-btn"
              onClick={handleCreateRoom}
              disabled={isCreating}
            >
              {isCreating ? 'Starting...' : 'Start Game'}
            </button>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default RoomSetup;