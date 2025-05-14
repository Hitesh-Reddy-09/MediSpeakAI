// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const cors = require('cors');

// Models & Routes
const User = require('./models/User');
const authRoutes = require('./server/auth');
const aiRoutes = require('./server/ai');

// Passport Google Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// --- 1) CORS & JSON parsing (must come before your routes) ---
app.use(
  cors({
    origin: 'http://localhost:3000', // front-end origin
    credentials: true,               // allow cookies
  })
);
app.use(express.json());

// --- 2) Serve generated TTS audio files ---
app.use(
  '/ai-audio',
  express.static(path.join(__dirname, 'public', 'ai-audio'))
);

// --- 3) MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- 4) Session Middleware ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

// --- 5) Passport Initialization ---
app.use(passport.initialize());
app.use(passport.session());

// --- 6) Passport Google OAuth Strategy ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check for existing user
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        // Create new user
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value,
        });
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// --- 7) Passport session serialization ---
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// --- 8) Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// --- 9) Health Check / Root Redirect ---
app.get('/', (req, res) => {
  res.send('Speech2Speech AI backend is running.');
});

// --- 10) Error Handler (optional) ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// --- 11) Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
