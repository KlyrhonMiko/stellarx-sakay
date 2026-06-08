import { Horizon } from '@stellar/stellar-sdk';
import { HORIZON_URL } from './stellar';

// Horizon is used for historical/account reads like balances.
const horizon = new Horizon.Server(HORIZON_URL);

export interface Balances {
  xlm: string;
  usdc: string;
  funded: boolean;
}

export async function fetchBalances(publicKey: string): Promise<Balances> {
  try {
    const account = await horizon.loadAccount(publicKey);
    let xlm = '0';
    let usdc = '0';

    for (const b of account.balances) {
      if (b.asset_type === 'native') {
        xlm = parseFloat(b.balance).toFixed(2);
      } else if (
        (b.asset_type === 'credit_alphanum4' ||
          b.asset_type === 'credit_alphanum12') &&
        b.asset_code === 'USDC'
      ) {
        usdc = parseFloat(b.balance).toFixed(2);
      }
    }
    return { xlm, usdc, funded: true };
  } catch (e: unknown) {
    // 404 = account does not exist yet (not funded).
    const status = (e as { response?: { status?: number } })?.response?.status;
    if (status === 404 || (e as { name?: string })?.name === 'NotFoundError') {
      return { xlm: '0', usdc: '0', funded: false };
    }
    throw e;
  }
}

export interface RecentPayment {
  id: string;
  from: string;
  amount: string;
  asset: string;
  createdAt: string;
}

/** Fetch the last `limit` incoming payments to this account from Horizon. */
export async function fetchRecentPayments(
  publicKey: string,
  limit = 10,
): Promise<RecentPayment[]> {
  try {
    const url = `${HORIZON_URL}/accounts/${publicKey}/payments?order=desc&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const records = data._embedded?.records ?? [];

    return records
      .filter(
        (r: Record<string, string>) =>
          r.type === 'payment' && r.to === publicKey,
      )
      .map((r: Record<string, string>) => ({
        id: r.id,
        from: r.from,
        amount: parseFloat(r.amount).toFixed(2),
        asset: r.asset_type === 'native' ? 'XLM' : r.asset_code ?? '?',
        createdAt: r.created_at,
      }));
  } catch {
    return [];
  }
}
