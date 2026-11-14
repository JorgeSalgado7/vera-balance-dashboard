import { processEntity } from '../../fixtures/process.fixture'
import { FindTherapeuticProcessByIdDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-therapeutic-process-by-id-dynamoose.adapter'
import { TherapeuticProcessModel } from '../../../infrastructure/persistance/models/therapeutic-process.model'
import { TherapeuticProcessNotFoundError } from '../../../domain/errors/therapeutic-process.error'
jest.mock('../../../infrastructure/persistance/models/therapeutic-process.model', () => ({ TherapeuticProcessModel: { get: jest.fn() } }))
describe('FindTherapeuticProcessByIdDynamooseAdapter', () => {
  const model = TherapeuticProcessModel as unknown as { get: jest.Mock }
  beforeEach(() => jest.resetAllMocks())
  it('uses the complete primary key and a consistent read', async () => { model.get.mockResolvedValue(processEntity()); expect(await new FindTherapeuticProcessByIdDynamooseAdapter().findById('process-id')).toEqual(processEntity()); expect(model.get).toHaveBeenCalledWith({ pk: 'process-id', sk: 'THERAPEUTIC_PROCESS' }, { consistent: true }) })
  it('returns null for a missing process', async () => { expect(await new FindTherapeuticProcessByIdDynamooseAdapter().findById('missing')).toBeNull() })
})
