import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { TherapeuticProcessesModule } from '../therapeutic-processes.module'
import { openApiHeader } from '../../../docs/openapi.header'

jest.mock('../infrastructure/persistance/models/therapeutic-process.model', () => ({ TherapeuticProcessModel: {} }))
jest.mock('../infrastructure/persistance/models/patient-therapeutic-process.model', () => ({ PatientTherapeuticProcessModel: {} }))
jest.mock('../../patients/infrastructure/persistance/models/patient.model', () => ({ PatientModel: {} }))
jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))
jest.mock('../../therapy-types/infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: {} }))
jest.mock('../../clinics/infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: {} }))

describe('TherapeuticProcessesModule composition', () => {
  it('composes all seven documented operations with their independent DTOs', async () => {
    const module = await Test.createTestingModule({ imports: [TherapeuticProcessesModule] }).compile()
    const app = module.createNestApplication()
    try {
      const document = SwaggerModule.createDocument(app, openApiHeader)
      const root = '/therapeutic-processes'
      expect(document.paths[root]!.post!.responses).toHaveProperty('201')
      expect(document.paths[root]!.get).toBeUndefined()
      expect(document.paths[root + '/clinics/{clinicId}']!.get!.operationId).toBe('getClinicTherapeuticProcesses')
      expect(document.paths[root + '/patients/{patientId}']!.get!.operationId).toBe('getPatientTherapeuticProcesses')
      expect(document.paths[root + '/{processId}']!.get!.operationId).toBe('getTherapeuticProcess')
      expect(document.paths[root + '/{processId}']!.patch!.operationId).toBe('updateTherapeuticProcess')
      expect(document.paths[root + '/{processId}']!.delete!.responses).toHaveProperty('204')
      expect(document.paths[root + '/{processId}/status']!.patch!.operationId).toBe('updateTherapeuticProcessStatus')
      const operations = Object.entries(document.paths).filter(([path]) => path.startsWith(root)).flatMap(([, value]) => [value.get, value.post, value.patch, value.delete].filter(Boolean))
      expect(operations).toHaveLength(7)
      for (const operation of operations) { expect(operation!.security ?? []).toEqual([]); expect(operation!.responses).not.toHaveProperty('401'); expect(operation!.responses).not.toHaveProperty('403') }
      expect(document.components!.schemas!.CreateTherapeuticProcessDto).toMatchObject({ required: ['clinic', 'therapy_type', 'therapist', 'patients', 'is_first_time', 'consultation_reason', 'goals', 'status'] })
    } finally { await app.close() }
  })
})
