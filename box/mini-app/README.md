# Blackfong Mini App (Frames v2)

This mini app exposes a Frames v2 compatible entry point plus a lightweight
web UI for linking wallets.

## Routes

- `GET /frame` and `POST /frame`: Frames v2 entry point.
- `GET /frame-image`: SVG image for the frame.
- `POST /api/power`: returns Blackfong Power + holdings.
- `POST /api/bridge`: returns a bridge plan for CCIP or Symbiosis.
- `GET /api/velocity`: pulls velocity metrics from the bot.

## Wallet linking

The front-end uses `window.ethereum` for Base and the Phantom provider for
Solana. Replace with WalletConnect or other connectors as needed.
