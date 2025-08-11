# Evento

Evento is a ticketing and crowdfunding dApp for the **Solana** blockchain that runs entirely as a static site. It is optimized for deployment on platforms like GitHub Pages. To connect to a custom backend, provide a small `config.js` that sets `window.API_BASE`.

## Features

- Create events with configurable ticket tiers and track funds raised.
- Purchase tickets through direct SOL transfers using a Phantom wallet.
- Works as a static site (e.g., GitHub Pages) with optional server-side verification.
- Falls back to localStorage events when the backend is unavailable.

## Prerequisites

- Node.js 18+
- Phantom wallet with Devnet SOL (use a faucet).

## Deployment to GitHub Pages

A workflow at `.github/workflows/pages.yml` builds and publishes the static site.

1. Enable **GitHub Pages** in repository settings and select **GitHub Actions** as the source.
2. Push to `main`; the site deploys automatically.

### Configuring the API URL

If you host the API elsewhere (Render, Railway, etc.):

1. Create `config.js` at the project root with:
   ```js
   window.API_BASE = "https://your-backend.example";
   ```
2. Reference `config.js` in `index.html` before the main script tag.

## Network Configuration

Devnet is the default network:
```js
const SOLANA_NETWORK = "https://api.devnet.solana.com";
```
Change this value in `index.html` to point to a custom RPC or mainnet.

## Customizing Events

- Static mode: edit the `defaultEvents` array in `index.html`.
- Node server: edit the `events` array in `server.js`.

## Project Structure

```
.
├── index.html          # Web interface
├── server.js          # Minimal API (Express + in-memory storage)
├── package.json
├── backend/           # Optional backend service
└── docs/              # Additional documentation
```

## Additional Documentation

- [Architecture overview](docs/architecture.md)
- [Backend guide](docs/backend.md)

## License

Distributed under the ISC License. See [LICENSE](LICENSE) for details.

