import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:4000';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ [Socket.io Client] Connected to server, ID:', socketInstance.id);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('⚠️ [Socket.io Client] Connection warning:', err.message);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 [Socket.io Client] Disconnected:', reason);
    });
  }

  return socketInstance;
};

export const connectSocketUser = (userId, role = 'user') => {
  const socket = getSocket();
  if (socket && userId) {
    socket.emit('user:join', { userId, role });
  }
  return socket;
};

export const emitSocketEvent = (eventName, payload) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit(eventName, payload);
  } else {
    // Fallback: emit locally or queue if offline
    console.debug(`[Socket.io Client] Socket offline, event ${eventName} skipped emit`);
  }
};
