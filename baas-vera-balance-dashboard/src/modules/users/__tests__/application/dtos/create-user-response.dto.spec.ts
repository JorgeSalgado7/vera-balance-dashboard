import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { CreateUserController } from '../../../presentation/http/controllers/create-user.controller'
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case'
import { USER_ROLE_VALUES } from '../../../../../constants/user-roles.constant'

// Exercise real DTO and route decorators without starting an HTTP listener.
describe('CreateUserResponseDto OpenAPI contract', () => {
  let document: ReturnType<typeof SwaggerModule.createDocument>

  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [CreateUserController], providers: [{ provide: CreateUserUseCase, useValue: { execute: jest.fn() } }] }).compile()
    const app = module.createNestApplication()
    await app.init()
    document = SwaggerModule.createDocument(app, { info: { title: 'Users', version: '1.0.0' } })
    await app.close()
  })

  it('documents the exact public response fields and excludes password and persistence indexes', () => {
    const schema = document.components?.schemas?.CreateUserResponseDto as { properties: Record<string, unknown>; required: string[] }
    const fields = ['id', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at']
    expect(Object.keys(schema.properties).sort()).toEqual([...fields].sort())
    expect([...schema.required].sort()).toEqual([...fields].sort())
    expect(schema.properties.id).toMatchObject({ format: 'uuid' })
    expect(schema.properties.email).toMatchObject({ format: 'email' })
    expect(schema.properties.role).toMatchObject({ enum: USER_ROLE_VALUES })
    expect(schema.properties.clinic).toMatchObject({ nullable: true })
    expect(schema.properties.created_at).toMatchObject({ format: 'date-time' })
    expect(schema.properties.updated_at).toMatchObject({ format: 'date-time' })
  })

  it('documents POST /users with the DTO, creation response and documented error codes', () => {
    const operation = document.paths['/users'].post!
    expect(Object.keys(operation.responses).sort()).toEqual(['201', '400', '401', '403', '409', '500'])
    expect(operation.responses['201']).toMatchObject({ content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserResponseDto' } } } })
    expect(operation.requestBody).toMatchObject({ content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserDto' } } } })
    const schema = document.components?.schemas?.CreateUserDto as { properties: Record<string, unknown> }
    expect(schema.properties.password).toMatchObject({ format: 'password', writeOnly: true })
  })
})
