import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { ResetPasswordDto } from '../../../application/dtos/reset-password.dto'

const valid = { email: 'user@example.com', code: '012345', password: 'new password', password_confirmation: 'new password' }

describe('ResetPasswordDto', () => {
  it('accepts the defined request while preserving leading zeros', async () => {
    const dto = plainToInstance(ResetPasswordDto, valid)
    expect(await validate(dto)).toEqual([])
    expect(dto.code).toBe('012345')
  })

  it.each([{}, { ...valid, email: 'invalid' }, { ...valid, code: '12345' }, { ...valid, code: '1234567' },
    { ...valid, code: 'ABCDEF' }, { ...valid, code: 123456 }, { ...valid, code: null },
    { ...valid, password: '' }, { ...valid, password: 123 }, { ...valid, password_confirmation: null },
    { ...valid, role: 'admin' },
  ])('rejects invalid request %p', async input => {
    expect((await validate(plainToInstance(ResetPasswordDto, input), { whitelist: true, forbidNonWhitelisted: true })).length).toBeGreaterThan(0)
  })
})
