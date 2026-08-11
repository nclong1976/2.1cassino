import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Store connected users and active rooms
const connectedUsers = new Map();

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    connections: connectedUsers.size,
    timestamp: new Date().toISOString(),
  });
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // User auth/join room
  socket.on('user:join', (data) => {
    const { userId, role } = data || {};
    if (userId) {
      connectedUsers.set(socket.id, { userId, role, socketId: socket.id });
      socket.join(`room:user:${userId}`);
      console.log(`[Socket.io] User ${userId} joined room:user:${userId}`);
    }

    if (role === 'admin' || role === 'super_admin') {
      socket.join('room:admin');
      console.log(`[Socket.io] Admin joined room:admin`);
    }

    socket.join('room:global');
    socket.join('room:games');
    socket.join('room:chat');
  });

  // 1. Game Config Updates (Status, Odds, Schedules, Custom Games)
  socket.on('game:config_change', (payload) => {
    console.log('[Socket.io] Broadcasting game:configs_updated', payload?.gameId || 'all');
    io.to('room:games').to('room:admin').emit('game:configs_updated', payload);
  });

  // 2. User State & Balance Updates
  socket.on('user:balance_change', (payload) => {
    const { userId } = payload || {};
    console.log(`[Socket.io] User balance change for ${userId}`);
    if (userId) {
      io.to(`room:user:${userId}`).emit('user:state_updated', payload);
    }
    io.to('room:admin').emit('user:state_updated', payload);
  });

  // 3. Bet Placement & Settlement
  socket.on('user:bet_placed', (payload) => {
    console.log('[Socket.io] Bet placed:', payload);
    io.to('room:admin').emit('admin:notification', {
      type: 'bet',
      title: 'Đơn Cược Mới',
      body: `Người dùng ${payload?.userId} cược $${payload?.amount} tại ${payload?.gameId}`,
      payload,
    });
  });

  // 4. Live Chat Support
  socket.on('chat:send_message', (payload) => {
    console.log('[Socket.io] Chat message sent:', payload?.msgId || payload?.userId);
    io.to('room:chat').to('room:admin').emit('chat:new_message', payload);
    if (payload?.userId) {
      io.to(`room:user:${payload.userId}`).emit('chat:new_message', payload);
    }
  });

  // 5. System Banner Updates
  socket.on('banner:change', (payload) => {
    console.log('[Socket.io] Broadcasting banner:updated');
    io.to('room:global').emit('banner:updated', payload);
  });

  // 6. Admin Audit Log Events
  socket.on('admin:audit_log', (payload) => {
    io.to('room:admin').emit('admin:audit_logged', payload);
  });

  // Disconnect handler
  socket.on('disconnect', (reason) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      console.log(`[Socket.io] User ${userInfo.userId} disconnected (${reason})`);
      connectedUsers.delete(socket.id);
    } else {
      console.log(`[Socket.io] Socket ${socket.id} disconnected (${reason})`);
    }
  });
});

const PORT = process.env.SOCKET_PORT || 4000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [Socket.io Server] Running on http://localhost:${PORT}`);
});
