//socket.jsx
import { io } from 'socket.io-client';

const socket = io(
  process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:5000',
  {  
    autoConnect: true,
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  }
);

socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('Disconnected from server:', reason);
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
  setTimeout(() => {
    console.log('Retrying connection...');
    socket.connect();
  }, 2000);
});

socket.on('reconnect_attempt', (attempt) => {
  console.log(`Reconnection attempt #${attempt}`);
});

socket.on('serverMessage', (message) => {
  console.log('Server says:', message);
});

export default socket;
