# Blackfong "box"

This folder contains two projects:

- **mini-app/**: A Farcaster Mini App (Frames v2) that lets users link Base and
  Solana wallets, calculates a **Blackfong Power** score from holdings across
  both chains, and exposes a burn/mint bridge flow using **Chainlink CCIP** or
  **Symbiosis** style plans.
- **bot/**: A webhook-based tipping bot that watches Farcaster comments and
  transfers **BKFG** (Base) or **EEVEE** (Solana) while tracking token
  **velocity** (movement between hands).

Both projects are intentionally minimal so you can swap in production
infrastructure or new token contracts without rewiring the whole codebase.

## Quick start

> Requires Node.js 18+ (uses built-in fetch).

```bash
cd mini-app
npm install
cp .env.example .env
npm run dev
```

```bash
cd ../bot
npm install
cp .env.example .env
npm run dev
```

## Blackfong Power formula

The current implementation uses:

```
power = (bkfgBase + bkfgSol) * 10
      + (eeveeSol * 4)
      + velocityBoost
```

`velocityBoost` is pulled from the bot metrics when available. Adjust weights
in `mini-app/src/power.js` as desired.

## Bridge flow (burn/mint)

The mini app exposes `/api/bridge` which returns a **bridge plan** for either
`ccip` or `symbiosis`. The plan is a structured payload describing the on-chain
steps the client should execute. Replace the stubbed instructions in
`mini-app/src/bridge.js` with live calls once you wire in real routers, pools,
and mint/burn contracts.

## Tipping bot flow

1. Users link wallets (from the mini app) by POSTing to the bot's `/link`
   endpoint with their Farcaster `fid` and wallet addresses.
2. When a Farcaster comment contains a tip command (e.g. `!tip 5 BKFG fid:1234`)
   the bot sends the tokens and updates velocity metrics.
3. The bot's `/metrics` endpoint exposes totals for dashboards and the mini app.

See `bot/README` inside the bot folder for command format and webhook setup.
