import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './index.css';

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
    if (!username.trim()) return;
    socket.emit('join', username);
    setJoined(true);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit('send-message', { message });
    setMessage('');
  };

  const handleTyping = () => {
    socket.emit('typing', message.length > 0);
  };

  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full text-center">
          <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
            <span className="text-white text-2xl">💬</span>
          </div>
          <h1 className="text-2xl font-bold mt-4">Welcome to ConnectChat</h1>
          <p className="text-gray-600 text-sm mt-2">Real-time messaging made simple. Enter your username to get started.</p>
          <input
            type="text"
            className="w-full border rounded-lg px-4 py-2 mt-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">Choose a name that others will see in the chat</p>
          <button
            className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 rounded-lg font-semibold"
            onClick={handleJoin}
          >
            Start Chatting
          </button>
          <p className="text-xs text-gray-400 mt-4">No registration required • Join instantly</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white rounded shadow p-4 mb-4">
        <div className="h-96 overflow-y-auto space-y-2">
          {messages.map((msg, idx) => (
            <div key={idx} className="p-2 border rounded-md">
              <strong>{msg.username}</strong>: {msg.message}
              <div className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
          {typingStatus && <div className="text-sm italic text-gray-500">{typingStatus}</div>}
        </div>
        <div className="flex mt-4">
          <input
            className="flex-1 border rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
          />
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-r"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
