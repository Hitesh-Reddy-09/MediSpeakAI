// models/Chat.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String },
  audioUrl: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
    