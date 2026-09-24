import { scrypt } from 'node:crypto';
import { ScryptPasswordHasherAdapter } from '../../../infrastructure/providers/scrypt-password-hasher.adapter';

describe('ScryptPasswordHasherAdapter', () => {
  it('uses a unique salt and a verifiable password hash without truncation', async () => {
    const adapter = new ScryptPasswordHasherAdapter();
    const password = 'contraseña '.repeat(10);
    const first = await adapter.hash(password);
    const second = await adapter.hash(password);
    expect(first).not.toBe(second);
    expect(first).not.toContain(password);
    const [algorithm, n, r, p, salt, hash] = first.split('$');
    expect(algorithm).toBe('scrypt');
    expect(salt).toHaveLength(32);
    const derive = (value: string) => new Promise<Buffer>((resolve, reject) => {
      scrypt(value, salt, 64, { N: Number(n), r: Number(r), p: Number(p), maxmem: 256 * 1024 * 1024 },
        (error, key) => error ? reject(error) : resolve(key));
    });
    expect((await derive(password)).toString('hex')).toBe(hash);
    expect((await derive(password.slice(0, 72))).toString('hex')).not.toBe(hash);
  }, 15000);
});
