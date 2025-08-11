Evento – Solana-powered Events and Funding (Phantom Wallet)

Overview
- Single-page app for launching events, selling tickets, and funding initiatives on Solana using Phantom.
- Works as a static site (GitHub Pages) with optional Node server for local development.

Live Features
- Connect Phantom on Devnet, display wallet balance, buy tickets via on-chain SOL transfer.
- Transaction verification is handled client-side for static deployments (and server-side when running the Node server).
- Friendly UX for users without Phantom (banner + install CTA).

Quick Start (Local)
1) Prerequisites: Node 18+ and Phantom wallet.
2) Install deps and run server:
   - npm install
   - npm start
3) Open http://localhost:3000

Deploy to GitHub Pages (Static)
There are two options:

Option A – Serve raw static files (recommended)
1) Push the repository to GitHub and enable GitHub Pages in repo Settings → Pages.
2) Set Source to “Deploy from a branch” and select the `main` branch and `/ (root)` path.
3) Ensure `index.html` is at repo root. Pages will serve it at https://<your-user>.github.io/<repo>/

Option B – Use `gh-pages` branch
1) Create a new branch `gh-pages` containing the same `index.html`, `README.md`, and assets.
2) In Settings → Pages, set Source to `gh-pages` branch.
3) Push updates to `gh-pages` to deploy.

Static Mode Notes
- Backend API calls are attempted first; if unavailable, the app falls back to default events in the browser and localStorage for persistence.
- Ticket purchases in static mode rely on Phantom to send transfers on Devnet, then verify client-side via the Solana RPC.
- To use mainnet later, change SOLANA_NETWORK in `index.html` and set your production RPC in a proxy if needed.

Configure Network
- Devnet is used by default: const SOLANA_NETWORK = 'https://api.devnet.solana.com'
- If you host a custom RPC: change the value above.

Phantom Wallet
- Ensure Phantom is installed and Devnet is selected.
- Get Devnet SOL via a faucet.

Local Development API (Optional)
- If you want server-side verification and in-memory events, run the Node server (npm start).
- Endpoints:
  - GET /events – list events
  - POST /events/:id/tickets – verify the provided transaction signature and update ticket sales

Customizing Events
- Edit default events in `index.html` (look for `defaultEvents`).
- For the Node server list, edit the `events` array in `server.js`.

Troubleshooting
- Phantom not detected: Banner and button will show an install link.
- Transaction fails: Ensure wallet has sufficient Devnet SOL. The app pre-checks funds.
- Pages not updating: Verify Pages source branch/path and that `index.html` is in the correct directory.

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

## Déploiement GitHub Pages

1. **Activer GitHub Pages**
   - Dans les paramètres du dépôt, section *Pages*, sélectionner **GitHub Actions** comme source.
   - Chaque push sur `main` déclenche le workflow `.github/workflows/pages.yml` qui construit et publie le site statique.

2. **Configurer l'URL de l'API**
   - Créer un fichier `config.js` à la racine du projet contenant :
     ```js
     window.API_BASE = "https://votre-backend.example";
     ```
   - Référencer ce fichier dans `index.html` (par exemple avec `<script src="config.js"></script>`) avant le script principal afin que `API_BASE` soit disponible.

3. **Héberger le backend**
   - Déployer l'API (`server.js` ou `backend/`) sur un service compatible tel que Render ou Railway.
   - Récupérer l'URL publique du service et la reporter dans `config.js` pour exposer le backend au frontend.

## License
Distributed under the ISC license.
