export interface BitcoinWallet {
  address: string;
  privateKey: string; // WIF format
  publicKey: string;
}