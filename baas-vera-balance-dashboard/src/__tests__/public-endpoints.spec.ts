import { Test } from '@nestjs/testing'
import { GUARDS_METADATA, ROUTE_ARGS_METADATA } from '@nestjs/common/constants'
import { SwaggerModule } from '@nestjs/swagger'
import { AppModule } from '../app.module'
import { openApiHeader } from '../docs/openapi.header'
import { CreateUserController } from '../modules/users/presentation/http/controllers/create-user.controller'
import { GetUsersController } from '../modules/users/presentation/http/controllers/get-users.controller'
import { GetUserByIdController } from '../modules/users/presentation/http/controllers/get-user-by-id.controller'
import { UpdateUserController } from '../modules/users/presentation/http/controllers/update-user.controller'
import { DeleteUserController } from '../modules/users/presentation/http/controllers/delete-user.controller'
import { UpdateUserStatusController } from '../modules/users/presentation/http/controllers/update-user-status.controller'
import { ChangeUserPasswordController } from '../modules/users/presentation/http/controllers/change-user-password.controller'

jest.mock('../modules/users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))

const controllers = [CreateUserController, GetUsersController, GetUserByIdController, UpdateUserController,
  DeleteUserController, UpdateUserStatusController, ChangeUserPasswordController]

describe('Public endpoint composition', () => {
  it('exposes every endpoint without Bearer requirements, guards or current-user parameters', async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile()
    const app = module.createNestApplication()
    try {
      const document = SwaggerModule.createDocument(app, openApiHeader)
      expect(document.security ?? []).toEqual([])
      const operations = Object.values(document.paths).flatMap(path =>
        ['get', 'post', 'patch', 'delete'].map(method => path[method]).filter(Boolean))
      expect(operations).toHaveLength(7)
      for (const operation of operations) {
        expect(operation.security ?? []).toEqual([])
        expect(operation.responses).not.toHaveProperty('401')
        expect(operation.responses).not.toHaveProperty('403')
      }
      for (const controller of controllers) {
        expect(module.get(controller)).toBeInstanceOf(controller)
        expect(Reflect.getMetadata(GUARDS_METADATA, controller) ?? []).toEqual([])
        expect(Reflect.getMetadata(GUARDS_METADATA, controller.prototype.execute) ?? []).toEqual([])
        const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, controller, 'execute') ?? {}
        expect(Object.keys(args).some(key => key.includes('__customRouteArgs__'))).toBe(false)
      }
    } finally {
      await app.close()
    }
  })
})
