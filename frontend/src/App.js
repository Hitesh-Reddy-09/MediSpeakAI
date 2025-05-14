// src/App.js
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Navbar from './Navbar';
import LandingPage from './LandingPage';
import UserAuth from './UserAuth';
import Chat from './Chat';

const BACKEND_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // On mount, fetch current user
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/current_user`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(u => setUser(u || null))
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = () => {
    fetch(`${BACKEND_URL}/api/auth/logout`, {
      credentials: 'include'
    }).then(() => {
      setUser(null);
    });
  };

  if (checking) return <div>Loading…</div>;

  return (
    <Router>
      {/* Navbar now appears on all routes except /signin (per Navbar.js logic) */}
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/signin"
          element={
            !user
              ? <UserAuth onSignIn={u => setUser(u)} />
              : <Navigate to="/chat" replace />
          }
        />

        <Route
          path="/chat"
          element={
            user
              ? <Chat />
              : <Navigate to="/signin" replace />
          }
        />

        {/* Any unknown URL sends user back to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
