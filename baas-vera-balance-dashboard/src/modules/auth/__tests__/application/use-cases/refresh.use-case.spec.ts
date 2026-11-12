import { Test } from '@nestjs/testing'
import { RefreshUseCase } from '../../../application/use-cases/refresh.use-case'
import { InvalidRefreshTokenError } from '../../../domain/errors/auth.error'

describe('RefreshUseCase', () => {
  const verify = jest.fn()
  const issue = jest.fn()
  let useCase: RefreshUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ providers: [
      { provide: RefreshUseCase, useFactory: () => new RefreshUseCase({ verify }, { issue }) },
    ] }).compile()
    useCase = module.get(RefreshUseCase)
    await module.close()
  })

  it('returns only the two tokens for the verified identity', async () => {
    verify.mockResolvedValue('user-id')
    issue.mockResolvedValue({ access_token: 'new-access', refresh_token: 'new-refresh', user: { id: 'private' } })
    await expect(useCase.execute({ refresh_token: 'original-refresh' })).resolves.toEqual({
      access_token: 'new-access', refresh_token: 'new-refresh',
    })
    expect(verify).toHaveBeenCalledWith('original-refresh')
    expect(issue).toHaveBeenCalledWith('user-id')
  })

  it('does not issue tokens when verification fails', async () => {
    verify.mockRejectedValue(new InvalidRefreshTokenError())
    await expect(useCase.execute({ refresh_token: 'invalid' })).rejects.toThrow(InvalidRefreshTokenError)
    expect(issue).not.toHaveBeenCalled()
  })

  it('propagates signing failures', async () => {
    verify.mockResolvedValue('user-id')
    const error = new Error('Signing unavailable')
    issue.mockRejectedValue(error)
    await expect(useCase.execute({ refresh_token: 'valid' })).rejects.toBe(error)
  })
})
