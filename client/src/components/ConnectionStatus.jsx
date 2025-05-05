//conectionStatus.jsx
import { useEffect, useState } from 'react';
import socket from '../socket';

export default function ConnectionStatus() {
  const [status, setStatus] = useState('Connecting...');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setStatus('Connected to server');
    }

    function onDisconnect() {
      setIsConnected(false);
      setStatus('Disconnected from server');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <div className={`p-2 text-center text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {status} {isConnected && `(ID: ${socket.id})`}
    </div>
  );
}
