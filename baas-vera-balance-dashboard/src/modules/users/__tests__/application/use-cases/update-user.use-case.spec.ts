import { Test } from '@nestjs/testing'
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case'
import { UpdateUserDomainService } from '../../../domain/services/update-user.domain-service'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import type { IUpdateUserRepository } from '../../../domain/repositories/update-user.repository'
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error'
import { InvalidUserUpdateFieldsError } from '../../../domain/errors/invalid-user-update-fields.error'
import { UserEntity } from '../../../domain/entities/user.entity'
import { USER_ROLES } from '../../../../../constants/user-roles.constant'

const user = Object.assign(new UserEntity(), {
  pk: '22222222-2222-4222-8222-222222222222',
  name: 'Original',
  email: 'user@example.com',
  password: 'secret-hash',
  professional_license: '123',
  role: USER_ROLES.THERAPIST,
  status: 'Inactivo',
  clinic: '11111111-1111-4111-8111-111111111111',
  gsi1pk: 'USER',
  gsi1sk: 'USER#id',
  gsi3pk: 'EMAIL#user@example.com',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
})
const admin = { id: 'admin-1', role: USER_ROLES.ADMIN, clinic: null }

describe('UpdateUserUseCase', () => {
  const findById = jest.fn(),
    findByEmail = jest.fn(),
    update = jest.fn()
  let useCase: UpdateUserUseCase

  beforeEach(async () => {
    jest.resetAllMocks()
    findById.mockResolvedValue(user)
    findByEmail.mockResolvedValue(null)
    update.mockImplementation(async (current, changes, updated_at) => ({ ...current, ...changes, updated_at }))
    const module = await Test.createTestingModule({
      providers: [
        UpdateUserDomainService,
        { provide: 'IUserRepository', useValue: { findById, findByEmail } },
        { provide: 'IUpdateUserRepository', useValue: { update } },
        {
          provide: UpdateUserUseCase,
          inject: [UpdateUserDomainService, 'IUserRepository', 'IUpdateUserRepository'],
          useFactory: (domain: UpdateUserDomainService, users: IUserRepository, updater: IUpdateUserRepository) =>
            new UpdateUserUseCase(domain, users, updater),
        },
      ],
    }).compile()
    useCase = module.get(UpdateUserUseCase)
    await module.close()
  })

  it('reads by ID, updates only the supplied fields, preserves other values and returns public data', async () => {
    const result = await useCase.execute(user.pk, { name: ' New ' })
    expect(findById).toHaveBeenCalledWith(user.pk)
    expect(update).toHaveBeenCalledWith(user, { name: 'New' }, expect.any(String))
    expect(result).toMatchObject({ id: user.pk, name: 'New', email: user.email, status: 'Inactivo', created_at: user.created_at })
    expect(Date.parse(result.updated_at)).toBeGreaterThan(Date.parse(user.updated_at))
    expect(user.name).toBe('Original')
    expect(Object.keys(result).sort()).toEqual(['id', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at'].sort())
    expect(JSON.stringify(result)).not.toContain(user.password)
    expect(findByEmail).not.toHaveBeenCalled()
  })

  it('uses the current timestamp without parsing or adjusting the stored timestamp', async () => {
    const clock = jest.spyOn(Date, 'now').mockReturnValue(1794445200000)
    const current = { ...user, updated_at: '2099-01-01T00:00:00.000Z' }
    findById.mockResolvedValue(current)
    const result = await useCase.execute(user.pk, { name: 'New' })
    expect(result.updated_at).toBe('2026-11-12T01:00:00.000Z')
    clock.mockRestore()
  })

  it.each(['other@example.com', user.email, null, undefined])('rejects any supplied email (%s) without a write or lookup', async email => {
    await expect(useCase.execute(user.pk, { name: 'New', ...{ email } })).rejects.toBeInstanceOf(InvalidUserUpdateFieldsError)
    expect(findByEmail).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('updates other allowed fields while preserving email', async () => {
    await expect(useCase.execute(user.pk, { role: USER_ROLES.ADMIN, clinic: null })).resolves.toMatchObject({ email: user.email, role: USER_ROLES.ADMIN, clinic: null })
    expect(findByEmail).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(user, { role: USER_ROLES.ADMIN, clinic: null }, expect.any(String))
  })

  it('returns not found before performing authorization or a write', async () => {
    findById.mockResolvedValue(null)
    await expect(useCase.execute(user.pk, { name: 'New' })).rejects.toBeInstanceOf(UserNotFoundError)
    expect(update).not.toHaveBeenCalled()
  })

  it.each(['read', 'write'])('propagates %s failures without reporting success', async (operation) => {
    const error = new Error('Storage unavailable')
    if (operation === 'read') findById.mockRejectedValue(error)
    if (operation === 'write') update.mockRejectedValue(error)
    await expect(useCase.execute(user.pk, { name: 'New' })).rejects.toBe(error)
    if (operation !== 'write') expect(update).not.toHaveBeenCalled()
  })
})
