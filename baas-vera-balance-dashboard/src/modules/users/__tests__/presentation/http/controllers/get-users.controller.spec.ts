import { Test } from '@nestjs/testing'
import { HttpException } from '@nestjs/common'
import { GetUsersController } from '../../../../presentation/http/controllers/get-users.controller'
import { GetUsersUseCase } from '../../../../application/use-cases/get-users.use-case'
import { USER_ROLES } from '../../../../../../constants/user-roles.constant'

describe('GetUsersController', () => {
  const execute = jest.fn()
  let controller: GetUsersController
  const actor = { role: USER_ROLES.ADMIN }

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ controllers: [GetUsersController], providers: [{ provide: GetUsersUseCase, useValue: { execute } }] }).compile()
    controller = module.get(GetUsersController)
    await module.close()
  })

  it.each([{ result: [] }, { result: [{ id: 'user-1' }] }])('returns the use case collection unchanged (%j)', async ({ result }) => {
    execute.mockResolvedValue(result)
    await expect(controller.execute()).resolves.toBe(result)
    expect(execute).toHaveBeenCalledWith()
  })



  it('preserves unexpected errors for the global filter', async () => {
    const error = new Error('Storage unavailable')
    execute.mockRejectedValue(error)
    await expect(controller.execute()).rejects.toBe(error)
  })
})
