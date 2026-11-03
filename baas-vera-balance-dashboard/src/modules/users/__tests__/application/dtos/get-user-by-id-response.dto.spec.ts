import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { GetUserByIdController } from '../../../presentation/http/controllers/get-user-by-id.controller'
import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case'
import { USER_ROLE_VALUES } from '../../../../../constants/user-roles.constant'

describe('GET /users/{userId} OpenAPI contract', () => {
  let document: ReturnType<typeof SwaggerModule.createDocument>

  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [GetUserByIdController], providers: [{ provide: GetUserByIdUseCase, useValue: { execute: jest.fn() } }] }).compile()
    const app = module.createNestApplication()
    await app.init()
    document = SwaggerModule.createDocument(app, { info: { title: 'Users', version: '1.0.0' } })
    await app.close()
  })

  it('documents the route, UUID parameter, security and exact response codes', () => {
    const operation = document.paths['/users/{userId}'].get!
    expect(operation.operationId).toBe('getUser')
    expect(operation.parameters).toEqual([expect.objectContaining({ name: 'userId', in: 'path', required: true, schema: expect.objectContaining({ type: 'string', format: 'uuid' }) })])
    expect(operation.requestBody).toBeUndefined()
    expect(operation.security).toEqual([{ bearerAuth: [] }])
    expect(Object.keys(operation.responses).sort()).toEqual(['200', '400', '401', '403', '404', '500'])
    expect(operation.responses['200']).toMatchObject({ content: { 'application/json': { schema: { $ref: '#/components/schemas/GetUserByIdResponseDto' } } } })
  })

  it('documents every User property and no credential or persistence attribute', () => {
    const schema = document.components?.schemas?.GetUserByIdResponseDto as { properties: Record<string, unknown>; required: string[] }
    const fields = ['id', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at']
    expect(Object.keys(schema.properties).sort()).toEqual([...fields].sort())
    expect([...schema.required].sort()).toEqual([...fields].sort())
    expect(schema.properties.role).toMatchObject({ enum: USER_ROLE_VALUES })
    expect(schema.properties.status).toMatchObject({ enum: ['Activo', 'Inactivo'] })
    expect(schema.properties.clinic).toMatchObject({ nullable: true })
  })
})
