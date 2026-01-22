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

  /**
   * Send Bitcoin transaction
   * @param fromPrivateKeyWif Sender's private key in WIF format
   * @param toAddress Recipient's address
   * @param amountSatoshis Amount to send in satoshis
   * @param feeRate Optional fee rate in sat/vB
   */
  async sendTransaction(
    fromPrivateKeyWif: string,
    toAddress: string,
    amountSatoshis: number,
    feeRate?: number,
  ): Promise<BitcoinTransactionResult> {
    // Import sender's key
    const keyPair = ECPair.fromWIF(fromPrivateKeyWif, NETWORK);
    const { address: fromAddress } = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(keyPair.publicKey),
      network: NETWORK,
    });

    this.logger.log(
      `Sending ${amountSatoshis} satoshis from ${fromAddress} to ${toAddress}`,
    );

    // Get UTXOs
    const utxos = await this.mempoolApi.getUtxos(fromAddress!);
    if (utxos.length === 0) {
      throw new Error('No UTXOs available');
    }

    // Calculate fee
    const { fee, feeRate: usedFeeRate } = await this.estimateFee(
      utxos.length,
      2,
      feeRate,
    );
    this.logger.log(`Estimated fee: ${fee} satoshis (${usedFeeRate} sat/vB)`);

    // Calculate total available
    const totalAvailable = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    const totalNeeded = amountSatoshis + fee;

    if (totalAvailable < totalNeeded) {
      throw new Error(
        `Insufficient balance. Available: ${totalAvailable}, Needed: ${totalNeeded} (${amountSatoshis} + ${fee} fee)`,
      );
    }

    // Build transaction using PSBT
    const psbt = new bitcoin.Psbt({ network: NETWORK });

    // Add inputs
    for (const utxo of utxos) {
      const txHex = await this.mempoolApi.getRawTransaction(utxo.txid);
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(txHex, 'hex'),
        witnessUtxo: {
          script: bitcoin.payments.p2wpkh({
            pubkey: Buffer.from(keyPair.publicKey),
            network: NETWORK,
          }).output!,
          value: BigInt(utxo.value),
        },
      });
    }

    // Add recipient output
    psbt.addOutput({
      address: toAddress,
      value: BigInt(amountSatoshis),
    });

    // Add change output (if there's change)
    const change = totalAvailable - amountSatoshis - fee;
    if (change > 546) {
      // Dust limit
      psbt.addOutput({
        address: fromAddress!,
        value: BigInt(change),
      });
    }

    // Sign all inputs
    for (let i = 0; i < utxos.length; i++) {
      psbt.signInput(i, keyPair);
    }

    // Finalize and extract
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    const txHex = tx.toHex();
    const txid = tx.getId();

    this.logger.log(`Transaction built: ${txid}`);

    // Broadcast
    const broadcastedTxid = await this.mempoolApi.broadcastTransaction(txHex);
    this.logger.log(`Transaction broadcasted: ${broadcastedTxid}`);

    return {
      txid: broadcastedTxid,
      hex: txHex,
      fee,
    };
  }
}
