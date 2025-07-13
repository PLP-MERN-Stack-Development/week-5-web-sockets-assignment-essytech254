import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [typingStatus, setTypingStatus] = useState('');

  useEffect(() => {
    socket.on('receive-message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user-typing', ({ username, isTyping }) => {
      setTypingStatus(isTyping ? `${username} is typing...` : '');
    });
  }, []);

  const handleJoin = () => {
    socket.emit('join', username);
    setJoined(true);
  };

  const sendMessage = () => {
    socket.emit('send-message', { message });
    setMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing', message.length > 0);
  };

  return (
    <div>
      {!joined ? (
        <div>
          <input placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <button onClick={handleJoin}>Join</button>
        </div>
      ) : (
        <div>
          <div>
            {messages.map((msg, idx) => (
              <div key={idx}><strong>{msg.username}:</strong> {msg.message} <small>{msg.timestamp}</small></div>
            ))}
            <div>{typingStatus}</div>
          </div>
          <input
            placeholder="Message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;