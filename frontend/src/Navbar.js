// src/components/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ user, onLogout }) {
  const { pathname } = useLocation();
  // don’t show on sign-in
  if (pathname === '/signin') return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/chat" className={`nav-link ${pathname === '/chat' ? 'active' : ''}`}>
          Chat
        </Link>
      </div>
      <div className="navbar-right">
        {user && (
          <>
            <img src={user.photo} alt={user.displayName} className="avatar" />
            <span className="username">{user.displayName}</span>
          </>
        )}
        <button onClick={onLogout} className="btn logout">Logout</button>
      </div>
    </nav>
  );
}
