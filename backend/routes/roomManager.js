const { v4: uuidv4 } = require('uuid');
const { createInitialGameState, resolveClash } = require('../utils/gameState')

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(playerName) {
    const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    const room = {
      code: roomCode,
      players: [{
        id: uuidv4(),
        name: playerName,
        socketId: null,
        connected: false
      }],
      gameState: createInitialGameState(),
      status: 'waiting'
    };
    
    this.rooms.set(roomCode, room);
    return room;
  }

  joinRoom(roomCode, socketId, playerName) {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    if (room.players.length < 2) {
      room.players.push({
        id: uuidv4(),
        name: playerName,
        socketId,
        connected: true
      });
      
      if (room.players.length === 2) {
        room.status = 'ready';
      }
    } else {
      const existingPlayer = room.players.find(p => !p.connected);
      if (existingPlayer) {
        existingPlayer.socketId = socketId;
        existingPlayer.connected = true;
      }
    }

    return room;
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
      }
    }
  }
}

module.exports = new RoomManager();
