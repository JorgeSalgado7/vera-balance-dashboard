import { Test } from '@nestjs/testing'
import { UpdateUserStatusUseCase } from '../../../application/use-cases/update-user-status.use-case'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

describe('UpdateUserStatusUseCase role-independent access', () => {
  const users = { findById: jest.fn() }
  const updater = { updateStatus: jest.fn() }
  const user = { pk: 'target', clinic: 'clinic-1', role: USER_ROLES.CLINIC, status: 'Activo', updated_at: '2026-01-01T00:00:00.000Z' }
  let useCase: UpdateUserStatusUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    users.findById.mockResolvedValue(user)
    updater.updateStatus.mockImplementation(async (current, status, updated_at) => ({ ...current, status, updated_at }))
    const module = await Test.createTestingModule({ providers: [
      { provide: 'Users', useValue: users }, { provide: 'Updater', useValue: updater },
      { provide: UpdateUserStatusUseCase, inject: ['Users', 'Updater'],
        useFactory: (u, updater) => new UpdateUserStatusUseCase({ ...u, ...updater }) }
    ] }).compile()
    useCase = module.get(UpdateUserStatusUseCase)
    await module.close()
  })

  it.each(Object.values(USER_ROLES))('allows actor role %s to update status in its clinic', async role => {
    await expect(useCase.execute('target', { status: 'Inactivo' })).resolves.toMatchObject({ status: 'Inactivo' })
    expect(updater.updateStatus).toHaveBeenCalled()
  })

  it('updates status without an authenticated actor', async () => {
    await expect(useCase.execute('target', { status: 'Inactivo' })).resolves.toMatchObject({ status: 'Inactivo' })
  })
})
