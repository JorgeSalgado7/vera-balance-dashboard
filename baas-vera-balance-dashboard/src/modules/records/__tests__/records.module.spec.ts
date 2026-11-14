import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { GUARDS_METADATA } from '@nestjs/common/constants'
import { RecordsModule } from '../records.module'
import { openApiHeader } from '../../../docs/openapi.header'
import { CreateRecordController } from '../presentation/http/controllers/create-record.controller'
import { GetRecordByIdController } from '../presentation/http/controllers/get-record-by-id.controller'
import { GetTherapeuticProcessRecordsController } from '../presentation/http/controllers/get-therapeutic-process-records.controller'
import { UpdateRecordController } from '../presentation/http/controllers/update-record.controller'
jest.mock('../infrastructure/persistance/models/record.model', () => ({ RecordModel: {} }))
jest.mock('../../therapeutic-processes/infrastructure/persistance/models/therapeutic-process.model', () => ({ TherapeuticProcessModel: {} }))
jest.mock('../../therapeutic-processes/infrastructure/persistance/models/patient-therapeutic-process.model', () => ({ PatientTherapeuticProcessModel: {} }))
jest.mock('../../patients/infrastructure/persistance/models/patient.model', () => ({ PatientModel: {} }))
jest.mock('../../clinics/infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: {} }))
jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))
jest.mock('../../therapy-types/infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: {} }))
describe('RecordsModule composition', () => {
  it('composes four contracted public endpoints, independent DTOs and nullable notes', async () => {
    const module = await Test.createTestingModule({ imports: [RecordsModule] }).compile()
    const app = module.createNestApplication()
    try {
      const doc = SwaggerModule.createDocument(app, openApiHeader)
      expect(doc.paths['/records']!.post!.operationId).toBe('createRecord')
      expect(doc.paths['/records']!.get).toBeUndefined()
      expect(doc.paths['/records/therapeutic-processes/{processId}']!.get!.operationId).toBe('getTherapeuticProcessRecords')
      expect(doc.paths['/records/{recordId}']!.get!.operationId).toBe('getRecord')
      expect(doc.paths['/records/{recordId}']!.patch!.operationId).toBe('updateRecord')
      expect(doc.paths['/records/{recordId}']!.delete).toBeUndefined()
      for (const controller of [CreateRecordController, GetRecordByIdController, GetTherapeuticProcessRecordsController, UpdateRecordController]) {
        expect(module.get(controller)).toBeInstanceOf(controller)
        expect(Reflect.getMetadata(GUARDS_METADATA, controller) ?? []).toEqual([])
        expect(Reflect.getMetadata(GUARDS_METADATA, controller.prototype.execute) ?? []).toEqual([])
      }
      expect(doc.components!.schemas!.CreateRecordDto).toMatchObject({ required: ['session_date', 'attendance', 'therapeutic_process'] })
      for (const name of ['CreateRecordResponseDto', 'GetRecordByIdResponseDto', 'GetTherapeuticProcessRecordsResponseDto', 'UpdateRecordResponseDto']) {
        expect(doc.components!.schemas![name]).toMatchObject({ required: ['id', 'session_date', 'attendance', 'resume', 'tools', 'therapeutic_process', 'created_at', 'updated_at'], properties: { session_date: { format: 'date-time' }, resume: { type: ['string', 'null'] }, tools: { type: ['string', 'null'] } } })
      }
      const repository = module.get('IRecordRepository')
      expect(Object.keys(repository)).toEqual(['create', 'findById', 'findByProcess', 'update'])
    } finally { await app.close() }
  })
})
