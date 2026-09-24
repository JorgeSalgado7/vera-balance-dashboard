import * as dynamoose from 'dynamoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserMapper } from '../../../../infrastructure/mappers/user.mapper';
import type { UserPersistence } from '../../../../infrastructure/persistence/interfaces/user-persistence.interface';
import { UserNotFoundError } from '../../../../domain/errors/user.error';
import { ClinicNotFoundError } from '../../../../../clinics/domain/errors/clinic.error';

process.env.DYNAMO_TABLE_NAME = 'users-test';
dynamoose.Table.defaults.set({ create: false, waitForActive: false });
const { CreateUserDynamooseAdapter } = require('../../../../infrastructure/persistence/adapters/create-user-dynamoose.adapter');
const { FindUserByEmailDynamooseAdapter } = require('../../../../infrastructure/persistence/adapters/find-user-by-email-dynamoose.adapter');
const { FindUsersDynamooseAdapter } = require('../../../../infrastructure/persistence/adapters/find-users-dynamoose.adapter');
const { GetUsersController } = require('../../../../presentation/controllers/get-users.controller');
const { FindUserByIdDynamooseAdapter } = require('../../../../infrastructure/persistence/adapters/find-user-by-id-dynamoose.adapter');
const { UpdateUserDynamooseAdapter } = require('../../../../infrastructure/persistence/adapters/update-user-dynamoose.adapter');
const { DeleteUserDynamooseAdapter } = require('../../../../infrastructure/persistence/adapters/delete-user-dynamoose.adapter');
const { UpdateUserStatusDynamooseAdapter } = require('../../../../infrastructure/persistence/adapters/update-user-status-dynamoose.adapter');
const { GetUserByIdController } = require('../../../../presentation/controllers/get-user-by-id.controller');
const { UpdateUserController } = require('../../../../presentation/controllers/update-user.controller');
const { DeleteUserController } = require('../../../../presentation/controllers/delete-user.controller');
const { UpdateUserStatusController } = require('../../../../presentation/controllers/update-user-status.controller');
const { UsersModule } = require('../../../../users.module');

const item: UserPersistence = {
  pk: 'user-id', sk: 'USER', name: 'Mónica', email: 'monica@example.com', password: 'hash',
  professional_license: '123', clinic: { pk: 'clinic-id', sk: 'CLINIC' }, role: 'therapist', status: 'active',
  created_at: '2026-09-17T00:00:00.000Z', updated_at: '2026-09-17T00:00:00.000Z'
};
const dynamoItem = {
  pk: { S: item.pk }, sk: { S: item.sk }, name: { S: item.name }, email: { S: item.email },
  password: { S: item.password }, professional_license: { S: item.professional_license },
  clinic: { M: { pk: { S: item.clinic.pk }, sk: { S: 'CLINIC' } } }, role: { S: item.role },
  status: { S: item.status }, created_at: { S: item.created_at }, updated_at: { S: item.updated_at }
};

