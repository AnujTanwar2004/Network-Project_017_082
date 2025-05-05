document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const playerNameInput = document.getElementById('playerName');
    const gameCodeInput = document.getElementById('gameCode');
    const joinButton = document.getElementById('joinGame');
    const createButton = document.getElementById('createGame');
    const errorDisplay = document.getElementById('error');
    const menu = document.getElementById('menu');
    const lobby = document.getElementById('lobby');
    const gameCodeDisplay = document.getElementById('gameCodeDisplay');
    const playerList = document.getElementById('playerList');
    const status = document.getElementById('status');
    const countdown = document.getElementById('countdown');
    const leaveButton = document.getElementById('leaveGame');
  
    let currentGameCode = null;
  
    function showError(message) {
      errorDisplay.textContent = message;
      errorDisplay.classList.remove('hidden');
    }
  
    function hideError() {
      errorDisplay.classList.add('hidden');
    }
  
    function showLobby(code) {
      currentGameCode = code;
      gameCodeDisplay.textContent = code;
      menu.classList.add('hidden');
      lobby.classList.remove('hidden');
    }
  
    function resetUI() {
      menu.classList.remove('hidden');
      lobby.classList.add('hidden');
      playerNameInput.value = '';
      gameCodeInput.value = '';
      hideError();
      currentGameCode = null;
    }
  
    joinButton.addEventListener('click', () => {
      const playerName = playerNameInput.value.trim();
      const gameCode = gameCodeInput.value.trim().toUpperCase();
      
      hideError();
  
      if (!playerName) {
        showError('Please enter your name');
        return;
      }
  
      if (!gameCode) {
        showError('Please enter game code');
        return;
      }
  
      joinButton.disabled = true;
      joinButton.textContent = 'Joining...';
  
      socket.emit('joinGame', { gameCode, playerName }, (response) => {
        joinButton.disabled = false;
        joinButton.textContent = 'Join Game';
        
        if (response.success) {
          showLobby(gameCode);
        } else {
          showError(response.error);
        }
      });
    });
  
    createButton.addEventListener('click', () => {
      const playerName = playerNameInput.value.trim();
      
      hideError();
  
      if (!playerName) {
        showError('Please enter your name');
        return;
      }
  
      createButton.disabled = true;
      createButton.textContent = 'Creating...';
  
      socket.emit('createGame', { playerName }, (response) => {
        createButton.disabled = false;
        createButton.textContent = 'Create New Game';
        
        if (response.success) {
          showLobby(response.gameCode);
        } else {
          showError(response.error);
        }
      });
    });
  
    leaveButton.addEventListener('click', () => {
      if (currentGameCode) {
        socket.emit('leaveGame', { gameCode: currentGameCode });
        resetUI();
      }
    });
  
    socket.on('playerJoined', (data) => {
      playerList.innerHTML = '';
      data.players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name}${player.isHost ? ' (Host)' : ''}`;
        playerList.appendChild(li);
      });
  
      if (data.players.length >= 2) {
        status.textContent = 'Game will start soon!';
      } else {
        status.textContent = 'Waiting for players...';
      }
    });
  
    socket.on('playerLeft', (data) => {
      playerList.innerHTML = '';
      data.players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = `${player.name}${player.isHost ? ' (Host)' : ''}`;
        playerList.appendChild(li);
      });
  
      status.textContent = 'Player left. Waiting...';
    });
  
    socket.on('countdown', ({ seconds }) => {
      countdown.classList.remove('hidden');
      countdown.textContent = `Starting in ${seconds} seconds...`;
      
      if (seconds <= 0) {
        countdown.textContent = 'Starting game...';
      }
    });
  
    socket.on('gameStarted', (gameState) => {
      window.location.href = `/game.html?gameCode=${gameState.gameCode}&playerId=${socket.id}`;
    });
  
    socket.on('connect_error', (error) => {
      showError('Connection error. Please refresh the page.');
    });
  });