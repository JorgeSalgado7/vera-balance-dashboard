import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { ForgotPasswordDto } from '../../../application/dtos/forgot-password.dto'

describe('ForgotPasswordDto', () => {
  it('accepts only a valid email', async () => {
    expect(await validate(plainToInstance(ForgotPasswordDto, { email: 'user@example.com' }))).toEqual([])
  })
  it.each([{}, { email: null }, { email: 123 }, { email: 'invalid' }, { email: 'user@example.com', code: '123456' }])('rejects invalid input %p', async input => {
    expect((await validate(plainToInstance(ForgotPasswordDto, input), { whitelist: true, forbidNonWhitelisted: true })).length).toBeGreaterThan(0)
  })
})
