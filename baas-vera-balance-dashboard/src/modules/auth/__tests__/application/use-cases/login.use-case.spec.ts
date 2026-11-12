import { FindUserByEmailUseCase } from '../../../../users/application/use-cases/find-user-by-email.use-case'
import { Test } from '@nestjs/testing'
import { LoginUseCase } from '../../../application/use-cases/login.use-case'
import { ValidateLoginDomainService } from '../../../domain/services/validate-login.domain-service'
import { InvalidCredentialsError } from '../../../domain/errors/auth.error'
import type { LoginUser } from '../../../domain/entities/login-user.entity'

const user: LoginUser = {
  id: '11111111-1111-4111-8111-111111111111', name: 'Usuario', email: 'user@example.com',
  password: 'stored-hash', professional_license: '123', role: 'therapist', status: 'Activo',
  clinic: null, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
}

describe('LoginUseCase', () => {
  let useCase: LoginUseCase
  const findByEmail = jest.fn()
  const verify = jest.fn()
  const issue = jest.fn()

  beforeEach(async () => {
    jest.resetAllMocks()
    findByEmail.mockResolvedValue({ ...user, pk: user.id })
    verify.mockResolvedValue(true)
    issue.mockResolvedValue({ access_token: 'access', refresh_token: 'refresh' })
    const module = await Test.createTestingModule({ providers: [
      ValidateLoginDomainService,
      { provide: LoginUseCase, useFactory: (validator: ValidateLoginDomainService) =>
        new LoginUseCase(new FindUserByEmailUseCase({ findByEmail }), { verify }, validator, { issue }),
        inject: [ValidateLoginDomainService] },
    ] }).compile()
    useCase = module.get(LoginUseCase)
    await module.close()
  })

  it.each(['admin', 'clinic', 'therapist'] as const)('authenticates %s without exposing credentials or persistence fields', async role => {
    findByEmail.mockResolvedValue({ ...user, role, pk: user.id, gsi3pk: 'private' })
    const result = await useCase.execute({ email: ' USER@EXAMPLE.COM ', password: ' original password ' })
    expect(findByEmail).toHaveBeenCalledWith('user@example.com')
    expect(verify).toHaveBeenCalledWith(' original password ', 'stored-hash')
    expect(issue).toHaveBeenCalledWith(user.id)
    const { password, created_at, updated_at, professional_license, status, ...publicUser } = user
    expect(result).toEqual({ access_token: 'access', refresh_token: 'refresh', user: { ...publicUser, role } })
    expect(JSON.stringify(result)).not.toContain('stored-hash')
  })

  it('rejects an unknown email with the same credentials error', async () => {
    findByEmail.mockResolvedValue(null)
    await expect(useCase.execute({ email: user.email, password: 'password' })).rejects.toThrow(InvalidCredentialsError)
    expect(verify).not.toHaveBeenCalled()
    expect(issue).not.toHaveBeenCalled()
  })

  it('rejects an incorrect password without issuing tokens', async () => {
    verify.mockResolvedValue(false)
    await expect(useCase.execute({ email: user.email, password: 'wrong' })).rejects.toThrow(InvalidCredentialsError)
    expect(issue).not.toHaveBeenCalled()
  })

  it('rejects an inactive user without issuing tokens', async () => {
    findByEmail.mockResolvedValue({ ...user, pk: user.id, status: 'Inactivo' })
    await expect(useCase.execute({ email: user.email, password: 'password' })).rejects.toThrow(InvalidCredentialsError)
    expect(issue).not.toHaveBeenCalled()
  })

  it('does not limit attempts or lock the account after failed logins', async () => {
    verify.mockResolvedValue(false)
    for (let attempt = 0; attempt < 20; attempt++) {
      await expect(useCase.execute({ email: user.email, password: 'wrong' })).rejects.toThrow(InvalidCredentialsError)
    }
    verify.mockResolvedValue(true)
    await expect(useCase.execute({ email: user.email, password: 'correct' })).resolves.toMatchObject({ access_token: 'access', refresh_token: 'refresh' })
    expect(issue).toHaveBeenCalledTimes(1)
  })

  it.each(['lookup', 'verify', 'sign'])('propagates %s infrastructure failures', async stage => {
    const error = new Error('service unavailable')
    const dependency = stage === 'lookup' ? findByEmail : stage === 'verify' ? verify : issue
    dependency.mockRejectedValue(error)
    await expect(useCase.execute({ email: user.email, password: 'password' })).rejects.toBe(error)
    if (stage !== 'sign') expect(issue).not.toHaveBeenCalled()
  })
})
