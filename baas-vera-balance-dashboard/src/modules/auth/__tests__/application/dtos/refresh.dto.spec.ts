import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { RefreshDto } from '../../../application/dtos/refresh.dto'

describe('RefreshDto', () => {
  it('accepts the refresh token request', async () => {
    expect(await validate(plainToInstance(RefreshDto, { refresh_token: 'signed-token' }))).toEqual([])
  })

  it.each([{}, { refresh_token: '' }, { refresh_token: null }, { refresh_token: 123 },
    { refresh_token: 'token', user: 'unexpected' },
  ])('rejects malformed input %p', async input => {
    const errors = await validate(plainToInstance(RefreshDto, input), { whitelist: true, forbidNonWhitelisted: true })
    expect(errors.length).toBeGreaterThan(0)
  })
})
