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
        dispatch({ type: 'SET_CONNECTED', payload: true });
      });

      socketRef.current.on('disconnect', () => {
        dispatch({ type: 'SET_CONNECTED', payload: false });
      });

      socketRef.current.on('roomJoined', (room) => {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: room.gameState });
      });

      socketRef.current.on('playerJoined', (room) => {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: room.gameState });
      });

      socketRef.current.on('clashResults', (results) => {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: {
          clashResults: results.clashes,
          phase: 'clashReveal',
          players: results.newState.players
        }});
      });

      socketRef.current.on('finisherStarted', (room) => {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: {
          phase: 'finisher',
          finisherActive: true
        }});
      });

      socketRef.current.on('finisherResult', (result) => {
        dispatch({ type: 'UPDATE_GAME_STATE', payload: {
          phase: result.gameEnd ? 'gameEnd' : 'moveSelection',
          finisherActive: false,
          winner: result.gameEnd ? (result.type === 'blackFlash' ? 'finisher' : 'defender') : null
        }});
      });

      socketRef.current.on('error', (error) => {
        dispatch({ type: 'SET_ERROR', payload: error });
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [state.gameMode, dispatch]);

  const joinRoom = (roomCode, playerName) => {
    if (socketRef.current) {
      socketRef.current.emit('joinRoom', roomCode, playerName);
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
