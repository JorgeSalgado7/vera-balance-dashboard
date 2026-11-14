import { Test } from '@nestjs/testing'
import { SwaggerModule } from '@nestjs/swagger'
import { GUARDS_METADATA } from '@nestjs/common/constants'
import { HomeworksModule } from '../homeworks.module'
import { GetRecordByIdUseCase } from '../../records/application/use-cases/get-record-by-id.use-case'
import { RecordNotFoundError } from '../../records/domain/errors/record.error'
import { openApiHeader } from '../../../docs/openapi.header'
import { CreateHomeworkController } from '../presentation/http/controllers/create-homework.controller'
import { GetHomeworkByIdController } from '../presentation/http/controllers/get-homework-by-id.controller'
import { GetRecordHomeworksController } from '../presentation/http/controllers/get-record-homeworks.controller'
import { UpdateHomeworkController } from '../presentation/http/controllers/update-homework.controller'
import { input } from './fixtures/homework.fixture'
jest.mock('../infrastructure/persistance/models/homework.model', () => ({ HomeworkModel: {} }))
jest.mock('../../records/infrastructure/persistance/models/record.model', () => ({ RecordModel: {} }))
jest.mock('../../therapeutic-processes/infrastructure/persistance/models/therapeutic-process.model', () => ({ TherapeuticProcessModel: {} }))
jest.mock('../../therapeutic-processes/infrastructure/persistance/models/patient-therapeutic-process.model', () => ({ PatientTherapeuticProcessModel: {} }))
jest.mock('../../patients/infrastructure/persistance/models/patient.model', () => ({ PatientModel: {} }))
jest.mock('../../clinics/infrastructure/persistance/models/clinic.model', () => ({ ClinicModel: {} }))
jest.mock('../../users/infrastructure/persistance/models/user.model', () => ({ UserModel: {} }))
jest.mock('../../therapy-types/infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: {} }))
describe('HomeworksModule composition', () => {
  it('composes four public contracted operations and reuses the exported Records use case', async () => {
    const module = await Test.createTestingModule({ imports: [HomeworksModule] }).overrideProvider('IRecordRepository').useValue({ findById: jest.fn().mockResolvedValue(null) }).compile()
    const app = module.createNestApplication()
    try {
      const doc = SwaggerModule.createDocument(app, openApiHeader)
      expect(doc.paths['/homeworks']!.post!.operationId).toBe('createHomework')
      expect(doc.paths['/homeworks']!.get).toBeUndefined()
      expect(doc.paths['/homeworks/records/{recordId}']!.get!.operationId).toBe('getRecordHomeworks')
      expect(doc.paths['/homeworks/{homeworkId}']!.get!.operationId).toBe('getHomework')
      expect(doc.paths['/homeworks/{homeworkId}']!.patch!.operationId).toBe('updateHomework')
      expect(doc.paths['/homeworks/{homeworkId}']!.delete).toBeUndefined()
      for (const controller of [CreateHomeworkController, GetHomeworkByIdController, GetRecordHomeworksController, UpdateHomeworkController]) {
        expect(module.get(controller)).toBeInstanceOf(controller)
        expect(Reflect.getMetadata(GUARDS_METADATA, controller) ?? []).toEqual([])
        expect(Reflect.getMetadata(GUARDS_METADATA, controller.prototype.execute) ?? []).toEqual([])
      }
      for (const [path, item] of Object.entries(doc.paths)) {
        if (!path.startsWith('/homeworks')) continue
        for (const operation of [item!.post, item!.get, item!.patch].filter(Boolean)) {
          expect(operation!.security ?? []).toEqual([])
          expect(operation!.responses).not.toHaveProperty('401')
          expect(operation!.responses).not.toHaveProperty('403')
        }
      }
      expect(doc.components!.schemas!.CreateHomeworkDto).toMatchObject({ required: ['description', 'record'] })
      for (const name of ['CreateHomeworkResponseDto', 'GetHomeworkByIdResponseDto', 'GetRecordHomeworksResponseDto', 'UpdateHomeworkResponseDto']) {
        expect(doc.components!.schemas![name]).toMatchObject({ required: ['id', 'description', 'record', 'therapeutic_process', 'created_at', 'updated_at'], properties: { therapeutic_process: { type: 'string', readOnly: true }, created_at: { format: 'date-time' }, updated_at: { format: 'date-time' } } })
      }
      expect(module.get(GetRecordByIdUseCase)).toBeInstanceOf(GetRecordByIdUseCase)
      await expect(module.get(CreateHomeworkController).execute(input)).rejects.toBeInstanceOf(RecordNotFoundError)
      expect(Object.keys(module.get('IHomeworkRepository'))).toEqual(['create', 'findById', 'findByRecord', 'update'])
    } finally { await app.close() }
  })
})
