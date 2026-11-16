# EcoLedger — Project Workflow & Execution Plan

**Version:** 1.0 (Hackathon scope → Mainnet roadmap)
**Status:** Planning / Pre-implementation
**Last updated:** 2026-11-16

---

## 0. Executive Summary

EcoLedger is a trustless DePIN (Decentralized Physical Infrastructure) protocol and personal sustainability wallet that converts verified individual green behavior (energy, mobility, consumption, waste) into fractional, tradeable carbon credits, aggregates them into institutional-grade offsets, and settles 70% of B2B revenue as zero-gas UPI payouts to users. Users never touch crypto.

This document defines the **end-to-end project workflow**: phases, milestones, task breakdown by layer, team ownership, acceptance criteria, risk register, and operational cadence. It is the single source of truth for "what to do, in what order, by whom."

---

## 1. Guiding Principles

1. **Verify before you mint.** No on-chain state change without a valid TLSNotary + zk-SNARK proof (or approved fallback).
2. **Privacy by default.** Raw bills/addresses never leave the user device; only threshold proofs and nullifiers touch the chain.
3. **Gasless for users.** All user-facing transactions are sponsored via ERC-4337 account abstraction; users see INR only.
4. **Double-counting is a hard failure.** Immutable on-chain nullifiers make a retired credit un-resellable.
5. **Ship the mock, then the rail.** UPI settlement ships as a mock engine first, then transitions to live banking rails.
6. **Anti-fraud before scale.** Confidence tiers (1–4) and CV/GPS attestation must be in place before any B2B bulk sale.

---

## 2. Layered Architecture (Reference)

| Layer | Name | Responsibility |
|---|---|---|
| L1 | Telemetry Ingestion | Connect utility, mobility, consumption, waste data sources (BESCOM, Tata Power, BSES, DigiLocker, Ola/Uber/Rapido, IRCTC, UPI MCC via AA, BigBasket/Zomato). |
| L2 | Verification & Oracle Engine | TLSNotary proofs, Circom zk-SNARKs, anti-fraud AI (CV perceptual hashing, liveness, GPS/device attestation). |
| L3 | On-Chain State Machine | Soulbound ERC-721 EcoScore, ERC-1155 Micro-Credit Pooling Vault, B2B Escrow Pool, nullifiers. |
| L4 | Settlement & UX | Web3Auth + ERC-4337 smart accounts, gasless onboarding, mock/live UPI payout bridge, 70/15/15 split. |

---

## 3. Hackathon MVP Scope & Milestones

The hackathon MVP is a single end-to-end demo on testnet. Post-hackathon work is listed in §3.9.

### 3.1 MVP Demo Flow (Must Work End-to-End)

1. User signs in with Google (Web3Auth) → ERC-4337 smart account (gasless).
2. User connects one mocked telemetry source (BESCOM bill or mobility trip).
3. TLSNotary proof generated; Circom threshold proof verified.
4. Anti-fraud check (perceptual-hash dedup + mock GPS attestation) passes.
5. EcoScore (soulbound ERC-721) updated; ERC-1155 micro-credit minted; nullifier recorded.
6. Mock B2B escrow releases 70% as mock UPI credit within 60s.
7. Dashboard shows EcoScore + earnings in INR.

### 3.2 MVP Milestones (2 weeks)

- **M0 (Day 1–2):** Monorepo + CI scaffold; testnet wallet creation works.
- **M1 (Day 3–5):** Telemetry ingestion (mocked source) + normalization.
- **M2 (Day 6–9):** TLSNotary + Circom threshold proof + verifier.
- **M3 (Day 10–12):** Contracts: EcoScore, pooling vault, nullifier, mock escrow.
- **M4 (Day 13–14):** Gasless onboarding + mock UPI payout + dashboard.

### 3.3 MVP Success Criteria

- End-to-end flow ≤ 2 minutes on testnet.
- Zero wallet/gas prompts for the user.
- Proof generation ≤ 10s; payout ≤ 60s.
- Duplicate-proof submission rejected (nullifier works).

### 3.4 Post-Hackathon Roadmap (Condensed)

- **Q3 2026:** Contract audits; L2 mainnet deploy; Node.js utility API parser; live UPI rails (RBI sandbox).
- **Q4 2026–2027:** Hardware sensor firmware; green finance layer; top-5 utility + food/transit API partnerships.
- **2028+:** Biodiversity asset class; global scaling as "Stripe for Green Behavior."
- **Ongoing:** B2B sales; government alignment (PM Surya Ghar); anti-fraud refinement (Tiers 1–4).

---

## 4. Task Breakdown by Layer (Detailed)

### L1 — Telemetry Ingestion
| ID | Task | Owner | Deps | Acceptance |
|---|---|---|---|---|
| L1.1 | AA consent + FIP fetch | Backend | Phase 0 | Consent artefact round-trip works |
| L1.2 | MCC classifier | Backend+Data | L1.1 | ≥95% accuracy on labeled set |
| L1.3 | Mobility connectors | Backend | Phase 0 | Trip history ingested |
| L1.4 | Energy connectors | Backend | Phase 0 | Bill/usage ingested |
| L1.5 | Consumption connectors | Backend | Phase 0 | Purchase data ingested |
| L1.6 | Normalization + consent ledger | Backend | L1.1–L1.5 | Canonical events + revocation |

