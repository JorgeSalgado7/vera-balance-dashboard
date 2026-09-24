import { Test, TestingModule } from '@nestjs/testing';
import { GetUserClinicIdUseCase } from '../../../application/use-cases/get-user-clinic-id.use-case';
import type { IFindUserClinicIdRepository } from '../../../domain/repositories/find-user-clinic-id.repository';

describe('GetUserClinicIdUseCase', () => {
  let module: TestingModule;
  let useCase: GetUserClinicIdUseCase;
  const repository = { findClinicIdByUserId: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    module = await Test.createTestingModule({
      providers: [GetUserClinicIdUseCase,
        { provide: 'IFindUserClinicIdRepository', useValue: repository satisfies IFindUserClinicIdRepository }]
    }).compile();
    useCase = module.get(GetUserClinicIdUseCase);
  });

  afterEach(async () => { await module.close(); });

  it.each(['clinic-id', null])('should return only the association %j', async clinicId => {
    repository.findClinicIdByUserId.mockResolvedValue(clinicId);
    await expect(useCase.execute('user-id')).resolves.toBe(clinicId);
    expect(repository.findClinicIdByUserId).toHaveBeenCalledWith('user-id');
  });

  it('should propagate repository failures', async () => {
    const error = new Error('Database unavailable');
    repository.findClinicIdByUserId.mockRejectedValue(error);
    await expect(useCase.execute('user-id')).rejects.toThrow(error);
  });
});
