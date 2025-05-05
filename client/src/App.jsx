import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import ConnectionStatus from './components/ConnectionStatus';
import bgImage from './bg-img.jpg'; // ✅ Import your image

function App() {
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);

  return (
    <Router>
      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      >
        <ConnectionStatus />
        <Routes>
          <Route
            path="/"
            element={<Lobby setPlayer={setPlayer} setRoom={setRoom} />}
          />
          <Route
            path="/game/:roomId"
            element={
              <GameBoard
                player={player}
                room={room}
                setRoom={setRoom}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
