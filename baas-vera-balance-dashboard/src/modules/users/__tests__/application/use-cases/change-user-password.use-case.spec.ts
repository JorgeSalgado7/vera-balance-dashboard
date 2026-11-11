import { Test } from '@nestjs/testing'
import { ChangeUserPasswordUseCase } from '../../../application/use-cases/change-user-password.use-case'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'
import { ValidateChangeUserPasswordDomainService } from '../../../domain/services/validate-change-user-password.domain-service'

describe('ChangeUserPasswordUseCase role-independent access', () => {
  const users = { findById: jest.fn() }
  const verifier = { verify: jest.fn() }
  const hasher = { hash: jest.fn() }
  const updater = { changePassword: jest.fn() }
  const input = { current_password: 'Current123!', password: 'NewPassword123!', password_confirmation: 'NewPassword123!' }
  let useCase: ChangeUserPasswordUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    users.findById.mockResolvedValue({ pk: 'actor', password: 'stored-hash', updated_at: '2026-01-01T00:00:00.000Z' })
    verifier.verify.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    hasher.hash.mockResolvedValue('new-hash')
    const module = await Test.createTestingModule({ providers: [
      ValidateChangeUserPasswordDomainService,
      { provide: 'Users', useValue: users }, { provide: 'Verifier', useValue: verifier },
      { provide: 'Hasher', useValue: hasher }, { provide: 'Updater', useValue: updater },
      { provide: ChangeUserPasswordUseCase, inject: [ValidateChangeUserPasswordDomainService, 'Users', 'Verifier', 'Hasher', 'Updater'],
        useFactory: (d, u, v, h, updater) => new ChangeUserPasswordUseCase(d, u, v, h, updater) }
    ] }).compile()
    useCase = module.get(ChangeUserPasswordUseCase)
    await module.close()
  })

  it.each(Object.values(USER_ROLES))('allows actor role %s to change its own password', async role => {
    await expect(useCase.execute('actor', input)).resolves.toEqual({ message: 'Contraseña actualizada' })
    expect(updater.changePassword).toHaveBeenCalled()
  })

  it('changes a password without an authenticated actor after checking the current password', async () => {
    await expect(useCase.execute('actor', input)).resolves.toEqual({ message: 'Contraseña actualizada' })
    expect(verifier.verify).toHaveBeenCalledWith(input.current_password, 'stored-hash')
  })
})
