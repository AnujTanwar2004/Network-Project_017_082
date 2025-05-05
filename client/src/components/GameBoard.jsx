import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
import Card from './Card';
import PlayerInfo from './PlayerInfo';
import GameOver from './GameOver';

export default function GameBoard({ player, room }) {
  const { roomId } = useParams();
  const [players, setPlayers] = useState([]);
  const [cards, setCards] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    socket.on('startGame', (room) => {
      setCards(room.cards);
      setPlayers(room.players);
      setGameStarted(true);
      setCurrentPlayer(room.currentPlayer);
      setGameOver(false);
      setCountdown(null); // Hide countdown when game starts
    });

    socket.on('updateRoom', (room) => {
      setPlayers(room.players);
      setCards(room.cards);
      setCurrentPlayer(room.currentPlayer);
      setGameOver(room.gameOver);
    });

    socket.on('countdownTick', (tick) => {
      setCountdown(tick);
    });

    return () => {
      socket.off('startGame');
      socket.off('updateRoom');
      socket.off('countdownTick');
    };
  }, []);

  const handleStartGame = () => {
    socket.emit('startGame', { roomId });
  };

  const handleFlipCard = (cardId) => {
    if (!gameStarted || gameOver) return;
    socket.emit('flipCard', { roomId, cardId, playerId: player.id });
  };

  if (gameOver) {
    return <GameOver players={players} roomId={roomId} />;
  }

  return (
    <div className="min-h-screen bg-cover bg-center p-4" style={{ backgroundImage: "#" }}>
      <div className="max-w-4xl mx-auto">
        {room?.id && (
          <div className="text-center text-sm text-gray-600 mb-2">
            <span className="font-medium text-blue-600">Room ID:</span> {room.id}
          </div>
        )}

        <PlayerInfo 
          players={players} 
          currentPlayer={currentPlayer} 
          playerId={player.id} 
        />

        {!gameStarted && room.isHost && countdown === null && (
          <div className="text-center my-6">
            <button
              onClick={handleStartGame}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
              disabled={players.length < 2}
            >
              {players.length < 2 ? 'Waiting for another player...' : 'Start Game'}
            </button>
          </div>
        )}

        {countdown !== null && (
          <div className="text-center text-3xl font-bold text-red-600 my-6 animate-pulse">
            Game starts in... {countdown}
          </div>
        )}

        {gameStarted ? (
          <div className="grid grid-cols-4 gap-4 mt-6">
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                onFlip={handleFlipCard}
                disabled={
                  card.matched || 
                  card.flipped || 
                  currentPlayer !== players.findIndex(p => p.id === player.id)
                }
              />
            ))}
          </div>
        ) : (
          countdown === null && (
            <div className="text-center mt-10 text-gray-500">
              {room.isHost 
                ? 'Share the room ID with your friend to start playing' 
                : 'Waiting for the host to start the game...'}
            </div>
          )
        )}
      </div>
    </div>
  );
}
