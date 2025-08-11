# Backend API

This folder contains a MongoDB-backed version of the Evento API. It uses Express and Mongoose to persist events, tickets and contributions.

## Setup
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   Create a `.env` file in this directory:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/evento
   SOLANA_SECRET_KEY=[0,1,2,...]  # JSON array of 64 numbers
   ```
3. **Start the server**
   ```bash
   npm start
   ```

The API listens on `http://localhost:3000` by default and exposes routes under `/events`.

## Available Endpoints
- `GET /events` — list events.
- `POST /events` — create an event.
- `POST /events/:id/tickets` — purchase a ticket and optionally partially sign a transaction.

Data shapes mirror those used by the minimal `server.js` implementation.
