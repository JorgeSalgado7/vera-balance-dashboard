import { processEntity } from '../../fixtures/process.fixture'
import { FindTherapeuticProcessesByPatientDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-therapeutic-processes-by-patient-dynamoose.adapter'
import { TherapeuticProcessModel } from '../../../infrastructure/persistance/models/therapeutic-process.model'
import { PatientTherapeuticProcessModel } from '../../../infrastructure/persistance/models/patient-therapeutic-process.model'
jest.mock('../../../infrastructure/persistance/models/therapeutic-process.model', () => ({ TherapeuticProcessModel: { batchGet: jest.fn() } }))
jest.mock('../../../infrastructure/persistance/models/patient-therapeutic-process.model', () => ({ PatientTherapeuticProcessModel: { query: jest.fn() } }))
describe('FindTherapeuticProcessesByPatientDynamooseAdapter', () => {
  const links = PatientTherapeuticProcessModel as unknown as { query: jest.Mock }
  const model = TherapeuticProcessModel as unknown as { batchGet: jest.Mock }
  const adapter = new FindTherapeuticProcessesByPatientDynamooseAdapter()
  const query = { eq: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), beginsWith: jest.fn().mockReturnThis(), consistent: jest.fn().mockReturnThis(), startAt: jest.fn().mockReturnThis(), exec: jest.fn() }
  beforeEach(() => { jest.clearAllMocks(); query.exec.mockReset(); model.batchGet.mockReset(); links.query.mockReturnValue(query) })
  it('queries patient relationships on the primary table and BatchGets deduplicated processes', async () => {
    const lastKey = { pk: 'PATIENT#patient-id', sk: 'THERAPEUTIC_PROCESS#process-id' }
    query.exec.mockResolvedValueOnce(Object.assign([{ sk: 'THERAPEUTIC_PROCESS#process-id' }], { lastKey })).mockResolvedValueOnce([{ sk: 'THERAPEUTIC_PROCESS#process-id' }])
    model.batchGet.mockResolvedValue([processEntity()])
    expect(await adapter.findByPatient('patient-id')).toEqual([processEntity()])
    expect(links.query).toHaveBeenCalledWith('pk'); expect(query.eq).toHaveBeenCalledWith('PATIENT#patient-id'); expect(query.beginsWith).toHaveBeenCalledWith('THERAPEUTIC_PROCESS#'); expect(query.startAt).toHaveBeenCalledWith(lastKey)
    expect(model.batchGet).toHaveBeenCalledWith([{ pk: 'process-id', sk: 'THERAPEUTIC_PROCESS' }])
  })
  it('does not BatchGet an empty relationship set', async () => { query.exec.mockResolvedValue([]); expect(await adapter.findByPatient('patient-id')).toEqual([]); expect(model.batchGet).not.toHaveBeenCalled() })
  it('does not return incomplete data for unprocessed batch keys', async () => { query.exec.mockResolvedValue([{ sk: 'THERAPEUTIC_PROCESS#process-id' }]); model.batchGet.mockResolvedValue(Object.assign([], { unprocessedKeys: [{ pk: 'process-id' }] })); await expect(adapter.findByPatient('patient-id')).rejects.toThrow('No se pudo completar') })
})
