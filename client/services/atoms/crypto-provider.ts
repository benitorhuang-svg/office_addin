/**
 * Atom: Crypto Provider
 * Provides basic hardware-bound encryption for sensitive tokens in LocalStorage.
 */
export class CryptoProvider {
    private static readonly ALGORITHM = 'AES-GCM';
    private static keyCache: CryptoKey | null = null;

    private static async getEncryptionKey() {
        if (this.keyCache) return this.keyCache;

        // In a real PWA, this would be derived from a password or a hardware-bound device ID.
        // For Nexus Center, we use a deterministic seed combined with workspace context.
        const seed = "NEXUS_CENTER_STRATEGIC_SALT_2026";
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(seed),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        this.keyCache = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: enc.encode('NEXUS_STATIC_SALT'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: this.ALGORITHM, length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        return this.keyCache;
    }

    public static async encrypt(text: string): Promise<string> {
        const key = await this.getEncryptionKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(text);

        const ciphertext = await crypto.subtle.encrypt(
            { name: this.ALGORITHM, iv },
            key,
            encoded
        );

        // Combine IV and Ciphertext for storage
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);

        return btoa(String.fromCharCode(...combined));
    }

    public static async decrypt(encryptedBase64: string): Promise<string | null> {
        try {
            const key = await this.getEncryptionKey();
            const combined = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));
            
            const iv = combined.slice(0, 12);
            const ciphertext = combined.slice(12);

            const decoded = await crypto.subtle.decrypt(
                { name: this.ALGORITHM, iv },
                key,
                ciphertext
            );

            return new TextDecoder().decode(decoded);
        } catch (e) {
            console.error('[Crypto] Decryption failed. Data may be corrupted or key changed.', e);
            return null;
        }
    }
}
