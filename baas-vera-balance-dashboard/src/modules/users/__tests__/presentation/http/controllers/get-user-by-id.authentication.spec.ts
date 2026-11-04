import { Test } from '@nestjs/testing'
import type { INestApplication } from '@nestjs/common'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import { AuthenticationGuard, JwtSigner } from '@nestjs/authentication'
import { GetUserByIdController } from '../../../../presentation/http/controllers/get-user-by-id.controller'
import { UserModel } from '../../../../infrastructure/models/user.model'
import { USER_ROLES } from '../../../../../../constants/user-roles.constant'
import type { GetUserByIdActor } from '../../../../domain/services/validate-get-user-by-id.domain-service'

jest.mock('../../../../infrastructure/models/user.model', () => ({ UserModel: { get: jest.fn(), query: jest.fn(), scan: jest.fn() } }))

// Exercise the real guard, signed JWT, route parameter and trusted @CurrentUser without a network listener.
describe('GET /users/{userId} authentication integration', () => {
  let app: INestApplication
  let guard: AuthenticationGuard
  let controller: GetUserByIdController
  const previousSecret = process.env.JWT_ACCESS_SECRET
  const key = 'test-only-user-by-id-signing-secret-at-least-32-bytes'
  const signer = new JwtSigner({ key, issuer: 'vera-balance-dashboard', audience: 'vera-balance-dashboard', ttl: '15m' })
  const actorId = '11111111-1111-4111-8111-111111111111'
  const targetId = '22222222-2222-4222-8222-222222222222'
  const get = jest.mocked(UserModel.get)
  const actor = {
    pk: actorId,
    sk: 'USER',
    name: 'Admin',
    email: 'admin@example.com',
    professional_license: '123',
    role: USER_ROLES.ADMIN,
    status: 'Activo',
    clinic: null,
    created_at: '2026-11-02T00:00:00.000Z',
    updated_at: '2026-11-02T00:00:00.000Z',
  }
  let rows: Map<string, Record<string, unknown>>

  async function invoke(userId: string, token?: string) {
    const request = { headers: token ? { authorization: `Bearer ${token}` } : {}, originalUrl: `/users/${userId}`, params: { userId }, body: { role: USER_ROLES.ADMIN, clinic: 'clinic-1' } }
    const execution = new ExecutionContextHost([request, { set: jest.fn().mockReturnThis() }], GetUserByIdController, GetUserByIdController.prototype.execute)
    execution.setType('http')
    await guard.canActivate(execution)
    const metadata = Object.values(Reflect.getMetadata(ROUTE_ARGS_METADATA, GetUserByIdController, 'execute')) as {
      data?: string
      pipes?: { transform: (value: string, metadata: object) => Promise<string> }[]
      factory?: (data: unknown, context: ExecutionContextHost) => GetUserByIdActor
    }[]
    const currentUser = metadata.find((parameter) => parameter.factory)!
    return controller.execute(request.params.userId, currentUser.factory!(undefined, execution))
  }

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = key
    const { AppModule } = require('../../../../../../app.module')
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = module.createNestApplication({ logger: false })
    await app.init()
    guard = app.get(AuthenticationGuard)
    controller = app.get(GetUserByIdController)
  })

  beforeEach(() => {
    jest.resetAllMocks()
    rows = new Map([
      [actorId, { ...actor }],
      [targetId, { ...actor, pk: targetId, role: USER_ROLES.THERAPIST, clinic: 'clinic-1', password: 'secret-hash', gsi1pk: 'USER' }],
    ])
    get.mockImplementation(async (value: any) => rows.get(value.pk) as never)
  })

  afterEach(() => {
    expect(UserModel.query).not.toHaveBeenCalled()
    expect(UserModel.scan).not.toHaveBeenCalled()
  })

  afterAll(async () => {
    await app?.close()
    if (previousSecret === undefined) delete process.env.JWT_ACCESS_SECRET
    else process.env.JWT_ACCESS_SECRET = previousSecret
  })

  it('rejects missing authentication with 401 before any lookup', async () => {
    await expect(invoke(targetId)).rejects.toMatchObject({ status: 401 })
    expect(get).not.toHaveBeenCalled()
  })

  it('rejects an invalid signature with 401', async () => {
    const token = new JwtSigner({ key: 'different-test-key-at-least-32-bytes-long', issuer: 'vera-balance-dashboard', audience: 'vera-balance-dashboard', ttl: '15m' }).sign({ sub: actorId })
    await expect(invoke(targetId, token)).rejects.toMatchObject({ status: 401 })
    expect(get).not.toHaveBeenCalled()
  })

  it('looks up a string identifier without requiring UUID format', async () => {
    rows.set('user-123', { ...rows.get(targetId), pk: 'user-123' })
    await expect(invoke('user-123', signer.sign({ sub: actorId }))).resolves.toMatchObject({ id: 'user-123' })
    expect(get).toHaveBeenNthCalledWith(2, { pk: 'user-123', sk: 'USER' })
  })

  it.each(['Activo', 'Inactivo'])('returns the public user with status %s through GetItem', async (status) => {
    rows.set(targetId, { ...rows.get(targetId), status })
    const result = await invoke(targetId, signer.sign({ sub: actorId }))
    expect(result).toMatchObject({ id: targetId, status, clinic: 'clinic-1' })
    expect(result).not.toHaveProperty('password')
    expect(result).not.toHaveProperty('pk')
    expect(result).not.toHaveProperty('gsi1pk')
    expect(get).toHaveBeenNthCalledWith(1, { pk: actorId, sk: 'USER' })
    expect(get).toHaveBeenNthCalledWith(2, { pk: targetId, sk: 'USER' })
  })

  it('returns 404 for an absent user', async () => {
    rows.delete(targetId)
    await expect(invoke(targetId, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 404 })
  })

  it('permits a clinic user only within its own clinic', async () => {
    rows.set(actorId, { ...actor, role: USER_ROLES.CLINIC, clinic: 'clinic-1' })
    await expect(invoke(targetId, signer.sign({ sub: actorId }))).resolves.toMatchObject({ id: targetId })
    rows.set(targetId, { ...rows.get(targetId), clinic: 'clinic-2' })
    await expect(invoke(targetId, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 403 })
  })

  it('permits a therapist to consult itself and rejects another user despite forged body claims', async () => {
    rows.set(actorId, { ...actor, role: USER_ROLES.THERAPIST, clinic: 'clinic-1' })
    await expect(invoke(actorId, signer.sign({ sub: actorId }))).resolves.toMatchObject({ id: actorId })
    await expect(invoke(targetId, signer.sign({ sub: actorId }))).rejects.toMatchObject({ status: 403 })
  })
})
