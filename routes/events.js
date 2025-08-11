const express = require('express');
const { LAMPORTS_PER_SOL } = require('@solana/web3.js');
const {
  getEvents,
  addEvent,
  findEvent,
  deleteEvent,
  saveEvents
} = require('../data/eventStore');

module.exports = (connection) => {
  const router = express.Router();

  router.get('/', (_req, res) => {
    res.json(getEvents());
  });

  router.post('/', (req, res) => {
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

    const event = addEvent({
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
    });

    res.status(201).json(event);
  });

  router.post('/:id/tickets', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { ticketIndex, quantity = 1, buyer, signature } = req.body;
    const event = findEvent(id);
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
    saveEvents();

    res.json({ success: true, event });
  });

  router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (!deleteEvent(id)) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ success: true });
  });

  return router;
};
