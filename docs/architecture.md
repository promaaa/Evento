# Architecture Overview

Evento consists of a small front-end, a REST API and optional database persistence. The default setup stores data in memory, while the `backend/` directory provides a MongoDB-backed implementation.

## Components
- **Browser** — `index.html` uses JavaScript to call the API and interact with a Phantom wallet.
- **API** — `server.js` exposes endpoints to create events, buy tickets and verify Solana transactions.
- **Blockchain** — SOL transfers are verified against the Solana devnet via `@solana/web3.js`.
- **Database (optional)** — the `backend/` API persists events and ticket sales in MongoDB.

## Data Flow
```
Browser ----HTTP----> Express API ----> Solana devnet
                       |
                       └----> MongoDB (backend version)
```

The web page and API are served from the same origin during development. Deployments can host them separately by adjusting the `API_BASE` variable before loading the script.
