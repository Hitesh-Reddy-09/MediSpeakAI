// src/components/LandingPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const BACKEND_URL = 'http://localhost:5000';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/current_user`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data) {
        navigate('/chat');
      } else {
        navigate('/signin');
      }
    } catch (err) {
      console.error('Auth check failed', err);
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      <header className="hero">
        <div className="hero-content">
          <h1>Speak • See • Diagnose</h1>
          <p>
            Welcome to MediSpeakAI — where your voice and images become instant medical insights.
            Chat naturally, upload an image, and get guided advice in seconds.
          </p>
          <button
            onClick={handleGetStarted}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Checking…' : 'Get Started'}
          </button>
        </div>
      </header>

      <section className="features">
        <div className="feature-card">
          <h3>Voice-Driven Chat</h3>
          <p>Describe symptoms and ask follow-up questions hands-free.</p>
        </div>
        <div className="feature-card">
          <h3>Image Analysis</h3>
          <p>Snap photos of rashes, X-rays, or wounds & receive AI-powered feedback.</p>
        </div>
        <div className="feature-card">
          <h3>Secure & Private</h3>
          <p>All data is end-to-end encrypted—your health info stays with you.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} MediSpeakAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
