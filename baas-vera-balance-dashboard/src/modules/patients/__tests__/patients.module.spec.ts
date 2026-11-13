import { Test } from '@nestjs/testing'
import { GUARDS_METADATA } from '@nestjs/common/constants'
import { CreatePatientController } from '../presentation/http/controllers/create-patient.controller'
import { GetClinicPatientsController } from '../presentation/http/controllers/get-clinic-patients.controller'
import { GetPatientByIdController } from '../presentation/http/controllers/get-patient-by-id.controller'
import { UpdatePatientController } from '../presentation/http/controllers/update-patient.controller'
import { SwaggerModule } from '@nestjs/swagger'
import { PatientsModule } from '../patients.module'
import { CreatePatientUseCase } from '../application/use-cases/create-patient.use-case'
import { openApiHeader } from '../../../docs/openapi.header'

jest.mock('../infrastructure/persistance/models/patient.model', () => ({ PatientModel: {} }))
jest.mock('../../clinics/infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: {} }))
jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))
jest.mock('../../therapy-types/infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: {} }))

describe('PatientsModule composition', () => {
  it('composes precisely the four contracted operations, independent DTOs and nested schemas', async () => {
    const module = await Test.createTestingModule({ imports: [PatientsModule] }).compile()
    const app = module.createNestApplication()
    try {
      const document = SwaggerModule.createDocument(app, openApiHeader)
      expect(document.paths['/patients']!.post!.operationId).toBe('createPatient')
      expect(document.paths['/patients']!.get).toBeUndefined()
      expect(document.paths['/patients/clinics/{clinicId}']!.get!.operationId).toBe('getClinicPatients')
      expect(document.paths['/patients/{patientId}']!.get!.operationId).toBe('getPatient')
      expect(document.paths['/patients/{patientId}']!.patch!.operationId).toBe('updatePatient')
      expect(document.paths['/patients/{patientId}']!.delete).toBeUndefined()
      for (const path of ['/patients', '/patients/clinics/{clinicId}', '/patients/{patientId}']) {
        const item = document.paths[path]!
        for (const operation of [item.get, item.post, item.patch].filter(Boolean)) {
          expect(operation!.security ?? []).toEqual([])
          expect(operation!.responses).not.toHaveProperty('401')
          expect(operation!.responses).not.toHaveProperty('403')
        }
      }
      for (const controller of [CreatePatientController, GetClinicPatientsController, GetPatientByIdController, UpdatePatientController]) {
        expect(Reflect.getMetadata(GUARDS_METADATA, controller) ?? []).toEqual([])
        expect(Reflect.getMetadata(GUARDS_METADATA, controller.prototype.execute) ?? []).toEqual([])
      }
      expect(module.get(CreatePatientUseCase)).toBeInstanceOf(CreatePatientUseCase)
      const schemas = document.components!.schemas!
      expect(schemas.CreatePatientDto).toMatchObject({ required: ['clinic', 'name', 'birthday', 'gender', 'educational_level', 'occupation', 'marital_status', 'religion', 'address'] })
      expect(schemas.GuardianDto).toMatchObject({ required: ['name', 'phone_number', 'relationship'] })
      expect(schemas.PartnerDataDto).toMatchObject({ required: ['name', 'relationship_time', 'occupation'] })
      expect(schemas.CreatePatientResponseDto).toMatchObject({ properties: { birthday: { type: 'string', format: 'date' }, created_at: { type: 'string', format: 'date-time' }, guardian: { type: ['object', 'null'] }, partner_data: { type: ['object', 'null'] } } })
    } finally { await app.close() }
  })
})
