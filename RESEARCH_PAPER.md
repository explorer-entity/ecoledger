# EcoLedger: A Trustless DePIN Protocol for Incentivizing Verifiable Individual Sustainability Actions

**Authors:** EcoLedger Research Team
**Date:** 2026-11-16
**Version:** 1.0 (Draft for review)

---

## Abstract

The voluntary carbon market (VCM) is a multi-billion-dollar instrument that today serves almost exclusively corporate compliance and ESG reporting, with negligible capital flowing to everyday individuals whose daily choices (energy use, mobility, diet, waste) collectively dominate global emissions. Existing consumer "eco-apps" rely on self-reported inputs, receipt scans, or spoofable Web2 location payloads that corporates reject as unverifiable, and smart meters/GPS units cannot write directly to blockchains without centralized, attack-prone intermediaries. Web3 onboarding (wallets, gas, DEX swaps) further blocks mass adoption, and no standardized "sustainability credit score" captures a consumer's holistic footprint.

We propose **EcoLedger**, a trustless Decentralized Physical Infrastructure (DePIN) protocol and personal sustainability wallet that bridges individuals to the corporate VCM. EcoLedger (i) passively ingests telemetry via India's RBI Account Aggregator (AA) framework and mobility/consumption APIs, (ii) proves data authenticity with TLSNotary and enforces privacy-preserving thresholds via Circom zk-SNARKs, with anti-fraud AI and GPS/device attestation, (iii) mints soulbound ERC-721 EcoScore tokens and fractional ERC-1155 micro-credits on-chain with immutable nullifiers preventing double-counting, and (iv) aggregates micro-credits into institutional bulk offsets settled through a B2B escrow that auto-distributes a 70/15/15 revenue split as zero-gas UPI payouts. Users never hold or see crypto. We present the architecture, threat model, tokenomics, and a phased roadmap, and discuss limitations and future work.

**Keywords:** DePIN, voluntary carbon market, TLSNotary, zk-SNARKs, Circom, ERC-721 soulbound, ERC-1155, account abstraction, ERC-4337, Web3Auth, UPI, Account Aggregator, green finance.

---

## 1. Introduction

### 1.1 Motivation

Climate action is bottlenecked at the individual level. While corporates purchase carbon credits to meet net-zero targets, the ~8 billion individuals whose behaviors drive the majority of demand-side emissions receive no financial signal to change. VCM size estimates vary by source and definition: Ecosystem Marketplace reports ~$535M traded in 2024; Mordor Intelligence estimates $2.83B in 2026 growing to $7.06B by 2031; Meticulous Research projects $8.41B by 2036. Regardless of definition, the market is structured around project developers and corporate buyers; retail participation is effectively zero. This creates the **Green-Data Authenticity Gap**: there is no trusted, privacy-preserving pipeline from verified individual behavior to a tradeable, corporate-grade credit.

### 1.2 Problem Statement

We identify five gaps:

1. **B2B Corporate Monopoly.** The VCM is designed for corporate compliance (ESG offsets, green bonds); ~0% of capital flows back to consumers.
2. **Unrewarded Green Behavior.** Individuals who cycle, reduce electricity, or eat less meat receive no financial benefit for verified impact.
3. **Verification & Oracle Bottlenecks.** Eco-apps rely on self-reported inputs, receipt scans, or spoofable Web2 location payloads; corporates reject unverified data. Smart meters and GPS cannot write directly to blockchains without centralized intermediaries.
4. **Web3 UX Friction.** Mass adoption fails when users must set up wallets, pay gas, or navigate DEX swaps for micro-rewards.
5. **Missing Identity Layer.** No standardized "sustainability credit score" tracks a consumer's holistic footprint (carbon, water, food, consumption, waste).

### 1.3 Contributions

1. A four-layer DePIN architecture (telemetry ingestion, verification oracle, on-chain state machine, settlement/UX) bridging individuals to the VCM.
2. A privacy-preserving verification pipeline combining TLSNotary (Web2 data authenticity) and Circom zk-SNARKs (threshold proofs) with anti-fraud AI and device attestation.
3. A token model: soulbound ERC-721 EcoScore + ERC-1155 fractional micro-credit pooling vault + B2B escrow with immutable nullifiers against double-counting.
4. A gasless, fiat-only UX via Web3Auth + ERC-4337 account abstraction with automated UPI settlement (70/15/15 split).
5. A phased roadmap from hackathon prototype to mainnet with security audits and live banking rails.

### 1.4 Paper Organization

