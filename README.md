# EcoLedger

Trustless DePIN protocol bridging individuals to the voluntary carbon market.

## Structure

- `apps/web` — web app (gasless, fiat-only UX)
- `packages/shared` — canonical types
- `packages/contracts` — Solidity (EcoScore, pooling vault, escrow, nullifiers)
- `packages/circuits` — Circom zk-SNARK circuits
- `packages/oracle` — verification oracle node

## Getting started

```bash
npm install
npm run build
npm test
```

See `PROJECT_WORKFLOW.md` and `RESEARCH_PAPER.md`.
