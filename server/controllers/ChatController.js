const users = {}; // socket.id -> { username, room, online }

function handleJoin(io, socket, { username, room }) {
  users[socket.id] = { username, room, online: true };
  socket.join(room);
  io.emit('user-list', getUserList());
  io.to(room).emit('receive-message', {
    message: `${username} joined the chat`,
    username: 'System',
    timestamp: new Date().toISOString()
  });
}

function handleMessage(io, socket, { message }) {
  const user = users[socket.id];
  if (!user) return;
  const timestamp = new Date().toISOString();
  io.to(user.room).emit('receive-message', {
    message,
    username: user.username,
    timestamp
  });
}

function handleTyping(io, socket, isTyping) {
  const user = users[socket.id];
  if (!user) return;
  socket.to(user.room).emit('user-typing', { username: user.username, isTyping });
}

function handleDisconnect(io, socket) {
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
}

function getUserList() {
  return Object.values(users).map((u) => ({ username: u.username, room: u.room, online: u.online }));
}

module.exports = {
  users,
  handleJoin,
  handleMessage,
  handleTyping,
  handleDisconnect,
  getUserList
};