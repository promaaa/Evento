const express = require('express');
const cors = require('cors');
const { Connection, clusterApiUrl } = require('@solana/web3.js');

const app = express();
app.use(cors());
app.use(express.json());

// Store simple in-memory sessions
const sessions = new Map();
// Store simple in-memory events
const events = [];
let nextEventId = 1;

app.post('/auth/wallet', (req, res) => {
  const { publicKey } = req.body;
  if (!publicKey) {
    return res.status(400).json({ error: 'Missing publicKey' });
  }
  sessions.set(publicKey, { authenticated: true });
  console.log('Wallet connected:', publicKey);
  res.json({ success: true });
});

app.post('/purchase', async (req, res) => {
  const { signature } = req.body;
  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }
  try {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const status = await connection.getSignatureStatus(signature);
    res.json({ success: true, status: status.value });
  } catch (err) {
    console.error('Verification failed', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Create a new event
app.post('/events', (req, res) => {
  const { name, date, location } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }
  const event = { id: nextEventId++, name, date, location };
  events.push(event);
  res.status(201).json(event);
});

// Delete an event by id
app.delete('/events/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = events.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }
  events.splice(index, 1);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
