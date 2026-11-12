import { Test } from '@nestjs/testing'
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case'
import { InvalidAccessTokenError } from '../../../domain/errors/auth.error'

describe('LogoutUseCase', () => {
  const verify = jest.fn()
  let useCase: LogoutUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ providers: [
      { provide: LogoutUseCase, useFactory: () => new LogoutUseCase({ verify }) },
    ] }).compile()
    useCase = module.get(LogoutUseCase)
    await module.close()
  })

  it('validates the access token and returns no response data', async () => {
    verify.mockResolvedValue('user-id')
    await expect(useCase.execute('access-token')).resolves.toBeUndefined()
    expect(verify).toHaveBeenCalledWith('access-token')
  })

  it('rejects an invalid token', async () => {
    verify.mockRejectedValue(new InvalidAccessTokenError())
    await expect(useCase.execute('invalid')).rejects.toThrow(InvalidAccessTokenError)
  })

  it('propagates infrastructure failures', async () => {
    const error = new Error('Configuration unavailable')
    verify.mockRejectedValue(error)
    await expect(useCase.execute('token')).rejects.toBe(error)
  })
})
