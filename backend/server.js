const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const roomManager = require('./utils/roomManager');
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
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/game', require('./routes/game'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('joinRoom', (roomCode, playerName) => {
    const room = roomManager.joinRoom(roomCode, socket.id, playerName);
    if (room) {
      socket.join(roomCode);
      socket.emit('roomJoined', room);
      socket.to(roomCode).emit('playerJoined', room);
    } else {
      socket.emit('error', 'Room not found');
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
