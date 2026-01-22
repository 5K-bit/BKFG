# Blackfong Tip Bot

Webhook-driven bot that listens to Farcaster comments and sends BKFG or EEVEE
tips while tracking velocity.

## Commands

In any Farcaster comment:

```
!tip 5 BKFG fid:1234
!tip 2.5 EEVEE fid:5566
```

The bot looks up the recipient `fid` in the registry (see `/link` below) and
transfers tokens to their registered wallet address.

## Endpoints

- `POST /webhook/farcaster`: Neynar webhook handler for cast events.
- `POST /link`: register a user's wallet addresses.
- `GET /metrics`: velocity metrics for dashboards and the mini app.

### POST /link

```
{
  "fid": 1234,
  "baseAddress": "0x...",
  "solAddress": "..."
}
```

## Velocity metrics

Velocity is tracked per token and surfaced as:

```
{
  "velocityIndex": 12,
  "totalTips": 34,
  "totals": {
    "BKFG": { "count": 20, "volume": 100.5 },
    "EEVEE": { "count": 14, "volume": 32.1 }
  },
  "updatedAt": "2026-01-22T00:00:00.000Z"
}
```

Update the velocity weighting inside `src/velocity.js`.
