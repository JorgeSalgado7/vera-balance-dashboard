import { patient } from '../../fixtures/patient.fixture'
import { FindPatientsByClinicDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-patients-by-clinic-dynamoose.adapter'
import { PatientModel } from '../../../infrastructure/persistance/models/patient.model'
jest.mock('../../../infrastructure/persistance/models/patient.model', () => ({ PatientModel: { query: jest.fn() } }))

describe('FindPatientsByClinicDynamooseAdapter', () => {
  const model = PatientModel as unknown as { query: jest.Mock }
  const adapter = new FindPatientsByClinicDynamooseAdapter()
  const query = { eq: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), beginsWith: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), startAt: jest.fn().mockReturnThis(), exec: jest.fn() }
  beforeEach(() => { jest.clearAllMocks(); query.exec.mockReset(); model.query.mockReturnValue(query) })
  it('queries only the requested clinic and PATIENT prefix, consuming all pages', async () => {
    const lastKey = { pk: 'last', sk: 'PATIENT' }
    query.exec.mockResolvedValueOnce(Object.assign([patient()], { lastKey })).mockResolvedValueOnce([patient()])
    expect(await adapter.findByClinic('clinic-id')).toHaveLength(2)
    expect(model.query).toHaveBeenCalledWith('gsi2pk')
    expect(query.eq).toHaveBeenCalledWith('CLINIC#clinic-id')
    expect(query.where).toHaveBeenCalledWith('gsi2sk')
    expect(query.beginsWith).toHaveBeenCalledWith('PATIENT#')
    expect(query.using).toHaveBeenCalledWith('GSI2')
    expect(query.startAt).toHaveBeenCalledWith(lastKey)
  })
  it('returns no patients when the clinic partition is empty', async () => { query.exec.mockResolvedValue([]); expect(await adapter.findByClinic('clinic-id')).toEqual([]) })
  it('propagates infrastructure errors', async () => { query.exec.mockRejectedValue(new Error('network')); await expect(adapter.findByClinic('clinic-id')).rejects.toThrow('network') })
})
