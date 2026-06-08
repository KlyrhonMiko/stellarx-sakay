# SakayPass

Cashless student commute payments for jeepneys and tricycles, powered by Stellar.

## Problem

Millions of Filipino students ride jeepneys and tricycles every day, but informal transit in the Philippines is still entirely cash-based. Carrying exact change is tedious and risky for students; drivers face safety concerns managing cash boxes and have no transparent record of their daily income.

SakayPass eliminates loose change from the equation. Students pay their fare by scanning the driver's QR code in-app and signing a Stellar payment in seconds — no bank account, no card, no cash.

## How It Works

1. **Driver** opens the app, switches to Driver mode, and displays their personal QR code (their Stellar address).
2. **Student** opens the app, enters the fare amount, and taps **Scan** to open the camera.
3. Student scans the driver's QR code — the app builds a Stellar payment transaction and prompts Freighter to sign it.
4. The signed transaction is submitted to the Stellar network; both parties see confirmation in seconds.
5. Drivers see all received payments in real time via Horizon, with timestamps and amounts.

## How It Uses Stellar

| Primitive | Usage |
|---|---|
| **Stellar Payments (Classic)** | Core fare payment — student signs an XLM payment tx to the driver's address via Freighter |
| **Soroban Smart Contract** | `SakayPassContract` tracks pass balances and driver earnings on-chain (`buy_pass`, `record_ride`, `claim`) |
| **Friendbot** | Testnet account funding for zero-friction onboarding |
| **Horizon API** | Fetches live XLM balance and real-time payment history for drivers |
| **Stellar Expert** | Deep-links every confirmed transaction so users can verify on-chain |

Why Stellar and not something else? Stellar's 3–5 second finality and near-zero fees make it the only chain where real-time micropayments for a ₱15 jeepney fare are actually practical.

## Track

**Track 2 — Financial Inclusion & Everyday Payments**

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Stellar SDK:** `@stellar/stellar-sdk` v13
- **Wallet:** `@stellar/freighter-api`
- **QR:** `qrcode.react` (display) · `react-qr-barcode-scanner` (camera scan)
- **Smart Contract:** Rust + `soroban-sdk` (Stellar Soroban)
- **Network:** Stellar Testnet

## Setup & Run

> A judge must be able to run this from these instructions alone.

### Prerequisites

- **Node.js 20+** and **npm**
- **Freighter** browser extension — install from [freighter.app](https://freighter.app), create a wallet, and switch to **Test Net**
- *(Contract track only)* **Rust** + `wasm32v1-none` target + **Stellar CLI**

### 1. Frontend

```bash
git clone https://github.com/KlyrhonMiko/stellarx-sakay
cd stellarx-sakay/web
npm install
npm run dev
```

Open <http://localhost:3000>, then:

1. Click **Connect Freighter Wallet** and approve in the extension.
2. Click **💰 Fund** in the nav bar to credit your account via Friendbot (~10,000 XLM).
3. **Student flow:** Enter a fare amount → tap **Scan** → point camera at a driver QR → confirm in Freighter.
4. **Driver flow:** Switch to Driver mode → display QR → watch payments arrive in real time.

`.env.local` is pre-configured for testnet — no changes needed for the frontend demo.

### 2. (Optional) Deploy the Soroban contract

Install the Rust toolchain + Stellar CLI on Windows:

```powershell
winget install --id Rustlang.Rustup -e --accept-source-agreements --accept-package-agreements
winget install --id Stellar.StellarCLI -e --accept-source-agreements --accept-package-agreements
# Open a new terminal, then:
rustup target add wasm32v1-none
```

Deploy:

```powershell
# from the repo root
cargo test                  # runs contract unit tests (no network)
.\scripts\deploy.ps1        # builds, deploys, writes NEXT_PUBLIC_CONTRACT_ID to web/.env.local
```

Restart `npm run dev` — the contract panel goes live.

## Network Details

- **Network:** Testnet
- **RPC URL:** `https://soroban-testnet.stellar.org`
- **Horizon:** `https://horizon-testnet.stellar.org`
- **Contract IDs:** Set after running `.\scripts\deploy.ps1` (written to `web/.env.local`)
- **Asset issuers:** N/A (XLM native)

## Team

- Klyrhon — @KlyrhonMiko

## License

MIT — see [LICENSE](./LICENSE)