§2 reviews background; §3 presents system architecture; §4 verification and privacy; §5 on-chain state machine and tokenomics; §6 settlement layer; §7 security and threat model; §8 evaluation plan and roadmap; §9 limitations; §10 conclusion.

---

## 2. Background & Related Work

### 2.1 Voluntary Carbon Markets

The VCM allows entities to purchase credits representing avoided/reduced/removed greenhouse-gas emissions. Registries (Verra VCS, Gold Standard, CAR, ACR) issue credits; buyers retire them for claims. Recent scrutiny over credit quality and additionality has widened the gap between low-integrity avoidance credits and premium removal credits, and demand has been flat near ~157 Mt (~USD 1B/yr) for four years [Climate Decode, 2026]. EcoLedger targets the *unmet* demand for high-integrity, granular, grassroots credits by aggregating verified individual actions.

### 2.2 DePIN

Decentralized Physical Infrastructure Networks coordinate real-world hardware/sensors via token incentives. EcoLedger extends DePIN to *behavioral* infrastructure: the "hardware" is the user's existing utility/mobility/payment data, attested rather than purchased.

### 2.3 Data Provenance: TLSNotary

TLS ensures confidentiality/authenticity between client and server but provides no portable proof. **TLSNotary** [tlsnotary.org] adds a Verifier to the TLS connection via MPC, allowing a Prover to selectively disclose (or redact) fields while cryptographically binding them to the server's identity and certificate chain. It supports selective disclosure and range proofs, and requires no server-side integration (no OAuth). Limitations: TLS 1.2 support (TLS 1.3 on roadmap); on-chain verification currently requires an off-chain application verifier.

### 2.4 Zero-Knowledge Proofs: Circom / SnarkJS

zk-SNARKs allow proving a statement (e.g., "value ≥ threshold") without revealing the value. Circom is a DSL for arithmetic circuits; SnarkJS handles trusted setup, proving, and verification. EcoLedger uses threshold circuits to prove carbon reductions without exposing raw bills/addresses.

### 2.5 Identity & Account Abstraction

**Web3Auth** provides social-login-based non-custodial key management. **ERC-4337** account abstraction enables smart accounts with sponsored (gasless) transactions via paymasters and session keys. Together they remove wallet setup, seed phrases, and gas from the user journey.

### 2.6 Soulbound Tokens & Fractional Credits

**ERC-721** soulbound (non-transferable) tokens suit identity-bound reputation scores. **ERC-1155** supports both fungible and non-fungible (fractional) tokens in one contract, ideal for pooling many small credits into bulk lots.

### 2.7 India's Account Aggregator Framework

The RBI's AA framework (Master Direction, 2016) is a consent-based financial data-sharing system: FIPs (banks, insurers, GSTN, etc.) share data with FIUs via licensed AAs, with explicit, revocable, auditable consent. As of 2026 it serves 160M+ accounts and 3.66B data requests, with 17 licensed AAs, ~650 FIUs, ~150 FIPs. EcoLedger uses AA to passively ingest UPI/bank data for consumption classification (MCC codes) without screen-scraping or credential sharing.

---

## 3. System Architecture

EcoLedger comprises four layers (Fig. 1).

**Layer 1 — Telemetry Ingestion.** Connectors for:
- Energy: BESCOM, Tata Power, BSES APIs; DigiLocker; PNG/LPG booking history.
- Mobility: Ola, Uber, Rapido, IRCTC, Google Maps OAuth, metro webhooks.
- Consumption: UPI MCC via AA (e.g., organic stores vs. petrol pumps); BigBasket/Zomato APIs.
- Waste: municipal/NGO attestations (future).

All sources normalize into canonical `BehaviorEvent {source, timestamp, metric, value, unit, consentRef}`.

**Layer 2 — Verification & Oracle Engine.** TLSNotary proves Web2 data authenticity; Circom circuits prove thresholds; anti-fraud AI (CV perceptual-hash dedup, liveness, structural features) and GPS/device attestation reject spoofing. Decentralized oracle nodes verify and attest with slashing/reputation.

**Layer 3 — On-Chain State Machine.** Soulbound ERC-721 EcoScore; ERC-1155 micro-credit vault; B2B escrow; immutable nullifier registry.

**Layer 4 — Settlement & UX.** Web3Auth + ERC-4337 smart accounts; paymaster-sponsored gasless ops; mock/live UPI payout bridge; fiat-only UI.

---

## 4. Verification & Privacy

### 4.1 TLSNotary Pipeline

For each data source, the user's client acts as Prover, the oracle node as Verifier/Notary. The Prover fetches the resource over TLS with MPC participation; the Notary co-signs commitments without seeing plaintext. The Prover then selectively discloses only fields needed (e.g., monthly kWh, not full address) to the Verifier, which checks server identity via certificate chain and commitment openings.

