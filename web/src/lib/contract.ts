import {
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Account,
  rpc,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import { server, NETWORK_PASSPHRASE, CONTRACT_ID } from './stellar';

// A real, funded testnet account used ONLY as the source for read-only
// simulations. Nothing is signed or submitted for reads, so any existing
// account works — we reuse the Circle USDC issuer.
const READ_SOURCE = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

export function contractConfigured(): boolean {
  return Boolean(CONTRACT_ID);
}

export async function readStudentPasses(student: string): Promise<number> {
  const contract = new Contract(CONTRACT_ID);
  const source = new Account(READ_SOURCE, '0');

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call('get_student_passes', nativeToScVal(student, { type: 'address' }))
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
    return 0; // Return 0 if not initialized or fails
  }

  const passes = scValToNative(sim.result.retval) as bigint;
  return Number(passes);
}

export async function readDriverBalance(driver: string): Promise<number> {
  const contract = new Contract(CONTRACT_ID);
  const source = new Account(READ_SOURCE, '0');

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call('get_driver_balance', nativeToScVal(driver, { type: 'address' }))
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim) || !sim.result) {
    return 0;
  }

  const balance = scValToNative(sim.result.retval) as bigint;
  return Number(balance);
}

export async function buildBuyPassXDR(
  sender: string,
  amount: number,
): Promise<string> {
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(sender);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'buy_pass',
        nativeToScVal(sender, { type: 'address' }),
        nativeToScVal(BigInt(Math.trunc(amount)), { type: 'i128' }),
      ),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — buy_pass call would not succeed.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}

export async function buildRecordRideXDR(
  driver: string,
  student: string,
): Promise<string> {
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(driver);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'record_ride',
        nativeToScVal(driver, { type: 'address' }),
        nativeToScVal(student, { type: 'address' }),
      ),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — record_ride call would not succeed.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}

export async function buildClaimXDR(
  driver: string,
): Promise<string> {
  const contract = new Contract(CONTRACT_ID);
  const account = await server.getAccount(driver);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        'claim',
        nativeToScVal(driver, { type: 'address' }),
      ),
    )
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!rpc.Api.isSimulationSuccess(sim)) {
    throw new Error('Simulation failed — claim call would not succeed.');
  }

  return rpc.assembleTransaction(tx, sim).build().toXDR();
}
