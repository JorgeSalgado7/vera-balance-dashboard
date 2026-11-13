import { FindUsersByClinicDynamooseAdapter } from '../../../infrastructure/persistance/adapters/find-users-by-clinic-dynamoose.adapter'
import { UserModel } from '../../../infrastructure/persistance/models/user.model'
jest.mock('../../../infrastructure/persistance/models/user.model', () => ({ UserModel: { query: jest.fn() } }))
describe('FindUsersByClinicDynamooseAdapter', () => {
  it('queries the clinic GSI2 partition with a USER key prefix, paginates and excludes credential attributes', async () => {
    const lastKey = { pk: 'last', sk: 'USER' }
    const query = { eq: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), beginsWith: jest.fn().mockReturnThis(), using: jest.fn().mockReturnThis(), attributes: jest.fn().mockReturnThis(), startAt: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValueOnce(Object.assign([{ pk: 'user-1', sk: 'USER', clinic: 'clinic-id' }], { lastKey })).mockResolvedValueOnce([]) }
    const model = UserModel as unknown as { query: jest.Mock }; model.query.mockReturnValue(query)
    expect(await new FindUsersByClinicDynamooseAdapter().findByClinic('clinic-id')).toHaveLength(1)
    expect(model.query).toHaveBeenCalledWith('gsi2pk')
    expect(query.eq).toHaveBeenCalledWith('CLINIC#clinic-id')
    expect(query.where).toHaveBeenCalledWith('gsi2sk')
    expect(query.beginsWith).toHaveBeenCalledWith('USER#')
    expect(query.using).toHaveBeenCalledWith('GSI2')
    expect(query.startAt).toHaveBeenCalledWith(lastKey)
    expect(query.exec).toHaveBeenCalledTimes(2)
    expect(query.attributes.mock.calls[0][0]).not.toContain('password')
    expect(query.attributes.mock.calls[0][0]).not.toContain('password_recovery_code_hash')
  })
})
