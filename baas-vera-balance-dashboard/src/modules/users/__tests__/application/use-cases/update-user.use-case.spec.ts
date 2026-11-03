import { Test } from '@nestjs/testing'
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case'
import { UpdateUserDomainService } from '../../../domain/services/update-user.domain-service'
import { ValidateUpdateUserAccessDomainService } from '../../../domain/services/validate-update-user-access.domain-service'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import type { IUpdateUserRepository } from '../../../domain/repositories/update-user.repository'
import { UserNotFoundError } from '../../../domain/errors/user-not-found.error'
import { UserUpdateNotAllowedError } from '../../../domain/errors/user-update-not-allowed.error'
import { UserAlreadyExistsError } from '../../../domain/errors/user.error'
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
        ValidateUpdateUserAccessDomainService,
        { provide: 'IUserRepository', useValue: { findById, findByEmail } },
        { provide: 'IUpdateUserRepository', useValue: { update } },
        {
          provide: UpdateUserUseCase,
          inject: [ValidateUpdateUserAccessDomainService, UpdateUserDomainService, 'IUserRepository', 'IUpdateUserRepository'],
          useFactory: (access: ValidateUpdateUserAccessDomainService, domain: UpdateUserDomainService, users: IUserRepository, updater: IUpdateUserRepository) =>
            new UpdateUserUseCase(access, domain, users, updater),
        },
      ],
    }).compile()
    useCase = module.get(UpdateUserUseCase)
    await module.close()
  })

  it('reads by ID, updates only the supplied fields, preserves other values and returns public data', async () => {
    const result = await useCase.execute(user.pk, { name: ' New ' }, admin)
    expect(findById).toHaveBeenCalledWith(user.pk)
    expect(update).toHaveBeenCalledWith(user, { name: 'New' }, expect.any(String))
    expect(result).toMatchObject({ id: user.pk, name: 'New', email: user.email, status: 'Inactivo', created_at: user.created_at })
    expect(Date.parse(result.updated_at)).toBeGreaterThan(Date.parse(user.updated_at))
    expect(user.name).toBe('Original')
    expect(Object.keys(result).sort()).toEqual(['id', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at'].sort())
    expect(JSON.stringify(result)).not.toContain(user.password)
    expect(findByEmail).not.toHaveBeenCalled()
  })

  it('uses a strictly increasing timestamp even when the stored timestamp is ahead of the clock', async () => {
    const current = { ...user, updated_at: '2099-01-01T00:00:00.000Z' }
    findById.mockResolvedValue(current)
    const result = await useCase.execute(user.pk, { name: 'New' }, admin)
    expect(result.updated_at).toBe('2099-01-01T00:00:00.001Z')
  })

  it('normalizes a changed email and checks for duplicates before any write', async () => {
    const result = await useCase.execute(user.pk, { email: ' NEW@EXAMPLE.COM ' }, admin)
    expect(findByEmail).toHaveBeenCalledWith('new@example.com')
    expect(update).toHaveBeenCalledWith(user, { email: 'new@example.com' }, expect.any(String))
    expect(result.email).toBe('new@example.com')
    expect(findByEmail.mock.invocationCallOrder[0]).toBeLessThan(update.mock.invocationCallOrder[0])
  })

  it('rejects duplicate email without applying any field from the patch', async () => {
    findByEmail.mockResolvedValue({ ...user, pk: 'other-user' })
    await expect(useCase.execute(user.pk, { email: 'other@example.com', name: 'New' }, admin)).rejects.toBeInstanceOf(UserAlreadyExistsError)
    expect(update).not.toHaveBeenCalled()
  })

  it('does not reject the same user returned by email lookup', async () => {
    findByEmail.mockResolvedValue(user)
    await expect(useCase.execute(user.pk, { email: 'new@example.com' }, admin)).resolves.toMatchObject({ email: 'new@example.com' })
  })

  it.each([USER_ROLES.CLINIC, USER_ROLES.THERAPIST])('allows authorized profile updates by %s but rejects email and privilege changes atomically', async (role) => {
    const actor = { id: user.pk, role, clinic: user.clinic }
    await expect(useCase.execute(user.pk, { name: 'New' }, actor)).resolves.toMatchObject({ name: 'New' })
    update.mockClear()
    await expect(useCase.execute(user.pk, { name: 'New', email: 'new@example.com' }, actor)).rejects.toBeInstanceOf(UserUpdateNotAllowedError)
    await expect(useCase.execute(user.pk, { role: USER_ROLES.ADMIN }, actor)).rejects.toBeInstanceOf(UserUpdateNotAllowedError)
    await expect(useCase.execute(user.pk, { clinic: null }, actor)).rejects.toBeInstanceOf(UserUpdateNotAllowedError)
    expect(findByEmail).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it.each([USER_ROLES.CLINIC, USER_ROLES.THERAPIST])('allows an unchanged normalized email from %s without querying email availability', async (role) => {
    await useCase.execute(user.pk, { email: ' USER@EXAMPLE.COM ' }, { id: user.pk, role, clinic: user.clinic })
    expect(findByEmail).not.toHaveBeenCalled()
    expect(update).toHaveBeenCalledWith(user, { email: 'user@example.com' }, expect.any(String))
  })

  it('returns not found before performing authorization or a write', async () => {
    findById.mockResolvedValue(null)
    await expect(useCase.execute(user.pk, { name: 'New' }, admin)).rejects.toBeInstanceOf(UserNotFoundError)
    expect(update).not.toHaveBeenCalled()
  })

  it.each(['read', 'email', 'write'])('propagates %s failures without reporting success', async (operation) => {
    const error = new Error('Storage unavailable')
    if (operation === 'read') findById.mockRejectedValue(error)
    if (operation === 'email') findByEmail.mockRejectedValue(error)
    if (operation === 'write') update.mockRejectedValue(error)
    await expect(useCase.execute(user.pk, { email: 'new@example.com' }, admin)).rejects.toBe(error)
    if (operation !== 'write') expect(update).not.toHaveBeenCalled()
  })
})
