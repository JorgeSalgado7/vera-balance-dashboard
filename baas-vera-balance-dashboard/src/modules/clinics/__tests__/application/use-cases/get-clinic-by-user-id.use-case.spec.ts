import { Test, TestingModule } from '@nestjs/testing';
import { GetClinicByUserIdUseCase } from '../../../application/use-cases/get-clinic-by-user-id.use-case';
import type { UserClinicReaderPort } from '../../../application/ports/user-clinic-reader.port';
import type { IFindClinicByIdRepository } from '../../../domain/repositories/find-clinic-by-id.repository';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import { ClinicNotFoundError } from '../../../domain/errors/clinic.error';

const clinic: ClinicEntity = {
  id: 'clinic-id', name: 'Vera Balance', logo: null, address: 'Test address', phoneNumber: '5512345678',
  therapyTypes: [{ name: 'Terapia individual', icon: 'person' }], status: 'active',
  createdAt: '2026-09-14T00:00:00.000Z', updatedAt: '2026-09-22T00:00:00.000Z'
};

describe('GetClinicByUserIdUseCase', () => {
  let module: TestingModule;
  let useCase: GetClinicByUserIdUseCase;
  const users = { getClinicIdByUserId: jest.fn() };
  const clinics = { findById: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    users.getClinicIdByUserId.mockResolvedValue(clinic.id);
    clinics.findById.mockResolvedValue(structuredClone(clinic));
    module = await Test.createTestingModule({
      providers: [GetClinicByUserIdUseCase,
        { provide: 'UserClinicReaderPort', useValue: users satisfies UserClinicReaderPort },
        { provide: 'IFindClinicByIdRepository', useValue: clinics satisfies IFindClinicByIdRepository }]
    }).compile();
    useCase = module.get(GetClinicByUserIdUseCase);
  });

  afterEach(async () => { await module.close(); });

  it.each(['active', 'inactive'] as const)('should resolve the association before reading the %s clinic', async status => {
    const existing = Object.freeze({ ...structuredClone(clinic), status });
    clinics.findById.mockResolvedValue(existing);
    const result = await useCase.execute('user-id');
    expect(users.getClinicIdByUserId).toHaveBeenCalledWith('user-id');
    expect(clinics.findById).toHaveBeenCalledWith(clinic.id);
    expect(users.getClinicIdByUserId.mock.invocationCallOrder[0]).toBeLessThan(clinics.findById.mock.invocationCallOrder[0]);
    expect(result).toEqual({
      id: clinic.id, name: clinic.name, logo: clinic.logo, address: clinic.address,
      phone_number: clinic.phoneNumber, therapy_types: clinic.therapyTypes, status,
      created_at: clinic.createdAt, updated_at: clinic.updatedAt
    });
    expect(existing).toEqual({ ...clinic, status });
    expect(result).not.toHaveProperty('pk');
    expect(result).not.toHaveProperty('sk');
    expect(result).not.toHaveProperty('password');
  });

  it('should report an absent association without querying Clinics', async () => {
    users.getClinicIdByUserId.mockResolvedValue(null);
    await expect(useCase.execute('user-id')).rejects.toThrow(ClinicNotFoundError);
    expect(clinics.findById).not.toHaveBeenCalled();
  });

  it('should report a referenced clinic that no longer exists', async () => {
    clinics.findById.mockResolvedValue(null);
    await expect(useCase.execute('user-id')).rejects.toThrow(ClinicNotFoundError);
    expect(clinics.findById).toHaveBeenCalledWith(clinic.id);
  });

  it('should stop when Users cannot resolve the association', async () => {
    const error = new Error('Users unavailable');
    users.getClinicIdByUserId.mockRejectedValue(error);
    await expect(useCase.execute('user-id')).rejects.toThrow(error);
    expect(clinics.findById).not.toHaveBeenCalled();
  });

  it('should propagate clinic persistence failures', async () => {
    const error = new Error('Clinics unavailable');
    clinics.findById.mockRejectedValue(error);
    await expect(useCase.execute('user-id')).rejects.toThrow(error);
  });
});
