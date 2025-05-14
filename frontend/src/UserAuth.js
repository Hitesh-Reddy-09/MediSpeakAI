import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = 'http://localhost:5000';

function UserAuth() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch current user info on mount and after login/logout
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/current_user`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        if (data) {
          // If user is logged in, redirect to /chat
          navigate('/chat');
        }
      });
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  const handleLogout = () => {
    fetch(`${BACKEND_URL}/api/auth/logout`, {
      credentials: 'include',
    })
      .then(() => setUser(null));
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: 48,
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(24,90,157,0.18)',
        minWidth: 340,
        textAlign: 'center',
        maxWidth: 380,
        margin: '0 16px',
      }}>
        <img src="/favicon.ico" alt="MediSpeakAI Logo" style={{ width: 56, marginBottom: 18, borderRadius: 12, boxShadow: '0 2px 8px #43cea2' }} />
        <h1 style={{ fontSize: '2.1rem', margin: '0 0 10px', color: '#185a9d', fontWeight: 700, letterSpacing: 1 }}>Welcome to MediSpeakAI</h1>
        <p style={{ color: '#333', fontSize: '1.08rem', marginBottom: 28, opacity: 0.85 }}>
          Sign in to start your secure, AI-powered medical chat experience.
        </p>
        {!user ? (
          <button onClick={handleLogin} style={{
            padding: '14px 28px',
            fontSize: '18px',
            background: 'linear-gradient(90deg, #4285F4 0%, #43cea2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(66,133,244,0.13)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            margin: '0 auto',
            transition: 'background 0.2s, transform 0.2s',
          }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #43cea2 0%, #4285F4 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4285F4 0%, #43cea2 100%)'}
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 28, verticalAlign: 'middle', borderRadius: 4, background: '#fff', padding: 2 }} />
            <span>Sign in with Google</span>
          </button>
        ) : (
          <div>
            <img src={user.photo} alt={user.displayName} style={{ borderRadius: '50%', width: 70, marginBottom: 14, boxShadow: '0 2px 8px #43cea2' }} />
            <h2 style={{ color: '#185a9d', margin: '0 0 6px', fontWeight: 600 }}>Welcome, {user.displayName}!</h2>
            <p style={{ color: '#333', marginBottom: 18 }}>{user.email}</p>
            <button onClick={handleLogout} style={{
              padding: '10px 22px',
              fontSize: '16px',
              background: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: 10,
              fontWeight: 500,
              boxShadow: '0 2px 8px #d32f2f33',
              transition: 'background 0.2s, transform 0.2s',
            }}
              onMouseOver={e => e.currentTarget.style.background = '#b71c1c'}
              onMouseOut={e => e.currentTarget.style.background = '#d32f2f'}
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <footer style={{ marginTop: 32, color: '#fff', fontSize: 15, opacity: 0.8 }}>
        © {new Date().getFullYear()} MediSpeakAI
      </footer>
    </div>
  );
}

export default UserAuth;