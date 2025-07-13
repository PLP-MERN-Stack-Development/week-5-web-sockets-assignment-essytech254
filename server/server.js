const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const socketHandler = require('./socket');

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

// Initialize Socket.io logic
socketHandler(io);

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
