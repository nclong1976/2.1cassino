import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, connectSocketUser, emitSocketEvent } from './socket';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  emit: () => {},
});

export const SocketProvider = ({ children, userId, role }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onConnect = () => {
      setIsConnected(true);
      if (userId) {
        connectSocketUser(userId, role);
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    if (s.connected) {
      onConnect();
    }

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [userId, role]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit: emitSocketEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
