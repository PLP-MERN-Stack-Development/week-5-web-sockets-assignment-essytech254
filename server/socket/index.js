const { handleJoin, handleMessage, handleTyping, handleDisconnect, users, getUserList } = require('../controllers/chatController');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (data) => handleJoin(io, socket, data));
    socket.on('send-message', (data) => handleMessage(io, socket, data));
    socket.on('typing', (isTyping) => handleTyping(io, socket, isTyping));
    socket.on('disconnect', () => handleDisconnect(io, socket));
  });
};