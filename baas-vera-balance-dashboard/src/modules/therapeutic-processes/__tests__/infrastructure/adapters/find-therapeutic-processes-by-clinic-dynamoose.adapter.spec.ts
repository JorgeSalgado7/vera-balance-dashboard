import { processEntity } from '../../fixtures/process.fixture'
import { FindTherapeuticProcessesByClinicDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-therapeutic-processes-by-clinic-dynamoose.adapter'
import { TherapeuticProcessModel } from '../../../infrastructure/persistance/models/therapeutic-process.model'
jest.mock('../../../infrastructure/persistance/models/therapeutic-process.model', () => ({ TherapeuticProcessModel: { query: jest.fn() } }))
describe('FindTherapeuticProcessesByClinicDynamooseAdapter', () => {
  it('uses GSI2, the clinic partition and process prefix, consuming all pages', async () => {
    const lastKey = { pk: 'last', sk: 'THERAPEUTIC_PROCESS' }
    const query = { eq: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), beginsWith: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), startAt: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValueOnce(Object.assign([processEntity()], { lastKey })).mockResolvedValueOnce([]) }
    const model = TherapeuticProcessModel as unknown as { query: jest.Mock }; model.query.mockReturnValue(query)
    expect(await new FindTherapeuticProcessesByClinicDynamooseAdapter().findByClinic('clinic-id')).toEqual([processEntity()])
    expect(model.query).toHaveBeenCalledWith('gsi2pk'); expect(query.eq).toHaveBeenCalledWith('CLINIC#clinic-id'); expect(query.beginsWith).toHaveBeenCalledWith('THERAPEUTIC_PROCESS#'); expect(query.using).toHaveBeenCalledWith('GSI2'); expect(query.startAt).toHaveBeenCalledWith(lastKey)
  })
})
