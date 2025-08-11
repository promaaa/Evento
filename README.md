# Evento

Evento is an experimental ticketing and crowdfunding platform built on the **Solana** blockchain. It provides a single-page web interface (HTML/JavaScript) to create events, sell tickets and verify on-chain payments. The API is built with **Node.js** and **Express**; a more complete MongoDB-backed implementation lives in the `backend` directory.

## Key Features

- Phantom wallet connection and verification on the Solana *devnet*.
- Create events and manage a ticket list.
- Purchase tickets with SOL transfers and update the collected amount.
- Simple REST API (`server.js`) or full database-backed API (`backend/`).

## Requirements

- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- [npm](https://www.npmjs.com/) (ships with Node.js)
- Optional: [MongoDB](https://www.mongodb.com/) if using the full version in `backend/`

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <REPO_URL>
   cd Evento
   ```

2. **Install dependencies for the minimal API**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   This serves both the API and the `index.html` interface at `http://localhost:3000`.

4. **Test ticket purchases**
   - Connect your Phantom wallet to the `devnet`.
   - Create an event or use the default ones.
   - Select a ticket and follow the on-screen instructions to sign the transaction.

## Using the full API with MongoDB

An advanced version of the API is available in the `backend/` folder.

1. **Installation**
   ```bash
   cd backend
   npm install
   ```

2. **Environment variables**
   Create a `.env` file at the root of `backend/` containing, for example:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/evento
   SOLANA_SECRET_KEY=[0,1,2,...]
   ```
   - `MONGO_URI`: MongoDB connection URI.
   - `SOLANA_SECRET_KEY`: server wallet secret key (64-element JSON array).

3. **Start the full API**
   ```bash
   npm start
   ```
   The API also listens on `http://localhost:3000`.

4. **Consume the API**
   The `index.html` interface can be used as-is. Exposed routes include `GET /events`, `POST /events`, `POST /events/:id/tickets`…

## Project Structure

```
.
├── index.html          # Web interface
├── server.js            # Minimal API (Express + in-memory storage)
├── package.json
└── backend/             # Full API with MongoDB
    ├── models/          # Mongoose schemas
    ├── routes/          # Express routes
    └── server.js        # Entry point for the full API
```

## Deploying to GitHub Pages

1. Ensure `index.html` is committed in the repository root or a `docs/` folder.
2. Push the repository to GitHub and enable **GitHub Pages** in the repository settings.
3. The page assumes the API is served from the same origin. If your API is hosted elsewhere, set `window.API_BASE` before loading the script.

## Development

- The Express API uses `cors` and `express.json`.
- Solana transactions are verified via `@solana/web3.js` on the `devnet` network.
- The MongoDB version persists events, tickets and contributions.

## License

Project distributed under the ISC license.
