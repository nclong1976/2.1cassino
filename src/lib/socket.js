import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_SERVER_URL) {
    return import.meta.env.VITE_SOCKET_SERVER_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname;
    return `${protocol}//${host}:4000`;
  }
  return 'http://localhost:4000';
};

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    const targetUrl = getSocketUrl();
    console.log(`🔌 [Socket.io Client] Connecting to Socket Server at: ${targetUrl}`);
    socketInstance = io(targetUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
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
