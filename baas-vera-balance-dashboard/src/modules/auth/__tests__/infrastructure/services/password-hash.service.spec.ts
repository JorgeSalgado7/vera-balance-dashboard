import { PasswordHasher } from '@nestjs/authentication'
import { PasswordHashService } from '../../../infrastructure/services/password-hash.service'

describe('PasswordHashService', () => {
  it('hashes passwords with the installed authentication package and verifies the result', async () => {
    const hasher = new PasswordHasher()
    const service = new PasswordHashService(hasher)
    const password = 'test password for secure hashing'
    const first = await service.hash(password)
    const second = await service.hash(password)
    expect(first).not.toBe(password)
    expect(first).not.toContain(password)
    expect(first).not.toBe(second)
    await expect(hasher.verify(password, first)).resolves.toBe(true)
    await expect(hasher.verify('wrong password', first)).resolves.toBe(false)
  }, 15000)

  it('propagates hashing failures without returning the original password', async () => {
    const error = new Error('Hashing unavailable')
    const hash = jest.fn().mockRejectedValue(error)
    const service = new PasswordHashService({ hash } as unknown as PasswordHasher)
    await expect(service.hash('secret')).rejects.toBe(error)
    expect(hash).toHaveBeenCalledWith('secret')
  })
})
