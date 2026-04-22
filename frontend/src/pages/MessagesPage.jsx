import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import { messageService } from '../services/messageService';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { formatRelative } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiSend, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: conversations, isLoading } = useQuery('conversations', messageService.getConversations);

  useEffect(() => {
    if (selected) {
      messageService.getMessages(selected._id).then(setMessages).catch(() => setMessages([]));
      socket?.emit('join_conversation', selected._id);
    }
  }, [selected, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', (msg) => {
      if (msg.conversation === selected?._id) setMessages(prev => [...prev, msg]);
    });
    socket.on('user_typing', ({ userId, isTyping }) => {
      if (userId !== user._id) setTyping(isTyping);
    });
    return () => { socket.off('new_message'); socket.off('user_typing'); };
  }, [socket, selected, user]);

  const getUnreadCount = (conv) => {
    const unread = conv?.unreadCount;
    if (!unread || !user?._id) return 0;
    if (typeof unread.get === 'function') return unread.get(user._id) || 0; // rare: non-serialized Map
    return unread[user._id] || 0; // normal: JSON object from API
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    try {
      const content = newMsg.trim();
      setNewMsg('');
      await new Promise((resolve, reject) => {
        socket?.emit('send_message', { conversationId: selected._id, content }, (ack) => {
          if (ack?.success) return resolve(ack.data);
          reject(new Error(ack?.error || 'Failed to send'));
        });
      });
    } catch { toast.error('Failed to send message'); }
    setSending(false);
  };

  const handleTyping = (isTyping) => {
    if (selected) socket?.emit('typing', { conversationId: selected._id, isTyping });
  };

  const getOtherParticipant = (conv) =>
    conv.participants?.find(p => p._id !== user?._id);

  return (
    <>
      <Helmet><title>Messages | ተና SecondLoop</title></Helmet>
      <div className="h-[calc(100vh-10rem)] flex gap-0 bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-80 flex-shrink-0 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg flex items-center gap-2"><FiMessageCircle size={20} className="text-primary-orange" /> Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? <LoadingSpinner className="py-10" /> : (
              conversations?.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FiMessageCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations?.map(conv => {
                  const other = getOtherParticipant(conv);
                  const unread = getUnreadCount(conv);
                  return (
                    <button key={conv._id} onClick={() => setSelected(conv)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-orange-50 transition border-b text-left ${selected?._id === conv._id ? 'bg-orange-50' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-primary-orange text-white flex items-center justify-center font-bold flex-shrink-0">
                        {other?.name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-sm truncate">{other?.name || 'User'}</p>
                          <p className="text-xs text-gray-400">{conv.lastMessage?.createdAt ? formatRelative(conv.lastMessage.createdAt) : ''}</p>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage?.content || conv.product?.title || 'No messages yet'}</p>
                      </div>
                      {unread > 0 && <span className="bg-primary-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{unread}</span>}
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selected ? 'hidden md:flex' : 'flex'}`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FiMessageCircle size={60} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose a chat from the left to start messaging</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-orange text-white flex items-center justify-center font-bold text-sm">
                  {getOtherParticipant(selected)?.name?.[0]}
                </div>
                <div>
                  <p className="font-semibold">{getOtherParticipant(selected)?.name}</p>
                  {typing && <p className="text-xs text-primary-green">Typing…</p>}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => {
                  const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary-orange text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-orange-100' : 'text-gray-400'}`}>{formatRelative(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t flex gap-3 items-center">
                <input type="text" value={newMsg}
                  onChange={(e) => { setNewMsg(e.target.value); handleTyping(e.target.value.length > 0); }}
                  onBlur={() => handleTyping(false)}
                  placeholder="Type a message…"
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent" />
                <button type="submit" disabled={sending || !newMsg.trim()}
                  className="w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center hover:bg-orange-700 transition disabled:opacity-50">
                  <FiSend size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default MessagesPage;
