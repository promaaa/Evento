const express = require('express');
const cors = require('cors');
const path = require('path');
const { Connection, clusterApiUrl } = require('@solana/web3.js');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

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
    title: '42 School Hackathon',
    organization: '42 School',
    goal: 5000,
    raised: 1500,
    description:
      '48 hours of creativity and coding for students and enthusiasts.',
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
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
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',

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
      'The largest student gala in Europe organized by Ecole Polytechnique.',
    imageUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',

    beneficiaryWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    creatorWallet: '4iT7RMdXsunRWfhCpR4DSGMXPmcxUWnj6Dh4xQFvkGrr',
    type: 'event',
    tickets: [
      { id: 1, name: 'Standard Entry', price: 1.2, quantity: 300, sold: 120 },
      { id: 2, name: 'VIP Entry', price: 2.5, quantity: 100, sold: 40 }
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

// Create a PaymentIntent for a given amount
app.post('/payments/create-intent', async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
  if (!amount) {
    return res.status(400).json({ error: 'Missing amount' });
  }
  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (err) {
    console.error('Payment intent creation failed', err);
    res.status(500).json({ error: 'Payment intent creation failed' });
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
app.post('/events/:id/tickets', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { ticketIndex, quantity = 1, buyer, paymentIntentId } = req.body;
  const event = events.find(e => e.id === id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const ticket = event.tickets[ticketIndex];
  if (!ticket) return res.status(400).json({ error: 'Ticket not found' });
  if (ticket.sold + quantity > ticket.quantity) {
    return res.status(400).json({ error: 'Not enough tickets available' });
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Invalid payment intent' });
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
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