### 4.2 zk-SNARK Threshold Proofs

Circom circuits encode statements such as:
- `E_elec: consumption_t ≤ 0.9 × baseline (10% reduction)`
- `E_mob: km_cycled ≥ X`
- `E_food: plant_based_meals ≥ Y`

Private inputs (raw values, baseline) never leave the prover; the public output is a boolean/threshold plus a nullifier. SnarkJS generates the proof; the on-chain verifier (Solidity) checks it.

### 4.3 Anti-Fraud AI

- **Photo verification:** perceptual-hash deduplication against a global registry; liveness checks; structural feature validation (e.g., meter display OCR consistency).
- **GPS/device attestation:** reject mock locations; bind proof to a device key attested by OS (SafetyNet/App Attest).
- **Confidence tiers 1–4:** effort-vs-reward model; higher tiers require stronger attestation and yield more points; low-confidence actions yield fewer points and are flagged for review.

### 4.4 Privacy Guarantees

- Raw bills, addresses, and account numbers remain on-device / in user-controlled storage.
- Only threshold booleans, nullifiers, and aggregate score deltas are published on-chain.
- Consent is explicit, scoped, time-bound, and revocable per source (mirroring AA consent artefacts).

---

## 5. On-Chain State Machine & Tokenomics

### 5.1 EcoScore (Soulbound ERC-721)

One non-transferable token per user, metadata encoding a holistic sustainability score across five dimensions: carbon, water, food, consumption, waste. Updated on each verified action. Non-transferability prevents score trading; identity is the token.

### 5.2 Micro-Credit Pooling Vault (ERC-1155)

Each verified action mints fractional credits (e.g., 0.01 tCO2e) into the user's account within the vault. ERC-1155 allows efficient batch minting and transfers.

### 5.3 Double-Counting Prevention

An **immutable nullifier registry** maps each credit's nullifier (derived from source + time window + user) to its minted state. Re-submission of the same proof is rejected. Retirement marks the credit irreversibly; retired credits cannot be re-minted or re-sold. This mirrors the "retirement" semantics of established registries.

### 5.4 B2B Escrow Pool

Corporations deposit funds (fiat on-ramped to stablecoin or native) into an escrow contract. Upon bulk credit retirement request, the contract releases credits to the buyer and distributes funds per the revenue split.

### 5.5 Revenue Split (Tokenomics)

| Recipient | Share | Rationale |
|---|---|---|
| User Payout Pool | 70% | Direct incentive for green behavior |
| Node Operator Fee | 15% | Compensation for decentralized oracle verification |
| Protocol Treasury | 15% | Sustainability, development, grants |

Split is enforced on-chain in the escrow release function; not configurable by any single party (governance timelock for future changes).

### 5.6 Access Control

- Only oracle-attested addresses may mint.
- Contracts are pausable by a multisig; upgrades gated by timelock.
- Emergency circuit breaker on anomalous mint volume.

---

## 6. Settlement & UX Layer

### 6.1 Gasless Onboarding

Web3Auth social login (Google/Apple/email) derives a non-custodial key; an ERC-4337 smart account is created counterfactually (lazy deploy on first tx). A paymaster sponsors all user operations, so users never see gas prompts or seed phrases. Session keys permit low-friction repeated actions.

### 6.2 Mock → Live UPI Settlement

On escrow release, the settlement engine credits 70% to the user's bank account via UPI. Phase 1 ships a mock engine (idempotent, receipted, ≤60s). Phase 2 transitions to live rails via a licensed PPI/bank partner and RBI sandbox, subject to regulatory approval.

### 6.3 Fiat-Only UX

All crypto terminology is hidden; UI shows INR and GreenPoints. Users never manage tokens, swaps, or wallets.

---

## 7. Security & Threat Model

**Adversaries considered:** malicious users (spoofing, replay, double-spend), malicious oracle nodes (collusion, false attestation), malicious corporates (non-payment, double retirement), and infrastructure attackers (MITM, key theft).

**Mitigations:**
- Data authenticity via TLSNotary (server identity bound to cert chain).
- Privacy + correctness via zk-SNARKs (soundness of threshold claims).
- Anti-fraud AI + device attestation (spoof resistance).
- Nullifiers (double-counting prevention).
- Slashing + reputation for oracle nodes.
- Pausable contracts + timelock + multisig.
- Consent revocation + audit logs (AA-aligned).

**Residual risks:** TLSNotary TLS 1.3 gap; mobile proving performance; regulatory uncertainty for UPI/crypto bridging; corporate demand risk. See §9.

