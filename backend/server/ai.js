// backend/routes/ai.js

const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');
const fs = require('fs');
const Chat = require('../models/Chat');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * Ensure the user is logged in
 */
function ensureAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

/**
 * POST /api/ai/process
 * 1. Save the user's message
 * 2. Call Gemini for an AI response
 * 3. Convert that response to speech (Google TTS)
 * 4. Save both text+audio URL into the Chat document
 * 5. Stream the audio back to the client
 */
router.post('/process', ensureAuth, async (req, res) => {
  const { userText } = req.body;
  if (!userText || !userText.trim()) {
    return res.status(400).json({ error: 'Empty input text' });
  }

  let chat;
  try {
    // fetch or create the user's chat session
    chat = await Chat.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    if (!chat) chat = new Chat({ user: req.user._id, messages: [] });

    // push the user's message
    chat.messages.push({ sender: 'user', text: userText });
    await chat.save();
  } catch (err) {
    console.error('[DB] Error saving user message:', err);
    return res.status(500).json({ error: 'Database error (user message)' });
  }

  let aiText;
  try {
    // call Gemini
    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: "You are an AI Medical Doctor. Reply with concise, empathetic, clinically accurate guidance suitable for voice playback."
            }]
          },
          contents: [{ parts: [{ text: userText }] }]
        })
      }
    );
    if (!geminiResp.ok) {
      const body = await geminiResp.text();
      throw new Error(`Gemini API ${geminiResp.status}: ${body}`);
    }
    const geminiData = await geminiResp.json();
    aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) throw new Error('No AI text returned');
  } catch (err) {
    console.error('[Gemini] Error generating AI text:', err);
    return res.status(500).json({ error: 'AI generation error', details: err.message });
  }

  let audioBuffer;
  try {
    // fetch TTS audio
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(aiText)}`;
    const ttsResp = await fetch(ttsUrl);
    if (!ttsResp.ok) {
      const body = await ttsResp.text();
      throw new Error(`TTS API ${ttsResp.status}: ${body}`);
    }
    audioBuffer = await ttsResp.arrayBuffer();
  } catch (err) {
    console.error('[TTS] Error fetching audio:', err);
    return res.status(500).json({ error: 'Text-to-speech error', details: err.message });
  }

  let audioUrl;
  try {
    // write the mp3 to disk under public/ai-audio
    const fileName = `tts-${req.user._id}-${Date.now()}.mp3`;
    const publicDir = path.join(__dirname, '../public/ai-audio');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(audioBuffer));
    audioUrl = `${BACKEND_URL}/ai-audio/${fileName}`;
  } catch (err) {
    console.error('[FS] Error saving audio file:', err);
    return res.status(500).json({ error: 'Server error saving audio' });
  }

  try {
    // push the AI message
    chat.messages.push({ sender: 'ai', text: aiText, audioUrl });
    await chat.save();
  } catch (err) {
    console.error('[DB] Error saving AI message:', err);
    // continue to send audio back even if DB save fails
  }

  // finally, stream the audio back
  res.set('Content-Type', 'audio/mpeg');
  res.send(Buffer.from(audioBuffer));
});

/**
 * GET /api/ai/history
 * Returns the current user's latest chat messages.
 */
router.get('/history', ensureAuth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    return res.json(chat ? chat.messages : []);
  } catch (err) {
    console.error('[History] Fetch error:', err);
    return res.status(500).json({ error: 'Error fetching chat history' });
  }
});

module.exports = router;
