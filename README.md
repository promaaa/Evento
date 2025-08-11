# Evento

Evento is an experimental ticketing and crowdfunding platform built on the **Solana** blockchain. It ships with a minimal in-memory API and an optional MongoDB-backed backend.

## Table of Contents
- [Project Overview](#project-overview)
- [Quick Start](#quick-start)
- [Full API with MongoDB](#full-api-with-mongodb)
- [Project Structure](#project-structure)
- [Additional Documentation](#additional-documentation)
- [GitHub Pages](#github-pages)
- [License](#license)

## Project Overview
- Create events with ticket tiers and monitor funds raised.
- Purchase tickets through direct SOL transfers using a Phantom wallet.
- Start with the simple in-memory API in `server.js` or switch to the MongoDB implementation in `backend/`.

## Quick Start
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the minimal API and web app**
   ```bash
   npm start
   ```
   The server exposes the REST API and serves `index.html` at [http://localhost:3000](http://localhost:3000).
3. **Use the interface**
   - Create an event or use one of the seeded examples.
   - Connect your Phantom wallet when prompted.
   - Purchasing a ticket will trigger a SOL transfer and submit the transaction signature to `/events/:id/tickets`.

## Full API with MongoDB
A richer API that persists events and contributions lives under [`backend/`](backend/). A separate `README` in that directory covers setup in detail, including required environment variables such as `MONGO_URI` and `SOLANA_SECRET_KEY`.

## Project Structure
```
.
├── index.html          # Web interface
├── server.js          # Minimal API (Express + in-memory storage)
├── package.json
├── backend/           # Full API with MongoDB
└── docs/              # Additional documentation
```

## Additional Documentation
- [Architecture overview](docs/architecture.md)

## GitHub Pages
The repository includes a workflow at `.github/workflows/pages.yml` that builds a static site containing `index.html` and the
contents of `docs/`. To publish:

1. Enable GitHub Pages in the repository settings and choose **GitHub Actions** as the source.
2. Push to `main` and the site will automatically deploy to the configured Pages URL.

The generated site serves the dApp on the root path and documentation under `/docs`.

## License
Distributed under the ISC license.
