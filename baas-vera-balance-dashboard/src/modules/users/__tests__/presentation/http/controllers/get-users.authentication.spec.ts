import { Test } from '@nestjs/testing'
import { HttpException } from '@nestjs/common'
import type { INestApplication } from '@nestjs/common'
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import { AuthenticationGuard, JwtSigner } from '@nestjs/authentication'
import { GetUsersController } from '../../../../presentation/http/controllers/get-users.controller'
import { UserModel } from '../../../../infrastructure/models/user.model'
import { USER_ROLES } from '../../../../../../constants/user-roles.constant'

jest.mock('../../../../infrastructure/models/user.model', () => ({ UserModel: { get: jest.fn(), query: jest.fn() } }))

// Exercise the existing global guard, signed JWT, identity lookup and @CurrentUser without opening a socket.
describe('GET /users authentication integration', () => {
  let app: INestApplication
  let guard: AuthenticationGuard
  let controller: GetUsersController
  const get = jest.mocked(UserModel.get)
  const query = jest.mocked(UserModel.query)
  const previousSecret = process.env.JWT_ACCESS_SECRET
  const key = 'test-only-secret-for-users-listing-authentication'
  const signer = new JwtSigner({ key, issuer: 'vera-balance-dashboard', audience: 'vera-balance-dashboard', ttl: '15m' })
  const chain = { eq: jest.fn(), using: jest.fn(), attributes: jest.fn(), exec: jest.fn() }

  function context(token?: string) {
    const request = { headers: token ? { authorization: `Bearer ${token}` } : {}, originalUrl: '/users', body: { role: USER_ROLES.ADMIN } }
    const result = new ExecutionContextHost([request, { set: jest.fn().mockReturnThis() }], GetUsersController, GetUsersController.prototype.execute)
    result.setType('http')
    return result
  }

  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = key
    const { AppModule } = require('../../../../../../app.module')
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = module.createNestApplication({ logger: false })
    await app.init()
    guard = app.get(AuthenticationGuard)
    controller = app.get(GetUsersController)
  })

  beforeEach(() => {
    jest.resetAllMocks()
    chain.eq.mockReturnValue(chain)
    chain.using.mockReturnValue(chain)
    chain.attributes.mockReturnValue(chain)
    chain.exec.mockResolvedValue([])
    query.mockReturnValue(chain as never)
  })

  afterAll(async () => {
    await app?.close()
    if (previousSecret === undefined) delete process.env.JWT_ACCESS_SECRET
    else process.env.JWT_ACCESS_SECRET = previousSecret
  })

  it('rejects a request without credentials before loading any users', async () => {
    await expect(guard.canActivate(context())).rejects.toMatchObject({ status: 401 })
    expect(get).not.toHaveBeenCalled()
    expect(query).not.toHaveBeenCalled()
  })

  it('rejects a token signed by a different key', async () => {
    const token = new JwtSigner({ key: 'different-test-signing-key-at-least-32-bytes', issuer: 'vera-balance-dashboard', audience: 'vera-balance-dashboard', ttl: '15m' }).sign({ sub: 'actor-1' })
    await expect(guard.canActivate(context(token))).rejects.toMatchObject({ status: 401 })
    expect(query).not.toHaveBeenCalled()
  })

  it('rejects an inactive authenticated user before querying the global collection', async () => {
    get.mockResolvedValue({ pk: 'actor-1', role: USER_ROLES.ADMIN, status: 'Inactivo', clinic: null } as never)
    await expect(guard.canActivate(context(signer.sign({ sub: 'actor-1' })))).rejects.toMatchObject({ status: 401 })
    expect(query).not.toHaveBeenCalled()
  })

  it.each([USER_ROLES.ADMIN, USER_ROLES.CLINIC, USER_ROLES.THERAPIST])('uses the trusted identity for role %s and ignores body claims', async (role) => {
    get.mockResolvedValue({ pk: 'actor-1', role, status: 'Activo', clinic: role === USER_ROLES.ADMIN ? null : 'clinic-1' } as never)
    const execution = context(signer.sign({ sub: 'actor-1' }))
    await expect(guard.canActivate(execution)).resolves.toBe(true)
    const metadata = Reflect.getMetadata(ROUTE_ARGS_METADATA, GetUsersController, 'execute')
    const parameter = Object.values(metadata)[0] as { factory: (data: unknown, context: ExecutionContextHost) => { role: typeof role } }
    const actor = parameter.factory(undefined, execution)
    expect(actor.role).toBe(role)
    if (role === USER_ROLES.ADMIN) {
      await expect(controller.execute(actor)).resolves.toEqual([])
      expect(query).toHaveBeenCalledWith('gsi1pk')
    } else {
      const error = await controller.execute(actor).catch((error) => error)
      expect(error).toBeInstanceOf(HttpException)
      expect(error.getStatus()).toBe(403)
      expect(query).not.toHaveBeenCalled()
    }
  })
})
