import { processEntity } from '../../fixtures/process.fixture'
import { UpdateTherapeuticProcessStatusDynamooseAdapter } from '../../../infrastructure/persistance/adapters/update-therapeutic-process-status-dynamoose.adapter'
import { TherapeuticProcessModel } from '../../../infrastructure/persistance/models/therapeutic-process.model'
import { TherapeuticProcessNotFoundError } from '../../../domain/errors/therapeutic-process.error'
jest.mock('../../../infrastructure/persistance/models/therapeutic-process.model', () => ({ TherapeuticProcessModel: { update: jest.fn() } }))
describe('UpdateTherapeuticProcessStatusDynamooseAdapter', () => {
  const model = TherapeuticProcessModel as unknown as { update: jest.Mock }
  beforeEach(() => jest.resetAllMocks())
  it('sets only status and updated_at without recreating a missing process', async () => { model.update.mockResolvedValue(processEntity()); await new UpdateTherapeuticProcessStatusDynamooseAdapter().updateStatus('process-id', 'Cancelado', '2026-11-12T10:30:00.000Z'); expect(model.update).toHaveBeenCalledWith({ pk: 'process-id', sk: 'THERAPEUTIC_PROCESS' }, { $SET: { status: 'Cancelado', updated_at: '2026-11-12T10:30:00.000Z' } }, expect.objectContaining({ condition: expect.anything(), returnValues: 'ALL_NEW' })) })
  it('rejects a missing process', async () => { model.update.mockRejectedValue(Object.assign(new Error(), { name: 'ConditionalCheckFailedException' })); await expect(new UpdateTherapeuticProcessStatusDynamooseAdapter().updateStatus('missing', 'Activo', '2026-11-12T10:30:00.000Z')).rejects.toBeInstanceOf(TherapeuticProcessNotFoundError) })
})
