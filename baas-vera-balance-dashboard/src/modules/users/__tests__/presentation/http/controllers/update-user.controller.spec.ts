import { Test } from '@nestjs/testing'
import { HttpException } from '@nestjs/common'
import { UpdateUserController } from '../../../../presentation/http/controllers/update-user.controller'
import { UpdateUserUseCase } from '../../../../application/use-cases/update-user.use-case'
import {
  UserNotFoundError,
  UserUpdateConflictError,
  EmptyUserUpdateError,
  InvalidUserUpdateFieldsError,
  UserAlreadyExistsError,
} from '../../../../domain/errors/user.error'
import { USER_ROLES } from '../../../../../../constants/user-roles.constant'

const id = '22222222-2222-4222-8222-222222222222'
const actor = { id: 'admin-1', role: USER_ROLES.ADMIN, clinic: null }

describe('UpdateUserController', () => {
  const execute = jest.fn()
  let controller: UpdateUserController
  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ controllers: [UpdateUserController], providers: [{ provide: UpdateUserUseCase, useValue: { execute } }] }).compile()
    controller = module.get(UpdateUserController)
    await module.close()
  })

  it('passes the ID, partial DTO to the use case', async () => {
    const result = { id, name: 'New' }
    execute.mockResolvedValue(result)
    await expect(controller.execute(id, { name: 'New' })).resolves.toBe(result)
    expect(execute).toHaveBeenCalledWith(id, { name: 'New' })
  })

  it.each([
    [new UserNotFoundError(), 404],
    [new UserAlreadyExistsError(), 409],
    [new UserUpdateConflictError(), 409],
    [new EmptyUserUpdateError(), 400],
    [new InvalidUserUpdateFieldsError(), 400],
  ] as const)('translates %s to %s for the requested instance', async (error, status) => {
    execute.mockRejectedValue(error)
    let translated: unknown
    try {
      await controller.execute(id, { name: 'New' })
    } catch (result) {
      translated = result
    }
    expect(translated).toBeInstanceOf(HttpException)
    expect((translated as HttpException).getStatus()).toBe(status)
    expect((translated as HttpException).getResponse()).toMatchObject({ status, instance: `/users/${id}` })
  })

  it('preserves unexpected failures for the global filter', async () => {
    const error = new Error('Storage unavailable')
    execute.mockRejectedValue(error)
    await expect(controller.execute(id, { name: 'New' })).rejects.toBe(error)
  })
})
