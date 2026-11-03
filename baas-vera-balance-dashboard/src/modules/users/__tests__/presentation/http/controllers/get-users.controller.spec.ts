import { Test } from '@nestjs/testing'
import { HttpException } from '@nestjs/common'
import { GetUsersController } from '../../../../presentation/http/controllers/get-users.controller'
import { GetUsersUseCase } from '../../../../application/use-cases/get-users.use-case'
import { UserListingNotAllowedError } from '../../../../domain/errors/user-listing-not-allowed.error'
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
    await expect(controller.execute(actor)).resolves.toBe(result)
    expect(execute).toHaveBeenCalledWith(actor)
  })

  it('translates a forbidden listing to HTTP 403 for the current endpoint', async () => {
    execute.mockRejectedValue(new UserListingNotAllowedError())
    let translated: unknown
    try {
      await controller.execute({ role: USER_ROLES.CLINIC })
    } catch (error) {
      translated = error
    }
    expect(translated).toBeInstanceOf(HttpException)
    expect((translated as HttpException).getStatus()).toBe(403)
    expect((translated as HttpException).getResponse()).toMatchObject({ instance: '/users', status: 403 })
  })

  it('preserves unexpected errors for the global filter', async () => {
    const error = new Error('Storage unavailable')
    execute.mockRejectedValue(error)
    await expect(controller.execute(actor)).rejects.toBe(error)
  })
})
