// backend/utils/roomManager.js
const { v4: uuidv4 } = require('uuid');
const { createInitialGameState, resolveClash } = require('../utils/gameState');

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(playerName) {
    const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    const playerId = uuidv4();
    const gameState = createInitialGameState();
    gameState.players.player1.name = playerName;
    
    const room = {
      code: roomCode,
      players: [{
        id: playerId,
        name: playerName,
        socketId: null,
        connected: false
      }],
      gameState: gameState,
      status: 'waiting'
    };
    
    this.rooms.set(roomCode, room);
    return { ...room, playerId };
  }

  joinRoom(roomCode, socketId, playerName) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    let playerId;

    if (room.players.length < 2) {
      // Add second player
      playerId = uuidv4();
      room.players.push({
        id: playerId,
        name: playerName,
        socketId,
        connected: true
      });
      
      // Update game state with both players
      room.gameState.players.player2.name = playerName;
      
      if (room.players.length === 2) {
        room.status = 'ready';
        // Reset game state to fresh start
        room.gameState = createInitialGameState();
        room.gameState.players.player1.name = room.players[0].name;
        room.gameState.players.player2.name = room.players[1].name;
      }
    } else {
      // Reconnecting existing player
      const existingPlayer = room.players.find(p => p.name === playerName);
      if (existingPlayer) {
        existingPlayer.socketId = socketId;
        existingPlayer.connected = true;
        playerId = existingPlayer.id;
      } else {
        return null; // Room is full
      }
    }

    return { ...room, playerId };
  }

  submitMoves(roomCode, socketId, moves) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find(p => p.socketId === socketId);
    if (!player) return null;

    room.gameState.pendingMoves[player.id] = moves;
    room.allMovesSubmitted = Object.keys(room.gameState.pendingMoves).length === 2;
    
    return room;
  }

  resolveClash(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const moves = Object.values(room.gameState.pendingMoves);
    const results = resolveClash(moves[0], moves[1], room.gameState);
    
    // Update game state
    room.gameState = { ...room.gameState, ...results.newState };
    room.gameState.pendingMoves = {};
    room.allMovesSubmitted = false;

    return results;
  }

  startFinisher(roomCode, socketId) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    room.gameState.finisherActive = true;
    return room;
  }

  resolveFinisher(roomCode, socketId, choice) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    // Finisher logic will be implemented based on game rules
    const result = { success: Math.random() > 0.5, damage: choice === 'perfect' ? 30 : 20 };
    room.gameState.finisherActive = false;
    
    return result;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  removePlayer(socketId) {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        player.connected = false;
        player.socketId = null;
      }
    }
  }
}

module.exports = new RoomManager();