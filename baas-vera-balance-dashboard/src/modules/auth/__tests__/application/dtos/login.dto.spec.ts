import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { LoginDto } from '../../../application/dtos/login.dto'

describe('LoginDto', () => {
  it('normalizes email while preserving password whitespace', async () => {
    const dto = plainToInstance(LoginDto, { email: ' USER@EXAMPLE.COM ', password: ' password ' })
    expect(await validate(dto)).toEqual([])
    expect(dto.email).toBe('user@example.com')
    expect(dto.password).toBe(' password ')
  })

  it.each([{}, { email: 'invalid', password: 'valid' }, { email: null, password: 'valid' },
    { email: 'user@example.com', password: '' }, { email: 'user@example.com', password: 123 },
    { email: 'user@example.com', password: null }, { email: 'user@example.com', password: 'valid', role: 'admin' },
  ])('rejects malformed input %p', async input => {
    const dto = plainToInstance(LoginDto, input)
    expect((await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).length).toBeGreaterThan(0)
  })
})
