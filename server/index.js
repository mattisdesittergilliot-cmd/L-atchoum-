'use strict';

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../public')));

// Liste des serveurs/parties actifs
let gameServers = [];

io.on('connection', (socket) => {
  console.log('Joueur connecté:', socket.id);

  // Créer une partie
  socket.on('createGame', (playerName) => {
    const gameId = Math.random().toString(36).substr(2, 9);
    gameServers.push({
      id: gameId,
      host: playerName,
      players: [playerName],
      status: 'waiting'
    });
    
    socket.emit('gameCreated', { gameId, playerName });
    io.emit('updateServers', gameServers);
  });

  // Rejoindre une partie
  socket.on('joinGame', (gameId, playerName) => {
    const game = gameServers.find(g => g.id === gameId);
    if (game && game.players.length < 2) {
      game.players.push(playerName);
      game.status = 'playing';
      io.emit('gameStarted', { gameId, players: game.players });
    }
  });

  // Combat en temps réel
  socket.on('attack', (data) => {
    io.emit('playerAttacked', data);
  });

  // Déconnexion
  socket.on('disconnect', () => {
    console.log('Joueur déconnecté:', socket.id);
    gameServers = gameServers.filter(g => g.players.length > 1);
    io.emit('updateServers', gameServers);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur lancé sur port ${PORT}`);
});