const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// API Test Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is healthy' });
});

// Serve static files from React in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Game Logic
const rooms = {};
const cardPairs = 8;

function generateEquationPair(idStart, matchValue) {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = matchValue - a;

  return [
    {
      id: idStart,
      displayValue: `${a} + ${b}`,
      matchValue,
      type: 'question',
      matched: false,
    },
    {
      id: idStart + 1,
      displayValue: `${matchValue}`,
      matchValue,
      type: 'answer',
      matched: false,
    }
  ];
}

function createNewGame() {
  const cards = [];
  const usedValues = new Set();

  while (cards.length < cardPairs * 2) {
    const matchValue = Math.floor(Math.random() * 15) + 5;
    if (usedValues.has(matchValue)) continue;
    usedValues.add(matchValue);

    const pair = generateEquationPair(cards.length + 1, matchValue);
    cards.push(...pair);
  }

  return cards.sort(() => Math.random() - 0.5);
}

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Send confirmation back to client
  socket.emit('serverMessage', 'You are connected to the server');

  // Create Room
  socket.on('createRoom', ({ playerName }, callback) => {
    try {
      const roomId = Math.random().toString(36).substring(2, 8);
      rooms[roomId] = {
        players: [{ id: socket.id, name: playerName, score: 0, isActive: true, isHost: true }],
        cards: createNewGame(),
        currentPlayer: 0,
        flippedCards: [],
        gameStarted: false,
        gameOver: false
      };
      socket.join(roomId);
      console.log(`Room ${roomId} created`);

      // Send response to client
      callback({ 
        roomId, 
        playerId: socket.id,
        room: rooms[roomId] // Include full room data in response
      });

    } catch (err) {
      console.error('Error creating room:', err);
      callback({ error: 'Failed to create room' });
    }
  });

  // Join Room
  socket.on('joinRoom', ({ roomId, playerName }, callback) => {
    try {
      console.log(`Received joinRoom request for Room ID: ${roomId}, Player: ${playerName}`);

      if (!rooms[roomId]) {
        return callback({ error: 'Room not found' });
      }

      if (rooms[roomId].players.length >= 2) {
        return callback({ error: 'Room is full' });
      }

      const playerId = socket.id;
      rooms[roomId].players.push({ 
        id: playerId, 
        name: playerName, 
        score: 0, 
        isActive: true 
      });

      console.log(`Player ${playerName} joined room ${roomId}`);

      // Join the room
      socket.join(roomId);

      // Prepare response with full room data
      const response = {
        roomId,
        playerId,
        room: {
          players: rooms[roomId].players,
          cards: rooms[roomId].cards,
          currentPlayer: rooms[roomId].currentPlayer,
          flippedCards: rooms[roomId].flippedCards,
          gameStarted: rooms[roomId].gameStarted,
          gameOver: rooms[roomId].gameOver
        }
      };
  
      // Send response to joining player
      callback(response);

      // Emit updated room state to all clients in the room
      io.to(roomId).emit('updateRoom', rooms[roomId]);
    
    } catch (error) {
      console.error('Join room error:', error);
      callback({ error: 'Failed to join room' });
    }
  });

  // Handle the host starting the game
  socket.on('startGame', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    // Make sure only host can start the game
    if (!room.players.some(player => player.id === socket.id && player.isHost)) {
      return;
    }

    // Emit countdown ticks to all players
    let countdown = 5;
    const countdownInterval = setInterval(() => {
      io.to(roomId).emit('countdownTick', countdown);
      countdown--;

      if (countdown < 0) {
        clearInterval(countdownInterval);
        
        // Start the game after countdown
        room.gameStarted = true;
        io.to(roomId).emit('startGame', room);
        console.log(`Game started in room: ${roomId}`);
      }
    }, 1000);
  });

  // Flip Card
  socket.on('flipCard', ({ roomId, cardId, playerId }) => {
    try {
      const room = rooms[roomId];
      if (!room) return;
  
      // Don't allow more than 2 cards to be flipped
      if (room.flippedCards.length >= 2) return;
  
      const card = room.cards.find(c => c.id === cardId);
      if (!card || card.flipped || card.matched) return;
  
      // Flip the card
      card.flipped = true;
      room.flippedCards.push(card);
  
      io.to(roomId).emit('updateRoom', room); // ✅ Immediately show the second flip
  
      // If two cards are flipped, check for match
      if (room.flippedCards.length === 2) {
        const [card1, card2] = room.flippedCards;
  
        const isMatch = card1.matchValue === card2.matchValue;
  
        setTimeout(() => {
          if (isMatch) {
            card1.matched = true;
            card2.matched = true;
  
            const player = room.players.find(p => p.id === playerId);
            if (player) player.score += 1;
  
            if (room.cards.every(c => c.matched)) {
              room.gameOver = true;
            }
          } else {
            card1.flipped = false;
            card2.flipped = false;
          }
  
          room.flippedCards = [];
          room.currentPlayer = (room.currentPlayer + 1) % room.players.length;
  
          io.to(roomId).emit('updateRoom', room); // ✅ Update after delay
        }, 1000);
      }
  
    } catch (error) {
      console.error('Error flipping card:', error);
    }
  });

  // Handle Player Disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Find the room where the player was
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        console.log(`Player ${room.players[playerIndex].name} left room ${roomId}`);
        room.players.splice(playerIndex, 1); // Remove player

        // If no players left, delete the room
        if (room.players.length === 0) {
          delete rooms[roomId];
          console.log(`Room ${roomId} deleted`);
        } else {
          // Notify remaining players
          io.to(roomId).emit('updateRoom', room);
        }
        break;
      }
    }
  });

  // Debugging - Logs all events
  socket.onAny((event, ...args) => {
    console.log(`Received event: ${event}`, args);
  });

  // Restart game (reset state)
  socket.on('restartGame', ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.cards = createNewGame();
    room.gameStarted = true;
    room.gameOver = false;
    room.flippedCards = [];
    room.currentPlayer = 0;

    room.players.forEach(player => {
      player.score = 0;
    });

    io.to(roomId).emit('startGame', room);
  });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
});
