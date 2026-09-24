import * as dynamoose from 'dynamoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ClinicNotFoundError } from '../../../domain/errors/clinic.error';
import { GetClinicByUserIdController } from '../../../presentation/controllers/get-clinic-by-user-id.controller';
import { GetUserClinicIdUseCase } from '../../../../users/application/use-cases/get-user-clinic-id.use-case';
import type { UserClinicReaderPort } from '../../../application/ports/user-clinic-reader.port';

process.env.DYNAMO_TABLE_NAME = 'clinic-user-test';
dynamoose.Table.defaults.set({ create: false, waitForActive: false });
const { UsersModule } = require('../../../../users/users.module');
const { ClinicsModule } = require('../../../clinics.module');

const clinicItem = {
  pk: { S: 'clinic-id' }, sk: { S: 'CLINIC' }, name: { S: 'Vera Balance' },
  logo: { S: 'logo.png' }, address: { S: 'Test address' }, phone_number: { S: '5512345678' },
  therapy_types: { L: [{ M: { name: { S: 'Terapia individual' }, icon: { S: 'person' } } }] },
  status: { S: 'active' }, created_at: { S: '2026-09-14T00:00:00.000Z' }, updated_at: { S: '2026-09-22T00:00:00.000Z' }
};
const userAssociation = { clinic: { M: { pk: { S: 'clinic-id' }, sk: { S: 'CLINIC' } } } };

describe('UserClinicReaderAdapter module integration', () => {
  let module: TestingModule;
  const ddb = { getItem: jest.fn(), putItem: jest.fn(), updateItem: jest.fn(), deleteItem: jest.fn(), scan: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    dynamoose.aws.ddb.set(ddb as never);
    module = await Test.createTestingModule({ imports: [UsersModule, ClinicsModule] }).compile();
  });

  afterEach(async () => {
    expect(ddb.putItem).not.toHaveBeenCalled();
    expect(ddb.updateItem).not.toHaveBeenCalled();
    expect(ddb.deleteItem).not.toHaveBeenCalled();
    expect(ddb.scan).not.toHaveBeenCalled();
    await module.close();
  });

  afterAll(() => {
    dynamoose.aws.ddb.revert();
    dynamoose.Table.defaults.set({});
  });

  it('should resolve Users and Clinics without a module cycle and return the full public clinic', async () => {
    ddb.getItem.mockResolvedValueOnce({ Item: userAssociation }).mockResolvedValueOnce({ Item: clinicItem });
    const response = await module.get(GetClinicByUserIdController).execute('user-id');
    expect(response).toEqual({
      id: 'clinic-id', name: 'Vera Balance', logo: 'logo.png', address: 'Test address', phone_number: '5512345678',
      therapy_types: [{ name: 'Terapia individual', icon: 'person' }], status: 'active',
      created_at: '2026-09-14T00:00:00.000Z', updated_at: '2026-09-22T00:00:00.000Z'
    });
    expect(ddb.getItem).toHaveBeenCalledTimes(2);
    const userRead = ddb.getItem.mock.calls[0][0];
    expect(userRead.TableName).toBe('clinic-user-test');
    expect(userRead.Key).toEqual({ pk: { S: 'user-id' }, sk: { S: 'USER' } });
    expect(userRead.ProjectionExpression).toBe('#a0');
    expect(userRead.ExpressionAttributeNames).toEqual({ '#a0': 'clinic' });
    expect(ddb.getItem.mock.calls[1][0]).toMatchObject({
      TableName: 'clinic-user-test', Key: { pk: { S: 'clinic-id' }, sk: { S: 'CLINIC' } }
    });
  });

  it.each([{}, { Item: {} }, { Item: { clinic: { M: {} } } }])(
    'should report a missing user or association without reading Clinics: %j', async result => {
      ddb.getItem.mockResolvedValueOnce(result);
      await expect(module.get(GetClinicByUserIdController).execute('user-id')).rejects.toThrow(ClinicNotFoundError);
      expect(ddb.getItem).toHaveBeenCalledTimes(1);
    }
  );

  it('should report a clinic referenced by Users that no longer exists', async () => {
    ddb.getItem.mockResolvedValueOnce({ Item: userAssociation }).mockResolvedValueOnce({});
    await expect(module.get(GetClinicByUserIdController).execute('user-id')).rejects.toThrow(ClinicNotFoundError);
    expect(ddb.getItem).toHaveBeenCalledTimes(2);
  });

  it('should expose only the clinic ID through the public Users capability and Clinics port', async () => {
    ddb.getItem.mockResolvedValue({ Item: userAssociation });
    await expect(module.get(GetUserClinicIdUseCase).execute('user-id')).resolves.toBe('clinic-id');
    await expect(module.get<UserClinicReaderPort>('UserClinicReaderPort').getClinicIdByUserId('user-id')).resolves.toBe('clinic-id');
  });

  it.each(['user', 'clinic'])('should propagate %s read failures', async source => {
    const error = new Error('Database unavailable');
    if (source === 'clinic') ddb.getItem.mockResolvedValueOnce({ Item: userAssociation });
    ddb.getItem.mockRejectedValueOnce(error);
    await expect(module.get(GetClinicByUserIdController).execute('user-id')).rejects.toThrow(error);
    expect(ddb.getItem).toHaveBeenCalledTimes(source === 'user' ? 1 : 2);
  });
});
