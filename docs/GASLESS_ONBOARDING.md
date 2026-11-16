# Gasless Onboarding Plan (ERC-4337 + Web3Auth)

Goal: A non-crypto user signs up with Google and gets a smart account with zero gas prompts.

## Components
- Web3Auth social login (Google/Apple/email) → non-custodial key.
- ERC-4337 smart account (counterfactual, lazy deploy on first tx).
- Paymaster (sponsored userOps) for all user-facing actions.
- Session keys for low-friction repeated actions.

## Steps
1. Integrate Web3Auth SDK in `apps/web`; on login derive signer.
2. Compute counterfactual smart account address (factory + initCode).
3. Configure bundler endpoint (Alchemy/Pimlico) and paymaster.
4. Route all contract calls (mint credit, score update) through userOp with paymaster sponsorship.
5. Deploy smart account lazily on first sponsored tx.
6. Add session key for repeated low-value actions (time/usage bounded).
7. Hide all crypto UX: show INR + points only.

## Acceptance (MVP)
- Sign up with Google → account created, no seed phrase.
- Perform green action → no gas prompt.
- First tx deploys account transparently.

## Next Stage
Implement Web3Auth integration and paymaster wiring in `apps/web`, then end-to-end MVP demo.
