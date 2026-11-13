import { TherapyTypeClinicAssignmentsDynamooseAdapter } from '../../../infrastructure/persistance/adapters/therapy-type-clinic-assignments-dynamoose.adapter'
import { TherapyTypeModel } from '../../../infrastructure/persistance/models/therapy-type.model'

jest.mock('../../../infrastructure/persistance/models/therapy-type.model', () => ({ TherapyTypeModel: { query: jest.fn() } }))

describe('TherapyTypeClinicAssignmentsDynamooseAdapter', () => {
  const model = TherapyTypeModel as unknown as { query: jest.Mock }
  const adapter = new TherapyTypeClinicAssignmentsDynamooseAdapter()
  const query = { eq: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), filter: jest.fn().mockReturnThis(), contains: jest.fn().mockReturnThis(), attributes: jest.fn().mockReturnThis(), limit: jest.fn().mockReturnThis(), startAt: jest.fn().mockReturnThis(), exec: jest.fn() }
  beforeEach(() => { jest.clearAllMocks(); query.exec.mockReset(); model.query.mockReturnValue(query) })

  it('checks the clinic GSI1 partition for membership in therapy_types', async () => {
    query.exec.mockResolvedValue([{ pk: 'assigned-clinic' }])
    expect(await adapter.isAssignedToClinic('therapy-id')).toBe(true)
    expect(model.query).toHaveBeenCalledWith('gsi1pk')
    expect(query.eq).toHaveBeenCalledWith('CLINIC')
    expect(query.using).toHaveBeenCalledWith('GSI1')
    expect(query.filter).toHaveBeenCalledWith('therapy_types')
    expect(query.contains).toHaveBeenCalledWith('therapy-id')
    expect(query.attributes).toHaveBeenCalledWith(['pk'])
  })

  it('continues after an empty filtered page and stops at the first assigned clinic', async () => {
    const lastKey = { pk: 'first-clinic', sk: 'CLINIC' }
    query.exec.mockResolvedValueOnce(Object.assign([], { lastKey })).mockResolvedValueOnce([{ pk: 'second-clinic' }])
    expect(await adapter.isAssignedToClinic('therapy-id')).toBe(true)
    expect(query.startAt).toHaveBeenCalledWith(lastKey)
    expect(query.exec).toHaveBeenCalledTimes(2)
  })

  it('returns false only after exhausting all pages without a match', async () => {
    query.exec.mockResolvedValueOnce(Object.assign([], { lastKey: { pk: 'first-clinic', sk: 'CLINIC' } })).mockResolvedValueOnce([])
    expect(await adapter.isAssignedToClinic('unused')).toBe(false)
    expect(query.exec).toHaveBeenCalledTimes(2)
  })

  it('propagates errors rather than treating an unavailable database as no assignments', async () => {
    query.exec.mockRejectedValue(new Error('database unavailable'))
    await expect(adapter.isAssignedToClinic('therapy-id')).rejects.toThrow('database unavailable')
  })
})
