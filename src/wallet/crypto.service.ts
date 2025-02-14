import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class CryptoService {
  private readonly CRYPTO_KEY: Buffer;
  constructor(private readonly configService: AppConfigService) {
    this.CRYPTO_KEY = Buffer.from(this.configService.cryptoKey, 'hex');
  }

  encrypt({ privateKey }: { privateKey: string }) {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.CRYPTO_KEY, iv);
    const encrypted = Buffer.concat([
      cipher.update(privateKey),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    const combined = Buffer.concat([iv, tag, encrypted]);

    return combined.toString('hex');
  }

  decrypt({ encryptedKey }: { encryptedKey: string }) {
    const dataBuffer = Buffer.from(encryptedKey, 'hex');
    const iv = dataBuffer.subarray(0, 16);
    const tag = dataBuffer.subarray(16, 32);
    const encryptedData = dataBuffer.subarray(32);
    const decipher = createDecipheriv('aes-256-gcm', this.CRYPTO_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString('utf-8');
  }
}
