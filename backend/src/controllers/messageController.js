const { Conversation, Message, Notification } = require('../models/index');
const { apiError } = require('../utils/apiError');
const { asyncHandler } = require('../utils/asyncHandler');

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id, isActive: true }).populate('participants', 'name profileImage').populate('product', 'title images').sort({ updatedAt: -1 });
  res.json({ success: true, data: conversations, timestamp: new Date().toISOString() });
});

const getMessages = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) throw apiError(404, 'Conversation not found');
  if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) throw apiError(403, 'Not authorized');
  const messages = await Message.find({ conversation: req.params.conversationId, isDeleted: false }).populate('sender', 'name profileImage').sort({ createdAt: 1 });
  await Message.updateMany({ conversation: req.params.conversationId, sender: { $ne: req.user._id }, isRead: false }, { isRead: true, readAt: new Date() });
  conversation.unreadCount.set(req.user._id.toString(), 0);
  await conversation.save();
  res.json({ success: true, data: messages, timestamp: new Date().toISOString() });
});

const createConversation = asyncHandler(async (req, res) => {
  const { otherUserId, productId } = req.body;
  let conversation = await Conversation.findOne({ participants: { $all: [req.user._id, otherUserId] }, product: productId });
  if (!conversation) {
    conversation = await Conversation.create({ participants: [req.user._id, otherUserId], product: productId, unreadCount: new Map() });
  }
  await conversation.populate('participants', 'name profileImage');
  await conversation.populate('product', 'title images');
  res.json({ success: true, data: conversation, timestamp: new Date().toISOString() });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, type } = req.body;
  const conversation = await Conversation.findById(req.params.conversationId);
  if (!conversation) throw apiError(404, 'Conversation not found');
  if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) throw apiError(403, 'Not authorized');
  const message = await Message.create({ conversation: conversation._id, sender: req.user._id, content, type: type || 'text' });
  conversation.lastMessage = { content, sender: req.user._id, createdAt: message.createdAt };
  const otherParticipant = conversation.participants.find(p => p.toString() !== req.user._id.toString());
  const currentUnread = conversation.unreadCount.get(otherParticipant.toString()) || 0;
  conversation.unreadCount.set(otherParticipant.toString(), currentUnread + 1);
  await conversation.save();
  const populatedMessage = await Message.findById(message._id).populate('sender', 'name profileImage');
  res.status(201).json({ success: true, data: populatedMessage, timestamp: new Date().toISOString() });
});

module.exports = { getConversations, getMessages, createConversation, sendMessage };
