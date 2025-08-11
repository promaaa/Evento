import express from 'express';
import cors from 'cors';
import path from 'path';
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reusable Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || clusterApiUrl('devnet'),
  'confirmed'
);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Store simple in-memory sessions
const sessions = new Map();
// In-memory events with sample data
const events = [
  {
    id: 1,
    title: 'Ecole 42 Hackathon',
    organization: 'Ecole 42',
    goal: 5000,
    raised: 1500,
    description:
      '48 hours of creativity and coding for students and enthusiasts.',
    imageUrl:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    type: 'event',
    tickets: [
      { id: 1, name: 'Day Pass', price: 0.5, quantity: 100, sold: 20 },
      { id: 2, name: 'Weekend Pass', price: 0.9, quantity: 80, sold: 10 }
    ],
    contributions: []
  },
  {
    id: 2,
    title: 'Centrale Lyon Challenge',
    organization: 'Centrale Lyon',
    goal: 7000,
    raised: 3000,
    description:
      'Inter-school sports tournament with various disciplines and a festive atmosphere.',
    imageUrl:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',

    beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    type: 'event',
    tickets: [
      { id: 1, name: 'Spectator Pass', price: 0.3, quantity: 200, sold: 50 },
      { id: 2, name: 'Competitor Pass', price: 0.6, quantity: 150, sold: 30 }
    ],
    contributions: []
  },
  {
    id: 3,
    title: 'Polytechnique Point Gamma',
    organization: 'Ecole Polytechnique',
    goal: 10000,
    raised: 4500,
    description:
      'The largest student festival in France organized by Ecole Polytechnique.',
    imageUrl:
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',

    beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    type: 'event',
    tickets: [
      { id: 1, name: 'Standard Entry', price: 1.2, quantity: 300, sold: 120 },
      { id: 2, name: 'VIP Entry', price: 2.5, quantity: 100, sold: 40 }
    ],
    contributions: []
  },
  {
    id: 4,
    title: 'Solana Foundation Conference Paris',
    organization: 'Solana Foundation',
    goal: 8000,
    raised: 0,
    description:
      'A flagship Solana conference hosted by the Solana Foundation in Paris. Talks, workshops and ecosystem showcases.',
    imageUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    type: 'event',
    tickets: [
      { id: 1, name: 'General Admission', price: 0.8, quantity: 400, sold: 0 },
      { id: 2, name: 'Builder Pass', price: 1.2, quantity: 200, sold: 0 },
      { id: 3, name: 'VIP', price: 2.0, quantity: 50, sold: 0 }
    ],
    contributions: []
  }
];

let nextEventId = 4;

app.post('/auth/wallet', (req, res) => {
  const { publicKey } = req.body;
  if (!publicKey) {
    return res.status(400).json({ error: 'Missing publicKey' });
  }
  sessions.set(publicKey, { authenticated: true });
  console.log('Wallet connected:', publicKey);
  res.json({ success: true });
});

// (Removed stripe payment intent route; payments are handled via on-chain transfers)

// List all events
app.get('/events', (_req, res) => {
  res.json(events);
});

// Create a new event
app.post('/events', (req, res) => {
  const {
    title,
    organization,
    goal,
    description,
    imageUrl,
    beneficiaryWallet,
    creatorWallet,
    tickets = [],
    date
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Missing title' });
  }

  const event = {
    id: nextEventId++,
    title,
    organization,
    goal,
    raised: 0,
    description,
    imageUrl,
    beneficiaryWallet,
    creatorWallet,
    type: 'event',
    tickets,
    date,
    contributions: []
  };

  events.push(event);
  res.status(201).json(event);
});

// Update ticket sales for an event
app.post('/events/:id/tickets', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { ticketIndex, quantity = 1, buyer, signature } = req.body;
  const event = events.find(e => e.id === id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const ticket = event.tickets[ticketIndex];
  if (!ticket) return res.status(400).json({ error: 'Ticket not found' });
  if (ticket.sold + quantity > ticket.quantity) {
    return res.status(400).json({ error: 'Not enough tickets available' });
  }
  if (!signature) {
    return res.status(400).json({ error: 'Missing transaction signature' });
  }

  try {
    const tx = await connection.getParsedTransaction(signature, {
      commitment: 'confirmed',
    });
    if (!tx || tx.meta?.err) {
      return res.status(400).json({ error: 'Transaction not confirmed' });
    }

    const transferIx = tx.transaction.message.instructions.find(
      (ix) => ix.program === 'system' && ix.parsed?.type === 'transfer'
    );
    if (!transferIx) {
      return res.status(400).json({ error: 'No transfer instruction' });
    }

    const { destination, lamports, source } = transferIx.parsed.info;
    const expectedLamports = Math.round(ticket.price * quantity * LAMPORTS_PER_SOL);

    if (source !== buyer) {
      return res.status(400).json({ error: 'Source wallet mismatch' });
    }
    if (destination !== event.beneficiaryWallet) {
      return res.status(400).json({ error: 'Incorrect destination wallet' });
    }
    if (lamports < expectedLamports) {
      return res.status(400).json({ error: 'Insufficient amount transferred' });
    }
  } catch (err) {
    console.error('Transaction verification failed', err);
    return res.status(400).json({ error: 'Transaction verification failed' });
  }

  ticket.sold += quantity;
  event.raised += ticket.price * quantity;
  event.contributions.push({ buyer, amount: ticket.price * quantity, quantity, signature });

  res.json({ success: true, event });
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
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

export default app;
