import { Test } from '@nestjs/testing'
import { ValidationPipe } from '@nestjs/common'
import type { INestApplication } from '@nestjs/common'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import { AuthenticationGuard, JwtSigner } from '@nestjs/authentication'
import { UpdateUserController } from '../../../../presentation/http/controllers/update-user.controller'
import { UpdateUserDto } from '../../../../application/dtos/update-user.dto'
import { UserModel } from '../../../../infrastructure/models/user.model'
import { USER_ROLES } from '../../../../../../constants/user-roles.constant'
import type { UpdateUserActor } from '../../../../domain/services/validate-update-user-access.domain-service'

jest.mock('../../../../infrastructure/models/user.model', () => ({ UserModel: { get: jest.fn(), update: jest.fn(), query: jest.fn(), scan: jest.fn() } }))

// Run the existing JWT guard, real route pipes, use case and adapters without opening sockets or contacting AWS.
describe('PATCH /users/{userId} authentication integration', () => {
  let app: INestApplication, guard: AuthenticationGuard, controller: UpdateUserController
  const previousSecret = process.env.JWT_ACCESS_SECRET
  const key = 'test-only-user-update-signing-secret-at-least-32-bytes'
  const signer = new JwtSigner({ key, issuer: 'vera-balance-dashboard', audience: 'vera-balance-dashboard', ttl: '15m' })
  const actorId = '11111111-1111-4111-8111-111111111111'
  const targetId = '22222222-2222-4222-8222-222222222222'
  const clinicId = '33333333-3333-4333-8333-333333333333'
  const get = jest.mocked(UserModel.get),
    update = jest.mocked(UserModel.update),
    query = jest.mocked(UserModel.query)
  const validation = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })
  const chain = { eq: jest.fn(), using: jest.fn(), limit: jest.fn(), exec: jest.fn() }
  let queryEmail = ''
  const base = {
    pk: actorId,
    sk: 'USER',
    name: 'Admin',
    email: 'admin@example.com',
    password: 'hashed-password',
    professional_license: '123',
    role: USER_ROLES.ADMIN,
    status: 'Activo',
    clinic: null,
    gsi1pk: 'USER',
    gsi1sk: `USER#${actorId}`,
    gsi3pk: 'EMAIL#admin@example.com',
    gsi3sk: `USER#${actorId}`,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }
  let rows: Map<string, Record<string, unknown>>

  async function invoke(userId: string, body: unknown, token?: string) {
    const request = { headers: token ? { authorization: `Bearer ${token}` } : {}, originalUrl: `/users/${userId}`, params: { userId }, body }
    const execution = new ExecutionContextHost([request, { set: jest.fn().mockReturnThis() }], UpdateUserController, UpdateUserController.prototype.execute)
    execution.setType('http')
    await guard.canActivate(execution)
    const metadata = Object.values(Reflect.getMetadata(ROUTE_ARGS_METADATA, UpdateUserController, 'execute')) as {
      index: number
      pipes?: { transform: (value: any, metadata?: object) => any }[]
      factory?: (data: unknown, context: ExecutionContextHost) => UpdateUserActor
    }[]
    const id = await metadata.find((parameter) => parameter.index === 0)!.pipes![0].transform(userId, { type: 'param', data: 'userId', metatype: String })
    const dto = await validation.transform(body, { type: 'body', metatype: UpdateUserDto })
    const checked = metadata.find((parameter) => parameter.index === 1)!.pipes![0].transform(dto)
    const actor = metadata.find((parameter) => parameter.factory)!.factory!(undefined, execution)
    return controller.execute(id, checked, actor)
  }

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = key
    const { AppModule } = require('../../../../../../app.module')
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = module.createNestApplication({ logger: false })
    await app.init()
    guard = app.get(AuthenticationGuard)
    controller = app.get(UpdateUserController)
  })

  beforeEach(() => {
    jest.resetAllMocks()
    rows = new Map([
      [actorId, { ...base }],
      [
        targetId,
        {
          ...base,
          pk: targetId,
          role: USER_ROLES.THERAPIST,
          clinic: clinicId,
          email: 'user@example.com',
          gsi1sk: `USER#${targetId}`,
          gsi2pk: `CLINIC#${clinicId}`,
          gsi2sk: `USER#${targetId}`,
          gsi3pk: 'EMAIL#user@example.com',
          gsi3sk: `USER#${targetId}`,
        },
      ],
    ])
    get.mockImplementation(async (value: any) => rows.get(value.pk) as never)
    update.mockImplementation(async (key: any, expression: any) => {
      const result = { ...rows.get(key.pk), ...expression.$SET }
      for (const field of expression.$REMOVE ?? []) delete result[field]
      rows.set(key.pk, result)
      return result as never
    })
    query.mockReturnValue(chain as never)
    chain.eq.mockImplementation((value) => {
      queryEmail = value
      return chain
    })
    chain.using.mockReturnValue(chain)
    chain.limit.mockReturnValue(chain)
    chain.exec.mockImplementation(async () => Array.from(rows.values()).filter((user) => `EMAIL#${user.email}` === queryEmail))
  })

  afterEach(() => {
    expect(UserModel.scan).not.toHaveBeenCalled()
  })
  afterAll(async () => {
    await app?.close()
    if (previousSecret === undefined) delete process.env.JWT_ACCESS_SECRET
    else process.env.JWT_ACCESS_SECRET = previousSecret
  })

  it('returns 401 without authentication and performs no read or write', async () => {
    await expect(invoke(targetId, { name: 'New' })).rejects.toMatchObject({ status: 401 })
    expect(get).not.toHaveBeenCalled()
    expect(update).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid UUID or an empty body before reading the target', async () => {
    await expect(invoke('invalid', { name: 'New' }, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 400 })
    await expect(invoke(targetId, {}, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 400 })
    expect(get).toHaveBeenCalledTimes(2)
    expect(update).not.toHaveBeenCalled()
  })

  it('updates a profile through GetItem and a partial UpdateItem while preserving protected values', async () => {
    const original = { ...rows.get(targetId) }
    const result = await invoke(targetId, { name: ' New ' }, signer.sign({ sub: actorId }))
    expect(result).toMatchObject({ id: targetId, name: 'New', email: original.email, status: original.status, created_at: original.created_at })
    expect(result.updated_at).not.toBe(original.updated_at)
    expect(get).toHaveBeenNthCalledWith(2, { pk: targetId, sk: 'USER' })
    expect(update.mock.calls[0][1]).toEqual({ $SET: { name: 'New', updated_at: result.updated_at } })
    expect(rows.get(targetId)?.password).toBe(original.password)
    for (const field of ['pk', 'sk', 'password', 'gsi1pk', 'gsi2pk', 'gsi3pk']) expect(result).not.toHaveProperty(field)
    expect(query).not.toHaveBeenCalled()
  })

  it('allows admin email changes using normalized GSI3 lookup and rejects a duplicate with 409', async () => {
    const result = await invoke(targetId, { email: ' NEW@EXAMPLE.COM ' }, signer.sign({ sub: actorId }))
    expect(result.email).toBe('new@example.com')
    expect(chain.using).toHaveBeenCalledWith('GSI3')
    expect(rows.get(targetId)?.gsi3pk).toBe('EMAIL#new@example.com')
    update.mockClear()
    await expect(invoke(targetId, { email: 'admin@example.com', name: 'Rejected' }, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 409 })
    expect(update).not.toHaveBeenCalled()
    expect(rows.get(targetId)?.name).not.toBe('Rejected')
  })

  it.each([USER_ROLES.CLINIC, USER_ROLES.THERAPIST])('rejects a changed email from %s atomically, including its own email', async (role) => {
    rows.set(actorId, { ...base, role, clinic: clinicId })
    const id = role === USER_ROLES.THERAPIST ? actorId : targetId
    const before = { ...rows.get(id) }
    await expect(invoke(id, { name: 'Rejected', email: 'unauthorized@example.com' }, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 403 })
    await expect(invoke(actorId, { email: 'unauthorized@example.com' }, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 403 })
    expect(update).not.toHaveBeenCalled()
    expect(query).not.toHaveBeenCalled()
    expect(rows.get(id)).toEqual(before)
  })

  it('allows a clinic to edit a profile in its own clinic but rejects another clinic', async () => {
    rows.set(actorId, { ...base, role: USER_ROLES.CLINIC, clinic: clinicId })
    await expect(invoke(targetId, { professional_license: '456' }, signer.sign({ sub: actorId }))).resolves.toMatchObject({ professional_license: '456' })
    update.mockClear()
    rows.set(targetId, { ...rows.get(targetId), clinic: '44444444-4444-4444-8444-444444444444' })
    await expect(invoke(targetId, { name: 'Rejected' }, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 403 })
    expect(update).not.toHaveBeenCalled()
  })

  it('allows a therapist to edit itself but rejects another user and self-promotion', async () => {
    rows.set(actorId, { ...base, role: USER_ROLES.THERAPIST, clinic: clinicId })
    await expect(invoke(actorId, { name: 'Own name' }, signer.sign({ sub: actorId }))).resolves.toMatchObject({ name: 'Own name' })
    update.mockClear()
    await expect(invoke(targetId, { name: 'Rejected' }, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 403 })
    await expect(invoke(actorId, { role: USER_ROLES.ADMIN, clinic: null }, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 403 })
    expect(update).not.toHaveBeenCalled()
  })

  it('updates and removes clinic index attributes during authorized clinic transitions', async () => {
    const clinic = '44444444-4444-4444-8444-444444444444'
    await invoke(targetId, { clinic }, signer.sign({ sub: actorId }))
    expect(rows.get(targetId)).toMatchObject({ clinic, gsi2pk: `CLINIC#${clinic}`, gsi2sk: `USER#${targetId}` })
    await invoke(targetId, { role: USER_ROLES.ADMIN, clinic: null }, signer.sign({ sub: actorId }))
    expect(rows.get(targetId)?.clinic).toBeNull()
    expect(rows.get(targetId)).not.toHaveProperty('gsi2pk')
    expect(rows.get(targetId)).not.toHaveProperty('gsi2sk')
  })

  it('returns 404 for a missing target without recreating it', async () => {
    rows.delete(targetId)
    await expect(invoke(targetId, { name: 'New' }, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 404 })
    expect(update).not.toHaveBeenCalled()
  })

  it.each(['password', 'status', 'pk', 'sk', 'created_at', 'updated_at', 'gsi1pk', 'gsi2pk', 'gsi3pk'])('rejects protected field %s with 400 before any update', async (field) => {
    await expect(invoke(targetId, { name: 'New', [field]: 'forged' }, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 400 })
    expect(update).not.toHaveBeenCalled()
  })
})
