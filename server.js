const express = require('express');
const cors = require('cors');
const { Connection, clusterApiUrl } = require('@solana/web3.js');

const app = express();
app.use(cors());
app.use(express.json());

// Store simple in-memory sessions
const sessions = new Map();
// In-memory events with sample data
const events = [
  {
    id: 1,
    title: "Hackaton de l'École 42",
    organization: 'École 42',
    goal: 5000,
    raised: 1500,
    description:
      "48 heures de créativité et de programmation pour les étudiants et passionnés de code.",
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    type: 'event',
    tickets: [
      { id: 1, name: 'Pass Journée', price: 15, quantity: 100, sold: 20 },
      { id: 2, name: 'Pass Week-end', price: 25, quantity: 80, sold: 10 }
    ],
    contributions: []
  },
  {
    id: 2,
    title: 'Challenge Centrale Lyon',
    organization: 'Centrale Lyon',
    goal: 7000,
    raised: 3000,
    description:
      "Tournoi sportif inter-écoles avec des disciplines variées et une ambiance festive.",
    imageUrl:
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',

    beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    type: 'event',
    tickets: [
      { id: 1, name: 'Pass Spectateur', price: 10, quantity: 200, sold: 50 },
      { id: 2, name: 'Pass Compétiteur', price: 20, quantity: 150, sold: 30 }
    ],
    contributions: []
  },
  {
    id: 3,
    title: "Point Gamma de l'X",
    organization: 'École Polytechnique',
    goal: 10000,
    raised: 4500,
    description:
      "Le plus grand gala étudiant d'Europe organisé par l'École Polytechnique.",
    imageUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',

    beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    type: 'event',
    tickets: [
      { id: 1, name: 'Entrée Standard', price: 30, quantity: 300, sold: 120 },
      { id: 2, name: 'Entrée VIP', price: 60, quantity: 100, sold: 40 }
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
app.post('/events/:id/tickets', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { ticketIndex, quantity = 1, buyer } = req.body;
  const event = events.find(e => e.id === id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const ticket = event.tickets[ticketIndex];
  if (!ticket) return res.status(400).json({ error: 'Ticket not found' });
  if (ticket.sold + quantity > ticket.quantity) {
    return res.status(400).json({ error: 'Not enough tickets available' });
  }

  ticket.sold += quantity;
  event.raised += ticket.price * quantity;
  event.contributions.push({ buyer, amount: ticket.price * quantity, quantity });

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
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
