import { Test } from '@nestjs/testing'
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

const user = Object.assign(new UserEntity(), {
  pk: 'user-1',
  name: 'User',
  email: 'user@example.com',
  password: 'sensitive-hash',
  professional_license: '123',
  role: USER_ROLES.THERAPIST,
  status: 'Activo',
  clinic: 'clinic-1',
  gsi1pk: 'USER',
  gsi1sk: 'USER#user-1',
  gsi2pk: 'CLINIC#clinic-1',
  gsi2sk: 'USER#user-1',
  gsi3pk: 'EMAIL#user@example.com',
  gsi3sk: 'USER#user-1',
  created_at: '2026-11-02T00:00:00.000Z',
  updated_at: '2026-11-02T00:00:00.000Z',
})

describe('GetUsersUseCase', () => {
  const findAll = jest.fn()
  let useCase: GetUsersUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    const module = await Test.createTestingModule({
      providers: [
        { provide: 'IUserRepository', useValue: { findAll } },
        {
          provide: GetUsersUseCase,
          inject: ['IUserRepository'],
          useFactory: (repository: Pick<IUserRepository, 'findAll'>) => new GetUsersUseCase(repository),
        },
      ],
    }).compile()
    useCase = module.get(GetUsersUseCase)
    await module.close()
  })

  it('returns all clinics, global administrators and both active and inactive users', async () => {
    findAll.mockResolvedValue([
      user,
      Object.assign(new UserEntity(), user, { pk: 'user-2', clinic: 'clinic-2', status: 'Inactivo' }),
      Object.assign(new UserEntity(), user, { pk: 'admin-1', role: USER_ROLES.ADMIN, clinic: null }),
    ])
    const result = await useCase.execute()
    expect(findAll).toHaveBeenCalledWith()
    expect(result).toHaveLength(3)
    expect(result[0]).toMatchObject({ id: user.pk, clinic: 'clinic-1', status: 'Activo' })
    expect(result[1]).toMatchObject({ id: 'user-2', clinic: 'clinic-2', status: 'Inactivo' })
    expect(result[2]).toMatchObject({ id: 'admin-1', clinic: null, role: USER_ROLES.ADMIN })
  })

  it.each([USER_ROLES.CLINIC, USER_ROLES.THERAPIST])('allows %s to list users', async (role) => {
    findAll.mockResolvedValue([user])
    await expect(useCase.execute()).resolves.toHaveLength(1)
    expect(findAll).toHaveBeenCalledWith()
  })

  it('returns an empty array when there are no users', async () => {
    findAll.mockResolvedValue([])
    await expect(useCase.execute()).resolves.toEqual([])
  })

  it('includes exactly the public fields and never leaks passwords or internal indexes', async () => {
    findAll.mockResolvedValue([user])
    const [result] = await useCase.execute()
    expect(result).toEqual({
      id: user.pk,
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
    for (const field of ['password', 'pk', 'sk', 'gsi1pk', 'gsi1sk', 'gsi2pk', 'gsi2sk', 'gsi3pk', 'gsi3sk']) expect(result).not.toHaveProperty(field)
  })

  it('propagates a query failure instead of returning a successful empty response', async () => {
    const error = new Error('Storage unavailable')
    findAll.mockRejectedValue(error)
    await expect(useCase.execute()).rejects.toBe(error)
  })
})
