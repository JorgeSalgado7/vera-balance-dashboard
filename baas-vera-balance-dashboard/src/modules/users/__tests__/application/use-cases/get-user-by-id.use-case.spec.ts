import { Test } from '@nestjs/testing'
import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case'
import { UserNotFoundError } from '../../../domain/errors/user.error'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

const userId = '11111111-1111-4111-8111-111111111111'
const user = Object.assign(new UserEntity(), {
  pk: userId,
  name: 'User',
  email: 'user@example.com',
  password: 'sensitive-password-hash',
  professional_license: '123',
  role: USER_ROLES.THERAPIST,
  status: 'Activo',
  clinic: 'clinic-1',
  gsi1pk: 'USER',
  gsi1sk: `USER#${userId}`,
  gsi2pk: 'CLINIC#clinic-1',
  gsi2sk: `USER#${userId}`,
  gsi3pk: 'EMAIL#user@example.com',
  gsi3sk: `USER#${userId}`,
  created_at: '2026-11-02T00:00:00.000Z',
  updated_at: '2026-11-02T00:00:00.000Z',
})
const admin = { id: 'admin-1', role: USER_ROLES.ADMIN, clinic: null }

describe('GetUserByIdUseCase', () => {
  const findById = jest.fn()
  let useCase: GetUserByIdUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    findById.mockResolvedValue(user)
    const module = await Test.createTestingModule({
      providers: [
        { provide: 'IUserRepository', useValue: { findById } },
        {
          provide: GetUserByIdUseCase,
          inject: ['IUserRepository'],
          useFactory: (repository: IUserRepository) => new GetUserByIdUseCase(repository),
        },
      ],
    }).compile()
    useCase = module.get(GetUserByIdUseCase)
    await module.close()
  })

  it.each(['Activo', 'Inactivo'] as const)('returns user with status %s to the administrator', async (status) => {
    findById.mockResolvedValue({ ...user, status, clinic: null })
    await expect(useCase.execute(userId)).resolves.toMatchObject({ id: userId, status, clinic: null })
    expect(findById).toHaveBeenCalledWith(userId)
    expect(findById).toHaveBeenCalledTimes(1)
  })

  it.each([
    { id: 'clinic-user', role: USER_ROLES.CLINIC, clinic: 'clinic-1' },
    { id: 'therapist-2', role: USER_ROLES.THERAPIST, clinic: 'clinic-1' },
  ])('allows the authorized actor %j', async (actor) => {
    await expect(useCase.execute(userId)).resolves.toMatchObject({ id: userId })
  })



  it('returns a not-found error when the requested user does not exist', async () => {
    findById.mockResolvedValue(null)
    await expect(useCase.execute(userId)).rejects.toBeInstanceOf(UserNotFoundError)
  })

  it('returns exactly the public User fields without mutating the stored entity', async () => {
    const result = await useCase.execute(userId)
    expect(result).toEqual({
      id: userId,
      name: user.name,
      email: user.email,
      professional_license: user.professional_license,
      role: user.role,
      status: user.status,
      clinic: user.clinic,
      created_at: user.created_at,
      updated_at: user.updated_at,
    })
    expect(JSON.stringify(result)).not.toContain(user.password)
    for (const property of ['password', 'pk', 'sk', 'gsi1pk', 'gsi1sk', 'gsi2pk', 'gsi2sk', 'gsi3pk', 'gsi3sk']) expect(result).not.toHaveProperty(property)
    expect(user.password).toBe('sensitive-password-hash')
  })

  it('propagates database failures rather than returning not found', async () => {
    const error = new Error('GetItem unavailable')
    findById.mockRejectedValue(error)
    await expect(useCase.execute(userId)).rejects.toBe(error)
  })
})
