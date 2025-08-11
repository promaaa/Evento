const express = require('express');
const cors = require('cors');
const path = require('path');
const { Connection, clusterApiUrl } = require('@solana/web3.js');


// Reusable Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'),
  'confirmed',
);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Store simple in-memory sessions
const sessions = new Map();

const eventsRouter = require('./routes/events')(connection);
app.use('/events', eventsRouter);

app.post('/auth/wallet', (req, res) => {
  const { publicKey } = req.body;
  if (!publicKey) {
    return res.status(400).json({ error: 'Missing publicKey' });
  }
  sessions.set(publicKey, { authenticated: true });
  console.log('Wallet connected:', publicKey);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

export default app;
