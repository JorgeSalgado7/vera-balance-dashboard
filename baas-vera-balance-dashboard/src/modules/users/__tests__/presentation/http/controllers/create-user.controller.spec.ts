import { Test } from '@nestjs/testing'
import { HttpException } from '@nestjs/common'
import { CreateUserController } from '../../../../presentation/http/controllers/create-user.controller'
import { CreateUserUseCase } from '../../../../application/use-cases/create-user.use-case'
import type { CreateUserActor } from '../../../../application/use-cases/create-user.use-case'
import { UserAlreadyExistsError, UserCreationNotAllowedError, MissingUserNameError } from '../../../../domain/errors/user.error'
import { USER_ROLES } from '../../../../../../constants/user-roles.constant'

const dto = { name: 'User', email: 'user@example.com', password: 'Password123!', professional_license: '123', role: USER_ROLES.THERAPIST, clinic: '11111111-1111-4111-8111-111111111111' }
const actor: CreateUserActor = { id: 'admin-1', role: USER_ROLES.ADMIN, clinic: null }

describe('CreateUserController', () => {
  const execute = jest.fn()
  let controller: CreateUserController

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({ controllers: [CreateUserController], providers: [{ provide: CreateUserUseCase, useValue: { execute } }] }).compile()
    controller = module.get(CreateUserController)
  })

  it('passes the DTO and authenticated actor to the use case and returns its public response', async () => {
    const response = {
      id: 'user-1',
      name: dto.name,
      email: dto.email,
      professional_license: dto.professional_license,
      role: dto.role,
      status: 'Activo',
      clinic: dto.clinic,
      created_at: '2026-10-28T00:00:00.000Z',
      updated_at: '2026-10-28T00:00:00.000Z',
    }
    execute.mockResolvedValue(response)
    await expect(controller.execute(dto, actor)).resolves.toBe(response)
    expect(execute).toHaveBeenCalledWith(dto, actor)
    expect(execute).toHaveBeenCalledTimes(1)
  })

  it.each([
    [new UserAlreadyExistsError(), 409],
    [new UserCreationNotAllowedError(), 403],
    [new MissingUserNameError(), 400],
  ])('translates a use case error to HTTP %s', async (error, status) => {
    execute.mockRejectedValue(error)
    try {
      await controller.execute(dto, actor)
      throw new Error('Expected controller failure')
    } catch (translated) {
      expect(translated).toBeInstanceOf(HttpException)
      expect((translated as HttpException).getStatus()).toBe(status)
      expect((translated as HttpException).getResponse()).toMatchObject({ instance: '/users', detail: error.message })
    }
  })

  it('rethrows unknown failures without replacing their cause', async () => {
    const error = new Error('Database unavailable')
    execute.mockRejectedValue(error)
    await expect(controller.execute(dto, actor)).rejects.toBe(error)
  })
})
