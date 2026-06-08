'use client';
import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { submitSignedXDR, pollTransaction, buildPaymentXDR } from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';
import { fetchBalances, fetchRecentPayments, type RecentPayment } from '@/lib/balances';

interface SakayPassProps {
  publicKey: string;
  refreshKey: number;
  onRefresh: () => void;
}

export default function SakayPass({ publicKey, refreshKey, onRefresh }: SakayPassProps) {
  const [role, setRole] = useState<'student' | 'driver'>('student');
  const [xlmBalance, setXlmBalance] = useState('0');
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState('10');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const bal = await fetchBalances(publicKey);
      setXlmBalance(bal.xlm);
      setRecentPayments(await fetchRecentPayments(publicKey));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  const handleAction = async (actionFn: () => Promise<string>, successMsg: string) => {
    setBusy(true);
    setMsg('');
    setError('');
    setTxHash('');
    try {
      const xdr = await actionFn();
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) {
        throw new Error(
          typeof signed.error === 'string' ? signed.error : 'Signing was rejected',
        );
      }
      const hash = await submitSignedXDR(signed.signedTxXdr);
      setTxHash(hash);
      await pollTransaction(hash);
      setMsg(successMsg);
      await refresh();
      onRefresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
      setShowScanner(false);
    }
  };

  const payDriverNative = (driverAddress: string) => handleAction(
    () => buildPaymentXDR(publicKey, driverAddress, payAmount || '10', 'XLM'),
    `Sent ${payAmount || '10'} PHP to driver!`
  );

  // ─── Wallet Balance Bar ───
  const WalletBar = () => (
    <div className="glass-card rounded-xl p-4 mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-sakay-accent/10 flex items-center justify-center text-sakay-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 000 4h4v-4z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-sakay-text-muted">Wallet Balance</p>
          <p className="text-xl font-bold text-sakay-text">{loading ? '—' : `₱ ${xlmBalance} PHP`}</p>
        </div>
      </div>
      <button
        onClick={() => refresh()}
        className="text-sakay-text-muted hover:text-sakay-accent transition-colors p-2 rounded-lg hover:bg-sakay-accent/5"
        title="Refresh"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0115-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 01-15 6.7L3 16" />
        </svg>
      </button>
    </div>
  );

  // ─── Role Switcher ───
  const RoleSwitcher = () => (
    <div className="flex mb-5 bg-sakay-surface border border-sakay-border rounded-xl p-1">
      <button
        onClick={() => { setRole('student'); setShowScanner(false); }}
        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
          role === 'student'
            ? 'bg-sakay-accent text-white shadow-sm'
            : 'text-sakay-text-muted hover:text-sakay-text'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
        Student
      </button>
      <button
        onClick={() => { setRole('driver'); setShowScanner(false); }}
        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
          role === 'driver'
            ? 'bg-sakay-accent text-white shadow-sm'
            : 'text-sakay-text-muted hover:text-sakay-text'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6v6" /><path d="M16 6v6" />
          <rect x="4" y="3" width="16" height="14" rx="3" />
          <path d="M4 11h16" />
        </svg>
        Driver
      </button>
    </div>
  );

  return (
    <>
      <WalletBar />
      <RoleSwitcher />

      {/* ═══════════ STUDENT VIEW ═══════════ */}
      {role === 'student' && (
        <div className="space-y-4 fade-in">
          {/* Scan Driver QR to pay */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-md bg-sakay-accent/10 flex items-center justify-center text-sakay-accent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 3v18" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-sakay-text">Quick Pay (Scan Driver QR)</h3>
            </div>
            
            <p className="text-xs text-sakay-text-muted mb-4">Enter the fare amount, then scan the driver's QR code to send payment instantly.</p>

            {!showScanner ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    id="pay-amount"
                    type="number"
                    min="1"
                    placeholder="PHP amount"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="flex-1 rounded-lg border border-sakay-border bg-sakay-surface-2 px-3 py-2.5 text-sm text-sakay-text placeholder:text-sakay-text-muted/50 focus:outline-none focus:ring-2 focus:ring-sakay-accent/30 focus:border-sakay-accent transition-all"
                  />
                  <button
                    id="open-scanner-student-btn"
                    onClick={() => setShowScanner(true)}
                    disabled={busy || !payAmount}
                    className="rounded-lg bg-sakay-text px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-sakay-text/80 disabled:opacity-40 flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Scan
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden bg-black">
                <BarcodeScannerComponent
                  width={400}
                  height={300}
                  onUpdate={(_err, result) => {
                    if (result && !busy) {
                      payDriverNative(result.getText());
                    }
                  }}
                />
                <div className="scan-line absolute inset-0 pointer-events-none" />
                <button
                  onClick={() => setShowScanner(false)}
                  className="absolute top-2 right-2 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-black/80"
                >
                  ✕ Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ DRIVER VIEW ═══════════ */}
      {role === 'driver' && (
        <div className="space-y-4 fade-in">
          {/* Driver QR */}
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-xs text-sakay-text-muted font-medium mb-3 uppercase tracking-wider">My Driver QR</p>
            <div className="inline-block rounded-xl border-2 border-sakay-border p-3 bg-white">
              <QRCode value={publicKey} size={160} level="M" />
            </div>
            <p className="text-xs text-sakay-text-muted mt-3">Passengers scan this to send PHP payment</p>
          </div>

          {/* Recent Payments Received */}
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-md bg-sakay-accent/10 flex items-center justify-center text-sakay-accent">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-sakay-text">Recent Payments Received</h3>
            </div>

            {loading ? (
              <p className="text-xs text-sakay-text-muted">Loading payments…</p>
            ) : recentPayments.length === 0 ? (
              <p className="text-xs text-sakay-text-muted">No payments received yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {recentPayments.map((pay) => (
                  <div key={pay.id} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-sakay-surface-2 border border-sakay-border/40">
                    <div>
                      <p className="font-mono text-sakay-text font-medium">
                        From: {pay.from.slice(0, 6)}…{pay.from.slice(-6)}
                      </p>
                      <p className="text-[10px] text-sakay-text-muted mt-0.5">
                        {new Date(pay.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sakay-accent">+{pay.amount} PHP</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Status messages ─── */}
      {msg && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 fade-in">
          <div className="flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">{msg}</p>
              {txHash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs text-sakay-accent hover:underline"
                >
                  View on Stellar Expert →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 fade-in">
          <p className="text-sm text-sakay-red break-words">{error}</p>
        </div>
      )}
    </>
  );
}
