// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();

// @route   GET /api/auth/google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Redirect to frontend or send user info
    res.redirect('http://localhost:3000/chat'); // Change to your frontend URL if needed
  }
);

// @route   GET /api/auth/logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.send({ success: true, message: 'Logged out' });
  });
});

// @route   GET /api/auth/current_user
router.get('/current_user', (req, res) => {
  res.json(req.user || null);
});

module.exports = router;