### L2 — Verification & Oracle
| ID | Task | Owner | Deps | Acceptance |
|---|---|---|---|---|
| L2.1 | TLSNotary prover/notary | Crypto | Phase 0 | Proof verifies for sample |
| L2.2 | Circom threshold circuits | Crypto | L2.1 | Prove+verify < 5s |
| L2.3 | SnarkJS pipeline | Crypto | L2.2 | On-chain verifier accepts |
| L2.4 | CV anti-fraud | ML | Phase 0 | Dedup + liveness ≥98% |
| L2.5 | GPS/device attestation | Mobile | Phase 0 | Mock location rejected |
| L2.6 | Confidence tiers | Product+ML | L2.4,L2.5 | Tier weights documented |
| L2.7 | Oracle node spec | Crypto+Infra | L2.1 | Slashing + reputation |

### L3 — On-Chain
| ID | Task | Owner | Deps | Acceptance |
|---|---|---|---|---|
| L3.1 | EcoScore ERC-721 (soulbound) | Contracts | Phase 0 | Non-transferable |
| L3.2 | ERC-1155 pooling vault | Contracts | L3.1 | Fractional mint works |
| L3.3 | B2B escrow pool | Contracts | L3.2 | Release on retirement |
| L3.4 | Nullifier registry | Contracts | L3.2 | Double-mint rejected |
| L3.5 | Revenue split (70/15/15) | Contracts | L3.3 | Split verified on-chain |
| L3.6 | Access control + timelock | Contracts | L3.3 | Only oracle mints |
| L3.7 | Test suite + gas report | Contracts | all | Invariants pass |

### L4 — Settlement & UX
| ID | Task | Owner | Deps | Acceptance |
|---|---|---|---|---|
| L4.1 | Web3Auth + AA smart account | Frontend | Phase 0 | Social login → account |
| L4.2 | Paymaster sponsorship | Infra | L4.1 | Zero gas prompts |
| L4.3 | Mock UPI settlement engine | Backend | L3.3 | Payout ≤60s |
| L4.4 | Dashboard UI | Frontend | L4.1,L3.1 | EcoScore + earnings |
| L4.5 | Consent management UI | Frontend | L1.6 | Revoke works |
| L4.6 | Notifications | Backend | L4.3 | Email/SMS on payout |

---

## 5. Team & Ownership

| Role | Count | Owns |
|---|---|---|
| Smart Contract Engineer | 1–2 | L3, audits |
| Cryptography/ZK Engineer | 1–2 | L2.1–L2.3, L2.7 |
| ML Engineer | 1 | L2.4, L2.6 |
| Backend Engineer | 2 | L1, L4.3, L4.6, aggregation |
| Frontend/Mobile Engineer | 1–2 | L4.1, L4.4, L4.5 |
| Infra/DevOps | 1 | CI, bundler, paymaster, monitoring |
| Product/Design | 1 | UX, tiers, B2B portal |
| Legal/Compliance | 0.5 | DPDP, tax, KYC |

---

## 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AA data not legally shareable with non-regulated FIU | Medium | High | Position EcoLedger as regulated FIU partner or use user-consented export; legal review in Phase 0. |
| TLSNotary TLS 1.3 not supported | Medium | Medium | Use TLS 1.2 endpoints; proxy mode fallback; track upstream roadmap. |
| zk proof too slow on mobile | Medium | High | Move proving to server-side worker with user-held blinding; benchmark early (Phase 2 exit). |
| Double-counting across registries | Medium | High | Immutable nullifiers + registry interop agreements; on-chain retirement receipts. |
| Smart contract exploit | Low | Critical | External audit, bug bounty, timelock, pausable. |
| UPI payout rail regulatory block | Medium | High | Mock engine first; partner with licensed PPI/bank; RBI sandbox. |
| User onboarding friction (KYC) | Medium | Medium | Progressive KYC; tier-1 actions without full KYC. |
| Corporate buyer demand shortfall | Medium | Medium | Pre-sell via LOIs before mainnet; target ESG-mandated firms. |
| Anti-fraud false positives | Medium | Medium | Confidence tiers; human review queue; appeal flow. |

---

## 7. Metrics & KPIs

**Product:** DAU, connected sources per user, verified actions/user/week, payout latency (p95), proof success rate, fraud rejection rate.
**Business:** B2B escrow volume (INR), credits retired (tCO2e), revenue split accuracy, corporate buyer count, NPS.
**Technical:** Proof generation time, gas per mint/pool/retire, oracle uptime, API p95 latency.

---

## 8. Operational Cadence

- **Daily:** standup (15 min), CI green check.
- **Weekly:** sprint review + retro; risk register review.
- **Bi-weekly:** milestone demo to stakeholders.
- **Monthly:** security review; metrics review; roadmap re-baseline.
- **Quarterly:** audit checkpoint; tokenomics review.

---

## 9. Definition of Done (Global)

A task is done when:
1. Code merged to `main` via PR with review.
2. Unit + integration tests pass in CI.
3. Docs updated (README + relevant ADR).
4. Feature demoable on testnet/staging.
5. No open P1/P2 bugs against the task.

---

## 10. Immediate Next Actions (This Week)

1. Create monorepo skeleton and CI (Phase 0).
2. Register as FIU with an AA sandbox; test consent round-trip.
3. Stand up Circom + SnarkJS hello-world circuit; measure prove time.
4. Spike: TLSNotary proof for a single bank statement field.
5. Draft smart contract interfaces (ERC-721/ERC-1155/escrow) + nullifier spec.
6. Legal consult: DPDP Act applicability + KYC tiering.

---

## 11. Deliverable Index

| Artifact | Location | Owner |
|---|---|---|
| This workflow | `PROJECT_WORKFLOW.md` | Product |
| Research paper | `RESEARCH_PAPER.md` | Research |
| Data schemas | `docs/schemas/` | Backend |
| Circuit specs | `docs/circuits/` | Crypto |
| Contract ABIs | `docs/contracts/` | Contracts |
| API spec (OpenAPI) | `docs/api/` | Backend |
| Security model | `docs/security/` | Crypto+Contracts |

---

*End of document.*
