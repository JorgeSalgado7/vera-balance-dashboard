import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { UpdateUserController } from '../../../presentation/http/controllers/update-user.controller'
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case'

describe('PATCH /users/{userId} OpenAPI contract', () => {
  let document: ReturnType<typeof SwaggerModule.createDocument>
  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [UpdateUserController], providers: [{ provide: UpdateUserUseCase, useValue: { execute: jest.fn() } }] }).compile()
    const app = module.createNestApplication()
    await app.init()
    document = SwaggerModule.createDocument(app, { info: { title: 'Users', version: '1.0.0' } })
    await app.close()
  })

  it('documents the approved partial request and status codes', () => {
    const operation = document.paths['/users/{userId}'].patch!
    expect(operation.operationId).toBe('updateUser')
    expect(operation.security).toEqual([{ bearerAuth: [] }])
    expect(Object.keys(operation.responses).sort()).toEqual(['200', '400', '401', '403', '404', '409', '500'])
    expect(operation.requestBody).toMatchObject({ content: { 'application/json': { schema: { minProperties: 1, allOf: [{ $ref: '#/components/schemas/UpdateUserDto' }] } } } })
    const schema = document.components?.schemas?.UpdateUserDto as { properties: Record<string, unknown>; required?: string[] }
    expect(Object.keys(schema.properties).sort()).toEqual(['name', 'email', 'professional_license', 'role', 'clinic'].sort())
    expect(schema.required ?? []).toEqual([])
  })

  it('documents only the public User response fields', () => {
    const schema = document.components?.schemas?.UpdateUserResponseDto as { properties: Record<string, unknown>; required: string[] }
    const fields = ['id', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at']
    expect(Object.keys(schema.properties).sort()).toEqual([...fields].sort())
    expect([...schema.required].sort()).toEqual([...fields].sort())
    expect(document.paths['/users/{userId}'].patch!.responses['200']).toMatchObject({ content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserResponseDto' } } } })
  })
})
