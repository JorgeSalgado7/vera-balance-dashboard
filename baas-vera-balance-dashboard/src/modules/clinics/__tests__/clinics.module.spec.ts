import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { ClinicsModule } from '../clinics.module'
import { openApiHeader } from '../../../docs/openapi.header'
import { ClinicEntity } from '../domain/entities/clinic.entity'
import type { TherapyTypeEntity } from '../../therapy-types/domain/entities/therapy-type.entity'
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
      expect(document.components!.schemas!.CreateClinicDto).toMatchObject({ required: expect.arrayContaining(['name', 'address', 'phone_number', 'status']) })
      expect((document.components!.schemas!.CreateClinicDto as { required: string[] }).required).not.toContain('therapy_types')
      for (const schema of ['CreateClinicDto', 'UpdateClinicDto', 'CreateClinicResponseDto', 'GetClinicsResponseDto', 'GetClinicByIdResponseDto', 'UpdateClinicResponseDto']) {
        expect(document.components!.schemas![schema]).not.toHaveProperty('properties.logo')
      }
      expect(document.components!.schemas!.CreateClinicResponseDto).toMatchObject({ properties: { created_at: { type: 'string', format: 'date-time' }, therapy_types: { type: 'array', items: { type: 'object', required: ['id', 'name', 'icon'] } } } })
    } finally { await app.close() }
  })

  it('creates clinics with the four defaults through the exported therapy-types use case and reuses visible global records', async () => {
    const therapies: TherapyTypeEntity[] = []
    const clinicRepository = { create: jest.fn(async (entity: ClinicEntity) => entity) }
    const therapyRepository = {
      findAll: jest.fn(async () => therapies),
      findById: jest.fn(async (id: string) => therapies.find(item => item.pk === id)),
      update: jest.fn(async (entity: TherapyTypeEntity, changes: Partial<TherapyTypeEntity>, updatedAt: string) => Object.assign(entity, changes, { updated_at: updatedAt })),
      findByIds: jest.fn(async (ids: string[]) => therapies.filter(item => ids.includes(item.pk))),
      create: jest.fn(async (entity: TherapyTypeEntity) => { therapies.push(entity); return entity }),
    }
    const module = await Test.createTestingModule({ imports: [ClinicsModule] })
      .overrideProvider('IClinicRepository').useValue(clinicRepository)
      .overrideProvider('ITherapyTypeRepository').useValue(therapyRepository)
      .compile()
    try {
      const input = { name: 'Clínica', address: 'Centro', phone_number: '555', status: 'Activo' as const }
      const useCase = module.get(CreateClinicUseCase)
      const first = await useCase.execute(input)
      therapies[0].icon = null
      const second = await useCase.execute({ ...input, name: 'Segunda clínica' })
      expect(first.therapy_types.map(item => item.name)).toEqual(['Individual', 'Pareja', 'Familiar', 'Infantil'])
      expect(second.therapy_types).toEqual(first.therapy_types)
      expect(second.id).not.toBe(first.id)
      expect(first.therapy_types.map(item => item.icon)).toEqual(['UserOutlined', 'HeartOutlined', 'TeamOutlined', 'SmileOutlined'])
      expect(therapyRepository.update).toHaveBeenCalledTimes(1)
      expect(therapyRepository.create).toHaveBeenCalledTimes(4)
      expect(clinicRepository.create).toHaveBeenCalledTimes(2)
      expect(clinicRepository.create.mock.calls[0][0].therapy_types).toEqual(first.therapy_types.map(item => item.id))
    } finally { await module.close() }
  })
})
