// Minimal Express auth server (example)
// Run: cd examples/auth/server && npm install && npm start

const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Enable CORS for local frontend testing; adjust origin in production
app.use(cors({ origin: true, credentials: true }));

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret_for_demo';

// In-memory user store for example only
const users = new Map(); // key = email -> { id, email, name, passwordHash }

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
}

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  if (users.has(email)) return res.status(409).json({ message: 'Email already exists' });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), email, name: name || '', passwordHash };
    users.set(email, user);
    const token = signToken(user);
    // Set HttpOnly cookie (for demo; in production ensure secure cookie + HTTPS)
    res.cookie('access_token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
    return res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  const user = users.get(email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user);
  res.cookie('access_token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
  return res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

function authMiddleware(req, res, next) {
  const token = req.cookies.access_token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/me', authMiddleware, (req, res) => {
  const user = users.get(req.user.email);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('access_token');
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Auth example server listening on http://localhost:${PORT}`));
