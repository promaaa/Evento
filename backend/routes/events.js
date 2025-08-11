import express from 'express';
import Event from '../models/Event.js';
import { Keypair, Transaction } from '@solana/web3.js';

const router = express.Router();

const secret = process.env.SOLANA_SECRET_KEY
  ? Uint8Array.from(JSON.parse(process.env.SOLANA_SECRET_KEY))
  : Keypair.generate().secretKey;
const serverKeypair = Keypair.fromSecretKey(secret);

// Create event
router.post('/', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List events
router.get('/', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Buy ticket
router.post('/:id/tickets', async (req, res) => {
  try {
    const { ticketIndex, quantity = 1, buyer, transaction } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    const ticket = event.tickets[ticketIndex];
    if (!ticket) return res.status(400).json({ error: 'Ticket not found' });
    if (ticket.sold + quantity > ticket.quantity) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    let signedTx = null;
    if (transaction) {
      const tx = Transaction.from(Buffer.from(transaction, 'base64'));
      tx.partialSign(serverKeypair);
      signedTx = tx.serialize({ requireAllSignatures: false }).toString('base64');
    }

    ticket.sold += quantity;
    event.raised += ticket.price * quantity;
    event.contributions.push({ buyer, amount: ticket.price * quantity, quantity });
    await event.save();

    res.json({ success: true, event, signedTransaction: signedTx });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
