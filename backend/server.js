// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const roomManager = require('./routes/roomManager');
const aiLogic = require('./utils/aiLogic');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/game', require('./routes/game'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('joinRoom', (roomCode, playerName) => {
    console.log(`Player ${playerName} attempting to join room ${roomCode}`);
    
    const result = roomManager.joinRoom(roomCode, socket.id, playerName);
    if (result) {
      socket.join(roomCode);
      
      // Send room joined confirmation to the joining player
      socket.emit('roomJoined', {
        playerId: result.playerId,
        gameState: result.gameState
      });
      
      // If room is now full (2 players), notify both players
      if (result.status === 'ready') {
        console.log(`Room ${roomCode} is now ready with 2 players`);
        
        // Notify all players in the room that second player joined and game can start
        io.to(roomCode).emit('playerJoined', {
          gameState: result.gameState,
          players: result.players
        });
        
        // Start the game for all players in the room
        setTimeout(() => {
          io.to(roomCode).emit('gameStarted', result.gameState);
        }, 500);
      }
    } else {
      socket.emit('error', 'Room not found or full');
    }
  });

  socket.on('submitMoves', (roomCode, moves) => {
    const room = roomManager.submitMoves(roomCode, socket.id, moves);
    if (room && room.allMovesSubmitted) {
      const clashResults = roomManager.resolveClash(roomCode);
      io.to(roomCode).emit('clashResults', clashResults);
    }
  });

  socket.on('startFinisher', (roomCode) => {
    const room = roomManager.startFinisher(roomCode, socket.id);
    if (room) {
      io.to(roomCode).emit('finisherStarted', room);
    }
  });

  socket.on('finisherChoice', (roomCode, choice) => {
    const result = roomManager.resolveFinisher(roomCode, socket.id, choice);
    if (result) {
      io.to(roomCode).emit('finisherResult', result);
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    roomManager.removePlayer(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});