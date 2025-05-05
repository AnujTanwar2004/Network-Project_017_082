// src/components/GameOver.jsx
import socket from '../socket';

export default function GameOver({ players, roomId }) {
  const handlePlayAgain = () => {
    socket.emit('restartGame', { roomId });
  };

  const winner = players.reduce((top, player) =>
    player.score > top.score ? player : top, players[0]);

  return (
    <div className="min-h-screen bg-cover bg-center p-4" style={{ backgroundImage: "#" }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-6">Game Over</h2>
        <p className="text-xl text-gray-800 mb-6">
          🏆 <span className="font-semibold text-blue-600">{winner.name}</span> wins with {winner.score} points!
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {players.map((player) => (
            <div
              key={player.id}
              className={`w-64 rounded-xl p-4 shadow-md text-center ${
                player.id === winner.id ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-white'
              }`}
            >
              <p className="font-semibold text-lg text-gray-700">{player.name}</p>
              <p className="text-gray-500">Score: {player.score}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handlePlayAgain}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg"
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}
