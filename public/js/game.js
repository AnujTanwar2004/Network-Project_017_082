document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const urlParams = new URLSearchParams(window.location.search);
    const gameCode = urlParams.get('gameCode');
    const playerId = urlParams.get('playerId');
    
    let gameState = null;
  
    socket.emit('joinGame', { gameCode, playerId });
  
    socket.on('gameUpdate', (state) => {
      gameState = state;
      renderGame();
    });
    
    socket.on('matchFound', ({ playerId, cards }) => {
      cards.forEach(index => {
        const card = document.querySelector(`.memory-card[data-index="${index}"]`);
        if (card) card.classList.add('matched');
      });
    });
    
    socket.on('gameOver', (results) => {
      const winner = results.winner;
      const message = winner 
        ? `${winner.name} wins with ${winner.score} matches!`
        : "It's a tie!";
      
      document.getElementById('winnerMessage').textContent = message;
      document.getElementById('gameOver').classList.remove('hidden');
    });
  
    socket.on('playerLeft', () => {
      alert('Other player left the game. Returning to lobby.');
      window.location.href = '/';
    });
  
    function renderGame() {
      if (!gameState) return;
      
      // Update player info
      document.getElementById('playerInfo').innerHTML = `
        <h3>Players</h3>
        ${Object.values(gameState.players).map(player => `
          <div class="${player.id === gameState.currentTurn ? 'current-turn' : ''}">
            ${player.name}: ${player.score} matches
            ${player.id.toString() === playerId ? '(You)' : ''}
          </div>
        `).join('')}
      `;
      
      // Update game status
      document.getElementById('gameStatus').textContent = 
        gameState.currentTurn.toString() === playerId 
          ? "Your turn - Click two cards"
          : `${gameState.players[gameState.currentTurn].name}'s turn`;
      
      // Render cards
      const board = document.getElementById('gameBoard');
      if (board.children.length === 0) {
        gameState.cards.forEach(card => {
          const cardElement = document.createElement('div');
          cardElement.className = 'memory-card';
          cardElement.dataset.index = card.index;
          
          const cardFront = document.createElement('div');
          cardFront.className = 'card-face card-front';
          cardFront.textContent = card.symbol;
          
          const cardBack = document.createElement('div');
          cardBack.className = 'card-face card-back';
          
          cardElement.appendChild(cardFront);
          cardElement.appendChild(cardBack);
          
          if (card.flipped || card.matched) {
            cardElement.classList.add('flipped');
          }
          
          if (card.matched) {
            cardElement.classList.add('matched');
          }
          
          cardElement.addEventListener('click', () => handleCardClick(card.index));
          board.appendChild(cardElement);
        });
      } else {
        gameState.cards.forEach(card => {
          const cardElement = document.querySelector(`.memory-card[data-index="${card.index}"]`);
          if (!cardElement) return;
          
          if (card.flipped || card.matched) {
            cardElement.classList.add('flipped');
          } else {
            cardElement.classList.remove('flipped');
          }
          
          if (card.matched) {
            cardElement.classList.add('matched');
          }
        });
      }
    }
    
    function handleCardClick(cardIndex) {
      if (!gameState || gameState.currentTurn.toString() !== playerId) return;
      
      const card = gameState.cards[cardIndex];
      if (card.flipped || card.matched) return;
      
      socket.emit('flipCard', { gameCode, cardIndex });
    }
    
    document.getElementById('playAgain').addEventListener('click', () => {
      window.location.href = '/';
    });
  
    document.getElementById('leaveGame').addEventListener('click', () => {
      socket.emit('leaveGame', { gameCode });
      window.location.href = '/';
    });
  });