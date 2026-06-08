<!-- 
  ════════════════════════════════════════════════════════
  StellarX Philippines — Submission Issue
  ────────────────────────────────────────────────────────
  Issue title: Team #[number] - SakayPass
  Copy everything below this comment block into the Issue.
  ════════════════════════════════════════════════════════
-->

## Project Name
SakayPass

## One-Line Description
Cashless jeepney and tricycle fare payments for Filipino students, powered by Stellar and QR-code scanning.

## Track
Track 2 Financial Inclusion & Everyday Payments

## Problem It Solves
Informal transit in the Philippines (jeepneys, tricycles) is entirely cash-based. Students must carry exact change for every ride — risky, inconvenient, and impractical. Drivers have no transparent income record and face security concerns with cash boxes. SakayPass lets students scan a driver's QR code and pay the exact fare in seconds via a signed Stellar transaction — no bank account, no card, no cash required.

## How It Uses Stellar
- **Stellar Payments (Classic XLM):** The core payment primitive. A student signs an XLM payment transaction (built client-side with `@stellar/stellar-sdk`) to the driver's Stellar address. Freighter signs and submits to testnet.
- **Soroban Smart Contract (`SakayPassContract`):** Rust contract with `buy_pass`, `record_ride`, and `claim` functions that track student pass balances and driver ride earnings on-chain using persistent storage.
- **Horizon API:** Real-time XLM balance and payment history fetched from `horizon-testnet.stellar.org` for the driver's "Payments Received" feed.
- **Friendbot:** Zero-friction testnet onboarding — one click funds a new account.
- **Stellar Expert:** Every confirmed transaction deep-links to the block explorer for transparency.

## GitHub Repository
https://github.com/KlyrhonMiko/stellarx-sakay

## Network & Deployment
- Network: **testnet**
- Live app URL (if any): runs locally — see README
- Contract IDs / asset issuers: set after running `.\scripts\deploy.ps1` — written to `web/.env.local`. Asset: XLM native (no custom issuer).

## Team
- Klyrhon — @KlyrhonMiko

## Novelty Note (optional, for bonus points)
SakayPass targets the *last-mile informal transit* gap — not remittance or DeFi. While digital transit cards exist (Beep), none run on a permissionless blockchain, meaning drivers and students can participate with just a smartphone and Freighter — no account approval, no bank onboarding. The QR-scan-to-Stellar-payment flow is novel in the Philippine informal transit context.

## Anything Else
- Known limitation: payments are in XLM (testnet). A production version would route through a PHP-pegged stablecoin anchor (e.g., via SEP-24) to peg to PHP fare prices.
- Next steps: USDC/PHP trustline support, offline QR pre-authorization, and Soroban contract integration for subscription weekly passes.
