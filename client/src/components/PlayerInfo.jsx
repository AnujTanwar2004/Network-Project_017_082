// src/components/PlayerInfo.jsx
export default function PlayerInfo({ players, currentPlayer, playerId }) {
  return (
    <div className="bg-black bg-opacity-20 backdrop-blur-md text-white p-3 rounded-lg shadow-md text-center w-full max-w-xs mx-auto">
      <h2 className="text-xl font-semibold mb-2">Players</h2>
      <ul className="space-y-2">
        {players.map(player => (
          <li
            key={player.id}
            className={`py-1 px-2 rounded-md text-sm ${
              player.id === playerId ? 'bg-blue-600 font-bold' : 'bg-gray-800'
            }`}
          >
            {player.name}
            <br />
            <span className="text-xs">
              Score: {player.score}{' '}
              {currentPlayer === players.findIndex(p => p.id === player.id) && (
                <span className="text-green-300 font-semibold">(Your Turn)</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

