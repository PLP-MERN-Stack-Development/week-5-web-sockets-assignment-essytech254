const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.get('/', (req, res) => res.send('Chat server is running'));

const users = {}; // socket.id -> { username, online }
const rooms = ['general', 'random', 'tech', 'gaming'];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ username, room }) => {
    users[socket.id] = { username, room, online: true };
    socket.join(room);
    io.emit('user-list', getUserList());
    io.to(room).emit('receive-message', {
      message: `${username} joined the chat`,
      username: 'System',
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send-message', ({ message }) => {
    const user = users[socket.id];
    if (!user) return;
    const timestamp = new Date().toISOString();
    io.to(user.room).emit('receive-message', {
      message,
      username: user.username,
      timestamp
    });
  });

  socket.on('typing', (isTyping) => {
    const user = users[socket.id];
    if (!user) return;
    socket.to(user.room).emit('user-typing', { username: user.username, isTyping });
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const { username, room } = user;
      io.to(room).emit('receive-message', {
        message: `${username} left the chat`,
        username: 'System',
        timestamp: new Date().toISOString()
      });
      delete users[socket.id];
      io.emit('user-list', getUserList());
    }
  });
});

function getUserList() {
  const list = Object.values(users).map((u) => ({ username: u.username, room: u.room, online: u.online }));
  return list;
}

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