---

## 8. Hackathon MVP Scope

The hackathon MVP targets a single end-to-end demo: a user connects one data source, performs one verified green action, mints a credit, and receives a mock UPI payout — with zero crypto UX. Everything else is post-hackathon.

### 8.1 MVP Demo Flow (Must Work End-to-End)

1. User signs in with Google (Web3Auth) → ERC-4337 smart account created gaslessly.
2. User connects one telemetry source (mocked BESCOM bill OR mocked mobility trip).
3. TLSNotary proof generated for the data; Circom threshold proof ("reduction ≥ 10%" or "km cycled ≥ X") verified.
4. Anti-fraud check (perceptual-hash dedup + mock GPS attestation) passes.
5. Soulbound ERC-721 EcoScore updated; ERC-1155 micro-credit minted; nullifier recorded.
6. Mock B2B escrow releases 70% as a mock UPI credit to the user within 60s.
7. Dashboard shows EcoScore + earnings in INR.

### 8.2 MVP Success Criteria

- End-to-end flow completes in ≤ 2 minutes on testnet.
- Zero wallet/gas prompts for the user.
- Proof generation ≤ 10s; payout ≤ 60s.
- Duplicate-proof submission rejected (nullifier works).

### 8.3 MVP Success Metrics (Demo)

- **Product:** end-to-end completion rate, proof success rate, payout latency.
- **Technical:** proof gen time, gas per mint, oracle uptime during demo.

### 8.4 Post-Hackathon Roadmap (Condensed)

- **Q3 2026:** Contract audits; L2 mainnet deploy; Node.js utility API parser; live UPI rails.
- **Q4 2026–2027:** Hardware sensor firmware; green finance layer; top-5 utility + food/transit API partnerships.
- **2028+:** Biodiversity asset class; global scaling as "Stripe for Green Behavior."
- **Ongoing:** B2B sales; government alignment (PM Surya Ghar); anti-fraud refinement (Tiers 1–4).

---

## 9. Limitations

1. **TLS 1.2 only** in TLSNotary; TLS 1.3 endpoints need proxy mode or upstream support.
2. **On-chain verification of TLSNotary** is not yet practical; an off-chain verifier attests, introducing a trust assumption in the oracle node (mitigated by decentralization/slashing).
3. **Mobile proving performance** may require server-assisted proving with user-held blinding.
4. **Regulatory uncertainty** for crypto→UPI bridging and data sharing by non-regulated FIUs.
5. **Corporate demand** is unproven; requires pre-sales/LOIs.
6. **Anti-fraud** is an arms race; confidence tiers and human review are required.

---

## 10. Conclusion

EcoLedger proposes a trustless pipeline from verified individual green behavior to corporate-grade carbon credits, with privacy-preserving verification, double-counting prevention, and a fiat-only, gasless user experience. By aligning individual incentives (70% revenue share) with corporate ESG demand via a standardized sustainability credit score, it addresses the Green-Data Authenticity Gap and the exclusion of everyday individuals from the sustainability economy. The phased roadmap prioritizes verification correctness and security before scale.

---

## References

1. Mordor Intelligence. *Voluntary Carbon Market Size & Share 2031.* 2026. https://www.mordorintelligence.com/industry-reports/voluntary-carbon-market
2. Ecosystem Marketplace. *State of the Voluntary Carbon Market 2025.* 2025.
3. Climate Decode. *VCM Market Outlook 2026.* 2026. https://climate-decode.com/insights/vcm-series/vcm-market-outlook-2026
4. UNCTAD. *The Role of Voluntary Carbon Markets in Global Climate Action.* 2025. https://unctad.org/system/files/official-document/diae2025d5_en.pdf
5. Stanford Law School. *Voluntary Carbon Markets: Limitations and Solutions.* 2026.
6. TLSNotary. Documentation. https://tlsnotary.org/docs
7. Circom / SnarkJS. https://docs.circom.io
8. ERC-721, ERC-1155, ERC-4337 specifications. Ethereum Foundation.
9. Web3Auth. Documentation. https://web3auth.io/docs
10. Reserve Bank of India. *Master Direction — NBFC-Account Aggregator (Reserve Bank) Directions, 2016.* https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=12936
11. Department of Financial Services, Govt. of India. *Account Aggregator Framework.* https://financialservices.gov.in/account-aggregator-framework
12. Sahamati. *Data (FI types) available in the AA framework.* https://sahamati.org.in/data-fi-types-available-on-aa/
13. AlliedOffsets. *2025 VCM Overview.* https://alliedoffsets.com

---

*End of paper.*
