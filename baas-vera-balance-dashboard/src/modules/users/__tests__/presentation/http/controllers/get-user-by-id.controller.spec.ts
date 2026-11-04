import { Test } from '@nestjs/testing'
import { HttpException } from '@nestjs/common'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { GetUserByIdController } from '../../../../presentation/http/controllers/get-user-by-id.controller'
import { GetUserByIdUseCase } from '../../../../application/use-cases/get-user-by-id.use-case'
import { UserNotFoundError } from '../../../../domain/errors/user-not-found.error'
import { UserConsultationNotAllowedError } from '../../../../domain/errors/user-consultation-not-allowed.error'
import { USER_ROLES } from '../../../../../../constants/user-roles.constant'

const userId = '11111111-1111-4111-8111-111111111111'
const actor = { id: 'admin-1', role: USER_ROLES.ADMIN, clinic: null }

describe('GetUserByIdController', () => {
  const execute = jest.fn()
  let controller: GetUserByIdController

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ controllers: [GetUserByIdController], providers: [{ provide: GetUserByIdUseCase, useValue: { execute } }] }).compile()
    controller = module.get(GetUserByIdController)
    await module.close()
  })

  it('passes userId and the trusted actor to the use case and returns the response unchanged', async () => {
    const result = { id: userId }
    execute.mockResolvedValue(result)
    await expect(controller.execute(userId, actor)).resolves.toBe(result)
    expect(execute).toHaveBeenCalledWith(userId, actor)
  })

  it.each([
    [new UserNotFoundError(), 404],
    [new UserConsultationNotAllowedError(), 403],
  ] as const)('translates %s to HTTP %s with the requested instance', async (error, status) => {
    execute.mockRejectedValue(error)
    let translated: unknown
    try {
      await controller.execute(userId, actor)
    } catch (result) {
      translated = result
    }
    expect(translated).toBeInstanceOf(HttpException)
    expect((translated as HttpException).getStatus()).toBe(status)
    expect((translated as HttpException).getResponse()).toMatchObject({ status, instance: `/users/${userId}`, errors: [] })
  })

  it('preserves unexpected failures for the global filter', async () => {
    const error = new Error('Database unavailable')
    execute.mockRejectedValue(error)
    await expect(controller.execute(userId, actor)).rejects.toBe(error)
  })

  it('passes a string identifier without requiring UUID format', async () => {
    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, GetUserByIdController, 'execute')
    const parameter = Object.values(metadata).find((entry: any) => entry.data === 'userId') as { pipes: unknown[] }
    expect(parameter.pipes).toEqual([])
    execute.mockResolvedValue({ id: 'user-123' })
    await expect(controller.execute('user-123', actor)).resolves.toEqual({ id: 'user-123' })
    expect(execute).toHaveBeenCalledWith('user-123', actor)
  })
})
