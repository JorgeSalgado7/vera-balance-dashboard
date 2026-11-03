import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { GetUsersController } from '../../../presentation/http/controllers/get-users.controller'
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case'
import { USER_ROLE_VALUES } from '../../../../../constants/user-roles.constant'

describe('GET /users OpenAPI contract', () => {
  let document: ReturnType<typeof SwaggerModule.createDocument>

  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [GetUsersController], providers: [{ provide: GetUsersUseCase, useValue: { execute: jest.fn() } }] }).compile()
    const app = module.createNestApplication()
    await app.init()
    document = SwaggerModule.createDocument(app, { info: { title: 'Users', version: '1.0.0' } })
    await app.close()
  })

  it('documents the approved GET route, array response and errors with no additional parameters', () => {
    const operation = document.paths['/users'].get!
    expect(operation.operationId).toBe('getUsers')
    expect(operation.security).toEqual([{ bearerAuth: [] }])
    expect(operation.parameters ?? []).toEqual([])
    expect(operation.requestBody).toBeUndefined()
    expect(Object.keys(operation.responses).sort()).toEqual(['200', '401', '403', '500'])
    expect(operation.responses['200']).toMatchObject({ content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/GetUsersResponseDto' } } } } })
  })

  it('documents exactly the User properties including null clinic and both statuses', () => {
    const schema = document.components?.schemas?.GetUsersResponseDto as { properties: Record<string, unknown>; required: string[] }
    const fields = ['id', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at']
    expect(Object.keys(schema.properties).sort()).toEqual([...fields].sort())
    expect([...schema.required].sort()).toEqual([...fields].sort())
    expect(schema.properties.role).toMatchObject({ enum: USER_ROLE_VALUES })
    expect(schema.properties.status).toMatchObject({ enum: ['Activo', 'Inactivo'] })
    expect(schema.properties.clinic).toMatchObject({ nullable: true })
    expect(schema.properties.id).toMatchObject({ format: 'uuid' })
    expect(schema.properties.created_at).toMatchObject({ format: 'date-time' })
    expect(schema.properties.updated_at).toMatchObject({ format: 'date-time' })
  })
})
