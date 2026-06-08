# Your Project

Fill this in as you build. It doubles as your **submission README**, and it maps
directly to how projects are judged (meaningful Stellar use, real problem,
working demo).

## Idea
- **Track:** Social Impact / Open
- **Idea # (from the 300-ideas list, if any):** 4
- **One-liner:** SakayPass (Jeepney/Tricycle Student Commute Subscription)

## Problem
Cashless transit payment is a major gap in the Philippines' informal transit network (jeepneys, tricycles). Carrying loose change for daily commutes is tedious for students, and drivers face safety and accounting issues managing cash boxes.

## How it uses Stellar
- Fast Payments: Drivers print a QR code linking to their Stellar address. Passengers scan the QR code using the web app and sign a quick payment.
- Subscription Contract: A Soroban contract lets students purchase a weekly or monthly "SakayPass" (e.g., 50 XLM). Jeepney drivers call a contract function to claim their share per passenger ride.

## What works in the demo
- [x] Connect wallet (Freighter, testnet)
- [x] Core flow runs end-to-end on testnet
- [x] Student can purchase passes via Soroban contract
- [x] Driver can record rides and claim token balances
- [x] Fast payments via QR code scanning

## Setup / run
How a judge runs it locally:
- Network: **testnet**
- `cd web && npm install && npm run dev`
- Contract (if used): `.\scripts\deploy.ps1`, then set `NEXT_PUBLIC_CONTRACT_ID`
- Any other env vars / steps:

## Demo
- 2–4 min video link (show the core flow working on testnet):
- Public repo link:

## Submission checklist
- [ ] Public GitHub repo with a license (this scaffold ships MIT — update `LICENSE`)
- [ ] README explains problem, Stellar usage, and setup
- [ ] Demo video (2–4 min)
- [ ] Submitted via the workshop's official GitHub issue template
