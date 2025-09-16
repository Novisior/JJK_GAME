import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const roomAPI = {
  createRoom: (playerName) => api.post('/rooms/create', { playerName }),
  getRoom: (roomCode) => api.get(`/rooms/${roomCode}`),
};

export const gameAPI = {
  getAIMove: () => api.post('/game/ai-move'),
  resolveClash: (playerMoves, aiMoves) => 
    api.post('/game/resolve-clash', { playerMoves, aiMoves }),
};

export default api;