describe('User Dynamoose adapters', () => {
  const ddb = { putItem: jest.fn(), scan: jest.fn(), getItem: jest.fn(), updateItem: jest.fn(), deleteItem: jest.fn() };

  beforeEach(() => {
    jest.resetAllMocks();
    dynamoose.aws.ddb.set(ddb as never);
    ddb.putItem.mockResolvedValue({});
    ddb.scan.mockResolvedValue({ Items: [], Count: 0, ScannedCount: 0 });
    ddb.getItem.mockResolvedValue({});
    ddb.updateItem.mockResolvedValue({});
    ddb.deleteItem.mockResolvedValue({});
  });

  afterAll(() => {
    dynamoose.aws.ddb.revert();
    dynamoose.Table.defaults.set({});
  });

  it('should find a user by the documented composite key without writing', async () => {
    ddb.getItem.mockResolvedValueOnce({ Item: dynamoItem });
    expect(await new FindUserByIdDynamooseAdapter().findById(item.pk)).toEqual(UserMapper.toEntity(item));
    expect(ddb.getItem).toHaveBeenCalledWith(expect.objectContaining({
      TableName: 'users-test', Key: { pk: { S: item.pk }, sk: { S: 'USER' } }
    }));
    expect(ddb.putItem).not.toHaveBeenCalled();
    expect(ddb.updateItem).not.toHaveBeenCalled();
    expect(ddb.deleteItem).not.toHaveBeenCalled();
  });

  it('should return null when the user ID does not exist', async () => {
    expect(await new FindUserByIdDynamooseAdapter().findById('missing')).toBeNull();
  });

  it('should update public data without writing password or creation date', async () => {
    const entity = UserMapper.toEntity({ ...item, name: 'Updated', clinic: { pk: 'new-clinic', sk: 'CLINIC' } });
    expect(await new UpdateUserDynamooseAdapter().update(entity)).toBe(entity);
    expect(ddb.updateItem).toHaveBeenCalledTimes(1);
    const command = ddb.updateItem.mock.calls[0][0];
    expect(command.TableName).toBe('users-test');
    expect(command.Key).toEqual({ pk: { S: item.pk }, sk: { S: 'USER' } });
    expect(command.ConditionExpression).toContain('attribute_exists');
    const names = Object.values(command.ExpressionAttributeNames);
    expect(names).toEqual(expect.arrayContaining(['name', 'email', 'professional_license', 'clinic', 'role', 'status', 'updated_at']));
    expect(names).not.toContain('password');
    expect(names).not.toContain('created_at');
    expect(Object.values(command.ExpressionAttributeValues)).toContainEqual({ M: { pk: { S: 'new-clinic' }, sk: { S: 'CLINIC' } } });
    expect(ddb.putItem).not.toHaveBeenCalled();
  });

  it('should update only status and updated_at with an existence condition', async () => {
    const entity = UserMapper.toEntity({ ...item, status: 'inactive', updated_at: '2026-09-22T00:00:00.000Z' });
    expect(await new UpdateUserStatusDynamooseAdapter().updateStatus(entity)).toBe(entity);
    const command = ddb.updateItem.mock.calls[0][0];
    expect(command.TableName).toBe('users-test');
    expect(command.Key).toEqual({ pk: { S: item.pk }, sk: { S: 'USER' } });
    expect(command.ConditionExpression).toContain('attribute_exists');
    expect(Object.values(command.ExpressionAttributeNames).sort()).toEqual(['pk', 'status', 'updated_at']);
    expect(Object.values(command.ExpressionAttributeValues)).toEqual(expect.arrayContaining([
      { S: 'inactive' }, { S: entity.updatedAt }
    ]));
    expect(ddb.putItem).not.toHaveBeenCalled();
  });

  it('should delete only the USER item using its unique ID', async () => {
    await expect(new DeleteUserDynamooseAdapter().delete(item.pk)).resolves.toBeUndefined();
    expect(ddb.deleteItem).toHaveBeenCalledTimes(1);
    expect(ddb.deleteItem).toHaveBeenCalledWith(expect.objectContaining({
      TableName: 'users-test', Key: { pk: { S: item.pk }, sk: { S: 'USER' } }
    }));
  });

  it('should report a user deleted between the read and update', async () => {
    const error = new Error('Conditional check failed');
    error.name = 'ConditionalCheckFailedException';
    ddb.updateItem.mockRejectedValue(error);
    await expect(new UpdateUserDynamooseAdapter().update(UserMapper.toEntity(item))).rejects.toThrow(UserNotFoundError);
    await expect(new UpdateUserStatusDynamooseAdapter().updateStatus(UserMapper.toEntity(item))).rejects.toThrow(UserNotFoundError);
    expect(ddb.putItem).not.toHaveBeenCalled();
  });

  it('should wire each user flow to its specific persistence adapter', async () => {
    const module: TestingModule = await Test.createTestingModule({ imports: [UsersModule] }).compile();
    try {
      expect(module.get('IFindUserByIdRepository')).toBeInstanceOf(FindUserByIdDynamooseAdapter);
      expect(module.get('IUpdateUserRepository')).toBeInstanceOf(UpdateUserDynamooseAdapter);
      expect(module.get('IDeleteUserRepository')).toBeInstanceOf(DeleteUserDynamooseAdapter);
      expect(module.get('IUpdateUserStatusRepository')).toBeInstanceOf(UpdateUserStatusDynamooseAdapter);
      ddb.getItem.mockResolvedValue({ Item: dynamoItem });
      const response = await module.get(GetUserByIdController).execute(item.pk);
      expect(response).toEqual({
        id: item.pk, name: item.name, email: item.email, professional_license: item.professional_license,
        clinic: { id: item.clinic.pk }, role: item.role, status: item.status,
        created_at: item.created_at, updated_at: item.updated_at
      });
      expect(await module.get(UpdateUserController).execute(item.pk, { name: 'Changed' })).toMatchObject({ name: 'Changed' });
      expect(await module.get(UpdateUserStatusController).execute(item.pk, { status: 'inactive' })).toMatchObject({ status: 'inactive' });
      await expect(module.get(DeleteUserController).execute(item.pk)).resolves.toBeUndefined();
      expect(ddb.updateItem).toHaveBeenCalledTimes(2);
      expect(ddb.deleteItem).toHaveBeenCalledTimes(1);
    } finally {
      await module.close();
    }
  });

  it('should list users across all pages using only the documented USER filter', async () => {
    const lastKey = { pk: { S: 'previous' }, sk: { S: 'CLINIC' } };
    ddb.scan.mockResolvedValueOnce({ Items: [], Count: 0, ScannedCount: 1, LastEvaluatedKey: lastKey })
      .mockResolvedValueOnce({ Items: [dynamoItem], Count: 1, ScannedCount: 1 });
    expect(await new FindUsersDynamooseAdapter().findAll()).toEqual([UserMapper.toEntity(item)]);
    expect(ddb.scan).toHaveBeenCalledTimes(2);
    const query = ddb.scan.mock.calls[0][0];
    expect(query.TableName).toBe('users-test');
    expect(query.FilterExpression).toBe('#a0 = :v0');
    expect(query.ExpressionAttributeNames).toEqual({ '#a0': 'sk' });
    expect(query.ExpressionAttributeValues).toEqual({ ':v0': { S: 'USER' } });
    expect(ddb.scan.mock.calls[1][0].ExclusiveStartKey).toEqual(lastKey);
    expect(ddb.putItem).not.toHaveBeenCalled();
  });

  it('should return an empty list when no USER items exist', async () => {
    expect(await new FindUsersDynamooseAdapter().findAll()).toEqual([]);
    expect(ddb.putItem).not.toHaveBeenCalled();
  });

  it('should persist only the documented USER item in the shared table', async () => {
    const entity = UserMapper.toEntity(item);
    expect(await new CreateUserDynamooseAdapter().create(entity)).toBe(entity);
    expect(ddb.putItem).toHaveBeenCalledTimes(1);
    const write = ddb.putItem.mock.calls[0][0];
    expect(write.TableName).toBe('users-test');
    expect(write.Item).toEqual(dynamoItem);
    expect(write.ConditionExpression).toContain('attribute_not_exists');
  });

  it('should find an existing email on a later page with consistent reads', async () => {
    const lastKey = { pk: { S: 'previous' }, sk: { S: 'USER' } };
    ddb.scan.mockResolvedValueOnce({ Items: [], Count: 0, ScannedCount: 1, LastEvaluatedKey: lastKey })
      .mockResolvedValueOnce({ Items: [dynamoItem], Count: 1, ScannedCount: 1 });
    const result = await new FindUserByEmailDynamooseAdapter().findByEmail(item.email);
    expect(result).toEqual(UserMapper.toEntity(item));
    expect(ddb.scan).toHaveBeenCalledTimes(2);
    const query = ddb.scan.mock.calls[0][0];
    expect(query.TableName).toBe('users-test');
    expect(query.ConsistentRead).toBe(true);
    expect(Object.values(query.ExpressionAttributeValues)).toEqual(expect.arrayContaining([{ S: 'USER' }, { S: item.email }]));
    expect(ddb.scan.mock.calls[1][0].ExclusiveStartKey).toEqual(lastKey);
    expect(ddb.putItem).not.toHaveBeenCalled();
  });

  it('should return null when the email does not exist', async () => {
    expect(await new FindUserByEmailDynamooseAdapter().findByEmail(item.email)).toBeNull();
  });

  it('should propagate database failures', async () => {
    const failure = new Error('Database unavailable');
    ddb.getItem.mockRejectedValue(failure);
    ddb.updateItem.mockRejectedValue(failure);
    ddb.deleteItem.mockRejectedValue(failure);
    ddb.scan.mockRejectedValue(failure);
    ddb.putItem.mockRejectedValue(failure);
    await expect(new FindUserByIdDynamooseAdapter().findById(item.pk)).rejects.toThrow(failure);
    await expect(new UpdateUserDynamooseAdapter().update(UserMapper.toEntity(item))).rejects.toThrow(failure);
    await expect(new UpdateUserStatusDynamooseAdapter().updateStatus(UserMapper.toEntity(item))).rejects.toThrow(failure);
    await expect(new DeleteUserDynamooseAdapter().delete(item.pk)).rejects.toThrow(failure);
    await expect(new FindUsersDynamooseAdapter().findAll()).rejects.toThrow(failure);
    await expect(new FindUserByEmailDynamooseAdapter().findByEmail(item.email)).rejects.toThrow(failure);
    await expect(new CreateUserDynamooseAdapter().create(UserMapper.toEntity(item))).rejects.toThrow(failure);
  });

  it('should wire the module and resolve Clinics through its public use case', async () => {
    const module: TestingModule = await Test.createTestingModule({ imports: [UsersModule] }).compile();
    expect(module.get('IFindUsersRepository')).toBeInstanceOf(FindUsersDynamooseAdapter);
    ddb.scan.mockResolvedValueOnce({ Items: [dynamoItem], Count: 1, ScannedCount: 1 });
    const response = await module.get(GetUsersController).execute();
    expect(response).toEqual([{
      id: item.pk, name: item.name, email: item.email, professional_license: item.professional_license,
      clinic: { id: item.clinic.pk }, role: item.role, status: item.status,
      created_at: item.created_at, updated_at: item.updated_at
    }]);
    expect(JSON.stringify(response)).not.toContain(item.password);
    expect(ddb.putItem).not.toHaveBeenCalled();
    const reader = module.get('ClinicReaderPort');
    await expect(reader.requireExisting('clinic-id')).rejects.toThrow(ClinicNotFoundError);
    expect(ddb.getItem.mock.calls[0][0].Key).toEqual({ pk: { S: 'clinic-id' }, sk: { S: 'CLINIC' } });
    expect(module.get('ICreateUserRepository')).toBeInstanceOf(CreateUserDynamooseAdapter);
    await module.close();
  });
});
