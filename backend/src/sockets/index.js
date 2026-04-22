const jwt = require('jsonwebtoken');
const { Message, Conversation, Notification } = require('../models/index');

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) { next(new Error('Invalid token')); }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    socket.join(`user_${socket.userId}`);

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('send_message', async (data, ack) => {
      try {
        const { conversationId, content, type } = data;
        if (!conversationId || !content || !content.trim()) {
          if (typeof ack === 'function') ack({ success: false, error: 'Invalid payload' });
          return;
        }
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some(p => p.toString() === socket.userId)) {
          if (typeof ack === 'function') ack({ success: false, error: 'Not authorized' });
          return;
        }
        const cleanContent = content.trim();
        const message = await Message.create({ conversation: conversationId, sender: socket.userId, content: cleanContent, type: type || 'text' });
        conversation.lastMessage = { content: cleanContent, sender: socket.userId, createdAt: message.createdAt };
        const otherParticipant = conversation.participants.find(p => p.toString() !== socket.userId);
        const currentUnread = conversation.unreadCount.get(otherParticipant.toString()) || 0;
        conversation.unreadCount.set(otherParticipant.toString(), currentUnread + 1);
        await conversation.save();
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name profileImage');
        io.to(`conv_${conversationId}`).emit('new_message', populatedMessage);
        io.to(`user_${otherParticipant}`).emit('notification', { type: 'message', title: 'New Message', body: 'You have a new message', conversationId });
        if (typeof ack === 'function') ack({ success: true, data: populatedMessage });
      } catch (error) { console.error('Socket message error:', error); }
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', { userId: socket.userId, isTyping });
    });

    socket.on('mark_read', async (conversationId) => {
      await Message.updateMany({ conversation: conversationId, sender: { $ne: socket.userId }, isRead: false }, { isRead: true, readAt: new Date() });
      socket.to(`conv_${conversationId}`).emit('messages_read', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

module.exports = { setupSocket };
