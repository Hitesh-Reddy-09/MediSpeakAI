import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const BACKEND_URL = 'http://localhost:5000';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('Click the mic to talk');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Protect route: check if user is logged in and get user info
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/current_user`, { credentials: 'include' })
      .then(res => res.json())
      .then(user => {
        if (!user) {
          navigate('/signin');
        } else {
          setUser(user);
          setLoading(false);
        }
      });
  }, [navigate]);

  // In Chat.js, inside useEffect after loading the user:
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/ai/history`, { credentials: 'include' })
      .then(res => res.json())
      .then(history => {
        // Mark all history messages as fromHistory
        setMessages(history.map(msg => ({ ...msg, fromHistory: true, id: msg._id || Date.now() + Math.random() })));
      });
  }, []);

  const handleLogout = () => {
    fetch('http://localhost:5000/api/auth/logout', {
      credentials: 'include',
    })
      .then(() => {
        // Redirect to /signin after logout
        window.location.href = '/LandingPage';
        // OR, if using react-router's useNavigate:
        // navigate('/signin');
      });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('SpeechRecognition is not supported');
      return;
    }

    setIsListening(true);
    setStatus('Listening...');
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      const newUserMessage = { id: Date.now(), text: transcript, sender: 'user' };
      setMessages(prev => [...prev, newUserMessage]);
      setStatus('Processing your request...');
      await sendToBackend(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setStatus(`Error in recognition: ${event.error}`);
      setIsListening(false);
    };

    recognition.start();
  };

  const sendToBackend = async (text) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userText: text }),
        credentials: 'include'
      });

      if (!response.ok) {
        // attempt to read JSON error details
        let errBody;
        try {
          errBody = await response.json();
        } catch {}
        console.error('API error details:', errBody);
        throw new Error(`HTTP ${response.status}: ${errBody?.error || response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const newAiMessage = { id: Date.now() + 1, audioUrl: url, sender: 'ai', fromHistory: false };
      setMessages(prev => [...prev, newAiMessage]);
      setStatus('AI responded. Click the mic for new interaction.');
    } catch (error) {
      console.error('sendToBackend caught:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error processing speech: ${error.message}`,
        sender: 'system'
      };
      setMessages(prev => [...prev, errorMessage]);
      setStatus('Error processing. Try again.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="app-container" style={{
      minHeight: '90vh',
      background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
      borderRadius: 24,
      boxShadow: '0 8px 32px rgba(24,90,157,0.18)',
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 800,
      margin: '40px auto',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Chat Header */}
      <header className="chat-header" style={{
        background: 'rgba(255,255,255,0.95)',
        padding: '32px 24px 18px 24px',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottom: '1px solid #e0e0e0',
        textAlign: 'center',
      }}>
        <img src="/favicon.ico" alt="MediSpeakAI" style={{ width: 44, marginBottom: 8, borderRadius: 8, boxShadow: '0 2px 8px #43cea2' }} />
        <h1 style={{ fontSize: '1.5rem', margin: '0 0 6px', color: '#185a9d', fontWeight: 700, letterSpacing: 1 }}>MediSpeakAI Chat</h1>
        <p className="status-text" style={{ color: '#43cea2', fontWeight: 500, fontSize: 15, margin: 0 }}>{status}</p>
      </header>

      {/* Messages */}
      <main className="chat-window" style={{
        flex: 1,
        padding: '24px 16px',
        background: 'linear-gradient(135deg, #e0f7fa 0%, #fce4ec 100%)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        minHeight: 0,
        maxHeight: '100%',
      }}>
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.sender}`} style={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : msg.sender === 'ai' ? 'flex-start' : 'center',
            background: msg.sender === 'user' ? 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)' : msg.sender === 'ai' ? '#fff' : '#ffebee',
            color: msg.sender === 'user' ? '#fff' : msg.sender === 'ai' ? '#185a9d' : '#b71c1c',
            borderRadius: 18,
            borderBottomRightRadius: msg.sender === 'user' ? 6 : 18,
            borderBottomLeftRadius: msg.sender === 'ai' ? 6 : 18,
            boxShadow: msg.sender === 'ai' ? '0 2px 8px rgba(24,90,157,0.08)' : 'none',
            padding: '14px 18px',
            marginBottom: 2,
            maxWidth: '80%',
            fontSize: 16,
            fontWeight: 500,
            wordBreak: 'break-word',
          }}>
            {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}
            {msg.audioUrl && (
              <audio src={msg.audioUrl} controls autoPlay={msg.sender === 'ai' && !msg.fromHistory} style={{ marginTop: 8, width: '100%' }} />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Mic Button */}
      <footer className="chat-input-area" style={{
        background: 'rgba(255,255,255,0.95)',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        borderTop: '1px solid #e0e0e0',
        padding: '18px 0',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <button
          onClick={startListening}
          disabled={isListening}
          className="mic-button"
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: 'none',
            background: isListening
              ? 'linear-gradient(135deg, #ff6f61 0%, #ffb88c 100%)'
              : 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
            boxShadow: '0 4px 16px rgba(24, 90, 157, 0.18)',
            cursor: isListening ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, transform 0.2s',
            fontSize: 32,
            color: '#fff',
            outline: 'none',
          }}
        >
          <span className="mic-icon">{isListening ? '🔴' : '🎙️'}</span>
        </button>
      </footer>
    </div>
  );
}

export default Chat;