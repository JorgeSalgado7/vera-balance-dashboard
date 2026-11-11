import { Test } from '@nestjs/testing'
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'
import { UserHasTherapeuticProcessesError } from '../../../domain/errors/user-has-therapeutic-processes.error'

describe('DeleteUserUseCase role-independent access', () => {
  const users = { findById: jest.fn() }
  const relations = { hasTherapeuticProcesses: jest.fn() }
  const deleter = { delete: jest.fn() }
  const user = { pk: 'target', role: USER_ROLES.THERAPIST }
  let useCase: DeleteUserUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    users.findById.mockResolvedValue(user)
    relations.hasTherapeuticProcesses.mockResolvedValue(false)
    const module = await Test.createTestingModule({ providers: [
      { provide: 'Users', useValue: users }, { provide: 'Relations', useValue: relations }, { provide: 'Deleter', useValue: deleter },
      { provide: DeleteUserUseCase, inject: ['Users', 'Relations', 'Deleter'],
        useFactory: (u, r, d) => new DeleteUserUseCase(u, r, d) }
    ] }).compile()
    useCase = module.get(DeleteUserUseCase)
    await module.close()
  })

  it.each(Object.values(USER_ROLES))('allows actor role %s to delete a user', async role => {
    await expect(useCase.execute('target')).resolves.toBeUndefined()
    expect(deleter.delete).toHaveBeenCalledWith(user)
  })

  it('still rejects deletion with therapeutic processes', async () => {
    relations.hasTherapeuticProcesses.mockResolvedValue(true)
    await expect(useCase.execute('target')).rejects.toBeInstanceOf(UserHasTherapeuticProcessesError)
    expect(deleter.delete).not.toHaveBeenCalled()
  })
})
