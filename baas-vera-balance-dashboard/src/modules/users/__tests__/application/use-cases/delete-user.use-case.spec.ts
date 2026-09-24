import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case';
import { UserNotFoundError } from '../../../domain/errors/user.error';
import type { UserEntity } from '../../../domain/entities/user.entity';

const existing: UserEntity = {
  id: 'user-id', name: 'Mónica', email: 'monica@example.com', passwordHash: 'secret-hash',
  professionalLicense: '123', clinicId: '7cb3a81a-e137-4ef4-aafd-6e387c8c7390',
  role: 'therapist', status: 'active',
  createdAt: '2026-09-17T00:00:00.000Z', updatedAt: '2026-09-18T00:00:00.000Z'
};

describe('DeleteUserUseCase', () => {
  let module: TestingModule;
  let useCase: DeleteUserUseCase;
  const reader = { findById: jest.fn() };
  const deleter = { delete: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    reader.findById.mockResolvedValue(Object.freeze({ ...existing }));
    module = await Test.createTestingModule({
      providers: [DeleteUserUseCase,
        { provide: 'IFindUserByIdRepository', useValue: reader },
        { provide: 'IDeleteUserRepository', useValue: deleter }]
    }).compile();
    useCase = module.get(DeleteUserUseCase);
  });

  afterEach(async () => { await module.close(); });

  it('should report a missing user', async () => {
    reader.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing')).rejects.toThrow(UserNotFoundError);
    expect(reader.findById).toHaveBeenCalledWith('missing');
    expect(deleter.delete).not.toHaveBeenCalled();
  });

  it('should propagate read failures', async () => {
    const error = new Error('Read failed');
    reader.findById.mockRejectedValue(error);
    await expect(useCase.execute(existing.id)).rejects.toThrow(error);
    expect(deleter.delete).not.toHaveBeenCalled();
  });

  it('should verify existence before deleting by ID and return no information', async () => {
    await expect(useCase.execute(existing.id)).resolves.toBeUndefined();
    expect(reader.findById).toHaveBeenCalledWith(existing.id);
    expect(deleter.delete).toHaveBeenCalledTimes(1);
    expect(deleter.delete).toHaveBeenCalledWith(existing.id);
    expect(reader.findById.mock.invocationCallOrder[0]).toBeLessThan(deleter.delete.mock.invocationCallOrder[0]);
  });

  it('should propagate deletion failures', async () => {
    const error = new Error('Delete failed');
    deleter.delete.mockRejectedValue(error);
    await expect(useCase.execute(existing.id)).rejects.toThrow(error);
  });
});
