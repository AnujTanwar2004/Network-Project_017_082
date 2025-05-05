import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

export default function Lobby({ setPlayer, setRoom }) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [, setIsConnected] = useState(socket.connected);
  const navigate = useNavigate();

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      setError('Please enter your name before creating a game.');
      return;
    }

    socket.emit('createRoom', { playerName }, (response) => {
      if (response.error) {
        setError(response.error);
        return;
      }

      setPlayer({ id: response.playerId, name: playerName });
      setRoom({
        id: response.roomId,
        isHost: true,
        players: response.room.players || [],
        cards: response.room.cards || [],
        currentPlayer: response.room.currentPlayer || 0,
        gameStarted: response.room.gameStarted || false,
        gameOver: response.room.gameOver || false,
      });

      navigate(`/game/${response.roomId}`);
    });
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) {
      setError('Please enter your name and room ID.');
      return;
    }

    socket.emit('joinRoom', { roomId, playerName }, (response) => {
      if (response.error) {
        setError(response.error);
        return;
      }

      setPlayer({ id: response.playerId, name: playerName });
      setRoom({
        id: roomId,
        isHost: false,
        players: response.room.players || [],
        cards: response.room.cards || [],
        currentPlayer: response.room.currentPlayer || 0,
        gameStarted: response.room.gameStarted || false,
        gameOver: response.room.gameOver || false,
      });

      navigate(`/game/${roomId}`);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-blue-500 to-cyan-300 text-white rounded-2xl shadow-2xl p-6 border-4 border-white backdrop-blur-sm bg-opacity-80">
        <h1 className="text-3xl font-extrabold text-center mb-6 drop-shadow-sm">🎮 Memory Match</h1>

        <div className="mb-4">
          <label className="block text-sm mb-2 font-semibold">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-2 text-teal-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-2 font-semibold">Room ID (leave empty to create)</label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-3 py-2 text-teal-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Enter room ID"
          />
        </div>

        {error && <p className="text-yellow-300 mb-4 text-center">{error}</p>}

        <div className="flex flex-col space-y-3 mt-4">
          <button
            onClick={handleCreateGame}
            className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white py-2 px-4 rounded-full font-bold shadow-md hover:scale-105 transform transition"
          >
            🚀 Create Game
          </button>

          <button
            onClick={handleJoinRoom}
            className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white py-2 px-4 rounded-full font-bold shadow-md hover:scale-105 transform transition"
          >
            🎯 Join Room
          </button>
        </div>
      </div>
    </div>
  );
}
