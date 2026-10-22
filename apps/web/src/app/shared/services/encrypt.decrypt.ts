// crypto.service.ts
import { Injectable } from '@angular/core';

type EncryptedPayload = {
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64
  iterations: number;
};

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private readonly iterations = 310000; // OWASP-style high PBKDF2 work factor
  private readonly keyLength = 256; // bits
  private readonly ivLength = 12; // AES-GCM standard nonce length (96-bit)

  async encryptString(plainText: string, masterPassword: string): Promise<string> {
    const enc = new TextEncoder();

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

    const key = await this.deriveKey(masterPassword, salt, this.iterations);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: this.toArrayBuffer(iv) },
      key,
      this.toArrayBuffer(enc.encode(plainText))
    );

    const payload: EncryptedPayload = {
      salt: this.toBase64(salt),
      iv: this.toBase64(iv),
      ciphertext: this.toBase64(new Uint8Array(encrypted)),
      iterations: this.iterations
    };

    return JSON.stringify(payload);
  }

  async decryptString(payloadJson: string, masterPassword: string): Promise<string> {
    const dec = new TextDecoder();
    const payload = JSON.parse(payloadJson) as EncryptedPayload;

    const salt = this.fromBase64(payload.salt);
    const iv = this.fromBase64(payload.iv);
    const ciphertext = this.fromBase64(payload.ciphertext);

    const key = await this.deriveKey(masterPassword, salt, payload.iterations);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: this.toArrayBuffer(iv) },
      key,
      this.toArrayBuffer(ciphertext)
    );

    return dec.decode(decrypted);
  }

  private async deriveKey(
    password: string,
    salt: Uint8Array,
    iterations: number
  ): Promise<CryptoKey> {
    const enc = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.toArrayBuffer(enc.encode(password)),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.toArrayBuffer(salt),
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: this.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return new Uint8Array(bytes).buffer;
  }

  private toBase64(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }

  private fromBase64(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
}
