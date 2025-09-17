// src/hooks/useWebSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useGame } from '../context/GameContext';

export function useWebSocket() {
  const { state, dispatch } = useGame();
  const socketRef = useRef(null);

  useEffect(() => {
    if (state.gameMode === 'vsPlayer' && !socketRef.current) {
      socketRef.current = io('http://localhost:5000');

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
        dispatch({ type: 'SET_CONNECTED', payload: true });
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
        dispatch({ type: 'SET_CONNECTED', payload: false });
      });

      socketRef.current.on('roomJoined', (data) => {
        console.log('Room joined:', data);
        dispatch({ type: 'SET_PLAYER_ID', payload: data.playerId });
        dispatch({ type: 'UPDATE_GAME_STATE', payload: {
          players: {
            player1: { ...state.gameState.players.player1, name: data.gameState.players.player1.name },
            player2: { ...state.gameState.players.player2, name: data.gameState.players.player2.name }
          }
        }});
      });

      socketRef.current.on('playerJoined', (data) => {
        console.log('Second player joined:', data);
        // When second player joins, update both players' names and trigger game start
        dispatch({ type: 'UPDATE_GAME_STATE', payload: {
          players: {
            player1: { hp: 1000, ce: 0, name: data.gameState.players.player1.name, domainActive: false, domainQueued: false },
            player2: { hp: 1000, ce: 0, name: data.gameState.players.player2.name, domainActive: false, domainQueued: false }
          }
        }});
      });

      socketRef.current.on('gameStarted', (gameState) => {
        console.log('Game started:', gameState);
        dispatch({ type: 'START_FRESH_GAME', payload: {
          player1Name: gameState.players.player1.name,
          player2Name: gameState.players.player2.name
        }});
      });

      socketRef.current.on('clashResults', (results) => {
        console.log('Clash results received:', results);
        dispatch({ type: 'UPDATE_GAME_STATE', payload: {
          clashResults: results.clashes,
          phase: 'clashReveal',
          players: results.newState.players
        }});
      });

      socketRef.current.on('finisherStarted', (room) => {
        console.log('Finisher started:', room);
        dispatch({ type: 'UPDATE_GAME_STATE', payload: {
          phase: 'finisher',
          finisherActive: true
        }});
      });

      socketRef.current.on('finisherResult', (result) => {
        console.log('Finisher result:', result);
        dispatch({ type: 'UPDATE_GAME_STATE', payload: {
          phase: result.gameEnd ? 'gameEnd' : 'moveSelection',
          finisherActive: false,
          winner: result.gameEnd ? (result.type === 'blackFlash' ? 'finisher' : 'defender') : null
        }});
      });

      socketRef.current.on('error', (error) => {
        console.error('WebSocket error:', error);
        dispatch({ type: 'SET_ERROR', payload: error });
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [state.gameMode, dispatch, state.gameState.players]);

  const joinRoom = (roomCode, playerName) => {
    if (socketRef.current && socketRef.current.connected) {
      console.log(`Attempting to join room ${roomCode} with name ${playerName}`);
      socketRef.current.emit('joinRoom', roomCode, playerName);
    } else {
      console.error('Socket not connected');
    }
  };

  const submitMoves = (roomCode, moves) => {
    if (socketRef.current) {
      socketRef.current.emit('submitMoves', roomCode, moves);
    }
  };

  const startFinisher = (roomCode) => {
    if (socketRef.current) {
      socketRef.current.emit('startFinisher', roomCode);
    }
  };

  const submitFinisherChoice = (roomCode, choice) => {
    if (socketRef.current) {
      socketRef.current.emit('finisherChoice', roomCode, choice);
    }
  };

  return {
    joinRoom,
    submitMoves,
    startFinisher,
    submitFinisherChoice,
    connected: state.connected
  };
}