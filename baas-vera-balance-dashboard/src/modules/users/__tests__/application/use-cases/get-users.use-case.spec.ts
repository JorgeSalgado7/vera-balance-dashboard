import { Test, TestingModule } from '@nestjs/testing';
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { IFindUsersRepository } from '../../../domain/repositories/find-users.repository';

describe('GetUsersUseCase', () => {
  let module: TestingModule;
  let useCase: GetUsersUseCase;
  const repository = { findAll: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      providers: [GetUsersUseCase, {
        provide: 'IFindUsersRepository',
        useValue: repository satisfies IFindUsersRepository
      }]
    }).compile();
    useCase = module.get(GetUsersUseCase);
  });

  afterEach(async () => { await module.close(); });

  it('should return every public field for both roles and statuses without changing users', async () => {
    const users: UserEntity[] = [
      { id: 'user-1', name: 'Mónica', email: 'monica@example.com', passwordHash: 'secret-hash',
        professionalLicense: '123', clinicId: 'clinic-1', role: 'clinic', status: 'active',
        createdAt: '2026-09-17T00:00:00.000Z', updatedAt: '2026-09-18T00:00:00.000Z' },
      { id: 'user-2', name: 'Ana', email: 'ana@example.com', passwordHash: 'another-hash',
        professionalLicense: '456', clinicId: 'clinic-2', role: 'therapist', status: 'inactive',
        createdAt: '2026-09-18T00:00:00.000Z', updatedAt: '2026-09-19T00:00:00.000Z' }
    ];
    const snapshot = structuredClone(users);
    users.forEach(Object.freeze);
    repository.findAll.mockResolvedValue(Object.freeze(users));

    const result = await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { id: 'user-1', name: 'Mónica', email: 'monica@example.com', professional_license: '123',
        clinic: { id: 'clinic-1' }, role: 'clinic', status: 'active',
        created_at: '2026-09-17T00:00:00.000Z', updated_at: '2026-09-18T00:00:00.000Z' },
      { id: 'user-2', name: 'Ana', email: 'ana@example.com', professional_license: '456',
        clinic: { id: 'clinic-2' }, role: 'therapist', status: 'inactive',
        created_at: '2026-09-18T00:00:00.000Z', updated_at: '2026-09-19T00:00:00.000Z' }
    ]);
    for (const user of result) {
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('passwordHash');
    }
    expect(users).toEqual(snapshot);
  });

  it('should return an empty list when no users exist', async () => {
    repository.findAll.mockResolvedValue([]);
    await expect(useCase.execute()).resolves.toEqual([]);
  });

  it('should propagate repository failures instead of returning an empty list', async () => {
    const error = new Error('Database unavailable');
    repository.findAll.mockRejectedValue(error);
    await expect(useCase.execute()).rejects.toThrow(error);
  });
});
