// src/context/GameContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const initialState = {
  gameMode: null,
  roomCode: null,
  playerName: '',
  playerId: null,
  gameState: {
    players: {
      player1: { hp: 1000, ce: 0, name: '', domainActive: false, domainQueued: false },
      player2: { hp: 1000, ce: 0, name: '', domainActive: false, domainQueued: false }
    },
    round: 1,
    clash: 1,
    phase: 'moveSelection', // moveSelection, clashReveal, finisher, gameEnd
    battleLog: [],
    currentMoves: { player1: [], player2: [] },
    clashResults: [],
    finisherActive: false,
    finisherInitiator: null,
    winner: null,
    doubleDomain: false
  },
  connected: false,
  error: null,
  movesLocked: false
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload };
    
    case 'SET_ROOM_CODE':
      return { ...state, roomCode: action.payload };
    
    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.payload };
    
    case 'SET_PLAYER_ID':
      return { ...state, playerId: action.payload };
    
    case 'UPDATE_GAME_STATE':
      return { 
        ...state, 
        gameState: { ...state.gameState, ...action.payload } 
      };
    
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_BATTLE_LOG':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          battleLog: [...state.gameState.battleLog, action.payload]
        }
      };
    
    case 'SET_MOVES':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          currentMoves: {
            ...state.gameState.currentMoves,
            [action.payload.player]: action.payload.moves
          }
        }
      };
    
    case 'LOCK_MOVES':
      return { ...state, movesLocked: true };
    
    case 'UNLOCK_MOVES':
      return { ...state, movesLocked: false };
    
    case 'RESET_GAME':
      return {
        ...initialState,
        gameMode: state.gameMode,
        roomCode: state.roomCode,
        playerName: state.playerName,
        playerId: state.playerId,
        connected: state.connected,
        gameState: {
          players: {
            player1: { hp: 1000, ce: 0, name: state.gameState.players.player1.name || '', domainActive: false, domainQueued: false },
            player2: { hp: 1000, ce: 0, name: state.gameState.players.player2.name || '', domainActive: false, domainQueued: false }
          },
          round: 1,
          clash: 1,
          phase: 'moveSelection',
          battleLog: [],
          currentMoves: { player1: [], player2: [] },
          clashResults: [],
          finisherActive: false,
          finisherInitiator: null,
          winner: null,
          doubleDomain: false
        }
      };
    
    case 'START_FRESH_GAME':
      return {
        ...state,
        gameState: {
          players: {
            player1: { hp: 1000, ce: 0, name: action.payload?.player1Name || '', domainActive: false, domainQueued: false },
            player2: { hp: 1000, ce: 0, name: action.payload?.player2Name || '', domainActive: false, domainQueued: false }
          },
          round: 1,
          clash: 1,
          phase: 'moveSelection',
          battleLog: [],
          currentMoves: { player1: [], player2: [] },
          clashResults: [],
          finisherActive: false,
          finisherInitiator: null,
          winner: null,
          doubleDomain: false
        },
        movesLocked: false
      };
    
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}