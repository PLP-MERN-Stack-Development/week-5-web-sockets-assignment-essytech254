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

const users = {}; // socket.id -> username

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('user-joined', { id: socket.id, username });
  });

  socket.on('send-message', ({ message, room }) => {
    const timestamp = new Date().toISOString();
    const username = users[socket.id];
    const payload = { message, username, timestamp };

    if (room) io.to(room).emit('receive-message', payload);
    else io.emit('receive-message', payload);
  });

  socket.on('typing', (isTyping) => {
    io.emit('user-typing', { username: users[socket.id], isTyping });
  });

  socket.on('private-message', ({ to, message }) => {
    const timestamp = new Date().toISOString();
    const username = users[socket.id];
    io.to(to).emit('private-message', { from: socket.id, username, message, timestamp });
  });

  socket.on('disconnect', () => {
    io.emit('user-left', { id: socket.id, username: users[socket.id] });
    delete users[socket.id];
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));