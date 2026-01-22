import { Injectable, Logger } from '@nestjs/common';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { BIP32Factory } from 'bip32';
import * as bip39 from 'bip39';
import ECPairFactory from 'ecpair';
import { MempoolApiService } from './mempool-api.service';
import { BitcoinWallet } from './types/bitcoin.types';

bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);

const NETWORK = bitcoin.networks.testnet;

export interface BitcoinTransactionResult {
  txid: string;
  hex: string;
  fee: number; // satoshis
}

@Injectable()
export class BitcoinService {
  private readonly logger = new Logger(BitcoinService.name);

  constructor(private readonly mempoolApi: MempoolApiService) {}

  createWallet(): BitcoinWallet {
    // Generate random mnemonic (12 words is standard, 24 needs wordlist param)
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);

    // Derive key using BIP84 path for native SegWit (m/84'/1'/0'/0/0)
    // 1' = testnet, 0' = first account, 0 = external chain, 0 = first address
    const root = bip32.fromSeed(seed, NETWORK);
    const child = root.derivePath("m/84'/1'/0'/0/0");

    // Create SegWit (bech32) address - starts with tb1 on testnet
    const pubkeyBuffer = Buffer.from(child.publicKey);
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: pubkeyBuffer,
      network: NETWORK,
    });

    // Convert private key to WIF (Wallet Import Format)
    const privateKeyWif = child.toWIF();

    this.logger.log(`Created new Bitcoin testnet wallet: ${address}`);

    return {
      address: address!,
      privateKey: privateKeyWif,
      publicKey: pubkeyBuffer.toString('hex'),
    };
  }
  /**
   * Estimate transaction fee in satoshis
   * @param inputCount Number of UTXOs to spend
   * @param outputCount Number of outputs (usually 2: recipient + change)
   * @param feeRate Fee rate in sat/vB (optional, will fetch recommended if not provided)
   */
  async estimateFee(
    inputCount: number,
    outputCount: number = 2,
    feeRate?: number,
  ): Promise<{ fee: number; feeRate: number }> {
    // Get recommended fee rate if not provided
    if (!feeRate) {
      const fees = await this.mempoolApi.getFeeEstimates();
      feeRate = fees.halfHourFee; // Use medium priority
    }

    // Estimate transaction size for P2WPKH (SegWit)
    // P2WPKH input: ~68 vBytes, output: ~31 vBytes, overhead: ~10.5 vBytes
    const vSize = Math.ceil(10.5 + inputCount * 68 + outputCount * 31);
    const fee = vSize * feeRate;

    return { fee, feeRate };
  }
}
