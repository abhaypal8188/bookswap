import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Send, X } from 'lucide-react';

const Chat = ({ exchangeId, otherUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (socket && exchangeId) {
      socket.emit('join_chat', exchangeId);

      socket.on('receive_message', (data) => {
        setMessages((prev) => [...prev, data]);
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
      }
    };
  }, [socket, exchangeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      exchangeId,
      senderId: user._id,
      message: newMessage,
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 glass-panel flex flex-col h-[500px] z-50 overflow-hidden border border-primary/30 shadow-2xl shadow-primary/20">
      <div className="bg-dark/80 backdrop-blur p-4 border-b border-glass-border flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={otherUser.avatar} alt={otherUser.name} className="w-8 h-8 rounded-full" />
          <h3 className="font-semibold text-white">{otherUser.name}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user._id;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-dark text-gray-200 border border-glass-border rounded-tl-sm'}`}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 bg-dark/50 border-t border-glass-border flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-dark border border-glass-border rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
        />
        <button type="submit" className="bg-primary hover:bg-primary-600 text-white p-2 rounded-full transition-colors flex-shrink-0 flex items-center justify-center h-10 w-10">
          <Send size={16} className="-ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
