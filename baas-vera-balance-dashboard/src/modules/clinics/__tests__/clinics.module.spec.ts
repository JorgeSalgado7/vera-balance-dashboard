import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { ClinicsModule } from '../clinics.module'
import { openApiHeader } from '../../../docs/openapi.header'
import { CreateClinicUseCase } from '../application/use-cases/create-clinic.use-case'

jest.mock('../infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: {} }))
jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))
jest.mock('../../therapy-types/infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: {} }))

describe('ClinicsModule composition', () => {
  it('composes the five documented operations, relations and independent DTOs without opening HTTP connections', async () => {
    const module = await Test.createTestingModule({ imports: [ClinicsModule] }).compile()
    const app = module.createNestApplication()
    try {
      const document = SwaggerModule.createDocument(app, openApiHeader)
      const collection = document.paths['/clinics']!
      const individual = document.paths['/clinics/{clinicId}']!
      expect(collection.post!.responses).toHaveProperty('201')
      expect(collection.get!.responses).toHaveProperty('200')
      expect(individual.get!.responses).toHaveProperty('200')
      expect(individual.patch!.responses).toHaveProperty('200')
      expect(individual.delete).toBeUndefined()
      expect(document.paths['/clinics/{clinicId}/therapists']!.get!.responses).toHaveProperty('200')
      expect(document.paths['/clinics/{clinicId}/users']).toBeUndefined()
      expect(document.paths['/clinics/{clinicId}/therapists']!.get!.operationId).toBe('getClinicTherapists')
      expect(document.paths['/clinics/{clinicId}/users/{userId}']).toBeUndefined()
      expect(module.get(CreateClinicUseCase)).toBeInstanceOf(CreateClinicUseCase)
      expect(document.components!.schemas!.CreateClinicDto).toMatchObject({ required: expect.arrayContaining(['name', 'address', 'phone_number', 'therapy_types', 'status']) })
      expect(document.components!.schemas!.CreateClinicResponseDto).toMatchObject({ properties: { created_at: { type: 'string', format: 'date-time' }, therapy_types: { type: 'array', items: { type: 'object', required: ['id', 'name', 'icon'] } } } })
    } finally { await app.close() }
  })
})
