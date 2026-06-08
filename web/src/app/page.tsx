'use client';
import { useState, useCallback } from 'react';
import { useWallet } from '@/hooks/useWallet';
import SakayPass from '@/components/SakayPass';
import { fundTestnetAccount } from '@/lib/stellar';

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting, error: walletError, connect, disconnect } = wallet;
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const [copied, setCopied] = useState(false);
  const [funding, setFunding] = useState(false);

  const copyAddress = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const fund = async () => {
    if (!publicKey) return;
    setFunding(true);
    try {
      await fundTestnetAccount(publicKey);
      refresh();
    } catch { /* ignore */ }
    finally { setFunding(false); }
  };

  return (
    <main className="min-h-screen w-full sakay-hero-bg">
      {/* ─── Top Nav ─── */}
      <nav className="sticky top-0 z-50 border-b border-sakay-border/60 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            {/* Jeepney icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sakay-accent/10 text-sakay-accent">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6v6" /><path d="M16 6v6" />
                <rect x="4" y="3" width="16" height="14" rx="3" />
                <path d="M4 11h16" /><path d="M8 17v2" /><path d="M16 17v2" />
                <circle cx="8" cy="15" r="1" fill="currentColor" /><circle cx="16" cy="15" r="1" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-sakay-text">SakayPass</h1>
              <p className="text-[11px] text-sakay-text-muted -mt-0.5">Stellar Testnet</p>
            </div>
          </div>

          {publicKey ? (
            <div className="flex items-center gap-2">
              <button
                onClick={fund}
                disabled={funding}
                title="Fund with Friendbot"
                className="rounded-lg bg-sakay-accent/10 px-2.5 py-1.5 text-xs font-medium text-sakay-accent transition-colors hover:bg-sakay-accent/20 disabled:opacity-50"
              >
                {funding ? '…' : '💰 Fund'}
              </button>
              <button
                onClick={copyAddress}
                title="Copy address"
                className="rounded-lg bg-sakay-surface border border-sakay-border px-3 py-1.5 font-mono text-xs text-sakay-text-muted transition-all hover:border-sakay-accent/40 hover:text-sakay-text"
              >
                {copied ? '✓ Copied' : `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`}
              </button>
              <button
                onClick={disconnect}
                className="rounded-lg px-2.5 py-1.5 text-xs text-sakay-red/70 transition-colors hover:bg-sakay-red/5 hover:text-sakay-red"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="rounded-lg bg-sakay-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-sakay-accent-hover hover:shadow-lg hover:shadow-sakay-accent/20 disabled:opacity-50"
            >
              {connecting ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting…
                </span>
              ) : (
                'Connect Wallet'
              )}
            </button>
          )}
        </div>
      </nav>

      {walletError && (
        <div className="mx-auto max-w-2xl px-4 pt-3">
          <div className="rounded-lg border border-sakay-red/20 bg-red-50 px-4 py-2.5 text-sm text-sakay-red">
            {walletError}
          </div>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        {!publicKey && !connecting && (
          <div className="fade-in mt-8">
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sakay-accent/15 to-sakay-green/10 border border-sakay-border">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sakay-accent">
                  <path d="M8 6v6" /><path d="M16 6v6" />
                  <rect x="4" y="3" width="16" height="14" rx="3" />
                  <path d="M4 11h16" /><path d="M8 17v2" /><path d="M16 17v2" />
                  <circle cx="8" cy="15" r="1" fill="currentColor" /><circle cx="16" cy="15" r="1" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-sakay-text mb-3">
                Cashless Student Commute
              </h2>
              <p className="text-sakay-text-muted max-w-md mx-auto leading-relaxed">
                Pay for jeepney and tricycle rides with a blockchain-powered wallet.
                No loose change — just scan, ride, and go.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid gap-4 sm:grid-cols-3 mb-10">
              <div className="glass-card rounded-xl p-5 text-center transition-shadow hover:shadow-md">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-sakay-accent/10 text-sakay-accent">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" /><path d="M9 3v18" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-sakay-text mb-1">Scan QR</h3>
                <p className="text-xs text-sakay-text-muted leading-relaxed">Scan a driver&apos;s QR to pay instantly via Stellar</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center transition-shadow hover:shadow-md">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-sakay-text mb-1">Quick Pay</h3>
                <p className="text-xs text-sakay-text-muted leading-relaxed">Enter the exact fare amount and send PHP instantly</p>
              </div>
              <div className="glass-card rounded-xl p-5 text-center transition-shadow hover:shadow-md">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-sakay-text mb-1">Secure</h3>
                <p className="text-xs text-sakay-text-muted leading-relaxed">All rides recorded on-chain — transparent &amp; tamper-proof</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={connect}
                disabled={connecting}
                className="rounded-xl bg-gradient-to-r from-sakay-accent to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-sakay-accent/20 transition-all hover:shadow-xl hover:shadow-sakay-accent/30 hover:scale-[1.02] disabled:opacity-50"
              >
                Connect Freighter Wallet to Start
              </button>
              <p className="mt-4 text-xs text-sakay-text-muted">
                No wallet?{' '}
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sakay-accent hover:text-sakay-accent-hover underline underline-offset-2"
                >
                  Install Freighter
                </a>{' '}
                and switch to Test Net.
              </p>
            </div>
          </div>
        )}

        {publicKey && (
          <div className="fade-in">
            <SakayPass publicKey={publicKey} refreshKey={refreshKey} onRefresh={refresh} />
          </div>
        )}
      </div>

      {/* ─── Footer ─── */}
      <footer className="mt-auto border-t border-sakay-border/50 py-6 bg-white/40">
        <div className="mx-auto max-w-2xl px-4 flex flex-col items-center gap-2">
          <p className="text-xs text-sakay-text-muted">
            Built on <span className="text-sakay-accent font-medium">Stellar</span> · StellarX PH Workshop @ PUP QC
          </p>
          <div className="flex gap-3 text-[11px] text-sakay-text-muted/60">
            <span>Testnet only</span>
            <span>·</span>
            <span>Fast & Secure</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
