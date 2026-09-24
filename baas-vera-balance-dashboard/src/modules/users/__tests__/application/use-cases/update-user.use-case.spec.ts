import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case';
import { UpdateUserDto } from '../../../application/dtos/update-user.dto';
import { UpdateUserDomainService } from '../../../domain/services/update-user.domain-service';
import { ValidateUserRoleDomainService } from '../../../domain/services/validate-user-role.domain-service';
import { ValidateUserStatusDomainService } from '../../../domain/services/validate-user-status.domain-service';
import {
  MissingUserNameError, MissingUserEmailError, InvalidUserEmailError,
  MissingUserProfessionalLicenseError, MissingUserClinicError, InvalidUserClinicError,
  InvalidUserRoleError, InvalidUserStatusError, UserEmailAlreadyExistsError, UserNotFoundError
} from '../../../domain/errors/user.error';
import { ClinicNotFoundError } from '../../../../clinics/domain/errors/clinic.error';
import type { UserEntity } from '../../../domain/entities/user.entity';

const existing: UserEntity = {
  id: 'user-id', name: 'Mónica', email: 'monica@example.com', passwordHash: 'secret-hash',
  professionalLicense: '123', clinicId: '7cb3a81a-e137-4ef4-aafd-6e387c8c7390',
  role: 'therapist', status: 'active',
  createdAt: '2026-09-17T00:00:00.000Z', updatedAt: '2026-09-18T00:00:00.000Z'
};

describe('UpdateUserUseCase', () => {
  let module: TestingModule;
  let useCase: UpdateUserUseCase;
  const reader = { findById: jest.fn() };
  const emails = { findByEmail: jest.fn() };
  const writer = { update: jest.fn() };
  const clinics = { requireExisting: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    reader.findById.mockResolvedValue({ ...existing });
    emails.findByEmail.mockResolvedValue(null);
    writer.update.mockImplementation(async entity => entity);
    module = await Test.createTestingModule({
      providers: [UpdateUserUseCase, UpdateUserDomainService, ValidateUserRoleDomainService, ValidateUserStatusDomainService,
        { provide: 'IFindUserByIdRepository', useValue: reader },
        { provide: 'IFindUserByEmailRepository', useValue: emails },
        { provide: 'IUpdateUserRepository', useValue: writer },
        { provide: 'ClinicReaderPort', useValue: clinics }]
    }).compile();
    useCase = module.get(UpdateUserUseCase);
  });

  afterEach(async () => { await module.close(); });

  it('should update all allowed fields and return only public information', async () => {
    const dto: UpdateUserDto = {
      name: 'Ana', email: 'ana@example.com', professional_license: '456',
      clinic_id: '1ed1cd29-ef1d-4814-bad9-86d91744c7cb', role: 'clinic', status: 'inactive'
    };
    const before = Date.now();
    const result = await useCase.execute(existing.id, dto);
    expect(reader.findById).toHaveBeenCalledWith(existing.id);
    expect(emails.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(clinics.requireExisting).toHaveBeenCalledWith(dto.clinic_id);
    expect(writer.update).toHaveBeenCalledWith({
      ...existing, name: dto.name, email: dto.email, professionalLicense: dto.professional_license,
      clinicId: dto.clinic_id, role: dto.role, status: dto.status, updatedAt: result.updated_at
    });
    expect(result).toEqual({
      id: existing.id, name: dto.name, email: dto.email, professional_license: dto.professional_license,
      clinic: { id: dto.clinic_id }, role: dto.role, status: dto.status,
      created_at: existing.createdAt, updated_at: result.updated_at
    });
    expect(Date.parse(result.updated_at)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(result.updated_at)).toBeLessThanOrEqual(Date.now());
    expect(JSON.stringify(result)).not.toContain(existing.passwordHash);
  });

  it.each([{}, { name: 'Updated' }, { role: 'clinic' }, { status: 'inactive' }] as UpdateUserDto[])(
    'should preserve omitted fields, password hash and creation date for %j', async dto => {
      const result = await useCase.execute(existing.id, dto);
      expect(writer.update).toHaveBeenCalledWith({ ...existing, ...dto, updatedAt: result.updated_at });
      expect(emails.findByEmail).not.toHaveBeenCalled();
      expect(clinics.requireExisting).not.toHaveBeenCalled();
    }
  );

  it('should reject an email already owned by another user before writing', async () => {
    emails.findByEmail.mockResolvedValue({ ...existing, id: 'other-user', status: 'inactive' });
    await expect(useCase.execute(existing.id, { email: 'taken@example.com' })).rejects.toThrow(UserEmailAlreadyExistsError);
    expect(writer.update).not.toHaveBeenCalled();
  });

  it('should allow the same user to retain their email', async () => {
    emails.findByEmail.mockResolvedValue({ ...existing });
    await expect(useCase.execute(existing.id, { email: existing.email })).resolves.toMatchObject({ email: existing.email });
    expect(writer.update).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['name', MissingUserNameError], ['email', MissingUserEmailError],
    ['professional_license', MissingUserProfessionalLicenseError], ['clinic_id', MissingUserClinicError]
  ] as const)('should reject empty or null %s without writing', async (field, error) => {
    for (const value of ['', '  ', null, 123, {}]) {
      await expect(useCase.execute(existing.id, { [field]: value } as UpdateUserDto)).rejects.toThrow(error);
    }
    expect(writer.update).not.toHaveBeenCalled();
    expect(emails.findByEmail).not.toHaveBeenCalled();
    expect(clinics.requireExisting).not.toHaveBeenCalled();
  });

  it.each([
    [{ email: 'invalid' }, InvalidUserEmailError], [{ clinic_id: 'invalid' }, InvalidUserClinicError],
    [{ role: 'admin' }, InvalidUserRoleError], [{ role: null }, InvalidUserRoleError],
    [{ status: 'disabled' }, InvalidUserStatusError], [{ status: null }, InvalidUserStatusError]
  ])('should reject invalid update %j', async (dto, error) => {
    await expect(useCase.execute(existing.id, dto as UpdateUserDto)).rejects.toThrow(error as typeof Error);
    expect(writer.update).not.toHaveBeenCalled();
  });

  it('should reject a missing clinic before writing', async () => {
    clinics.requireExisting.mockRejectedValue(new ClinicNotFoundError());
    await expect(useCase.execute(existing.id, { clinic_id: '1ed1cd29-ef1d-4814-bad9-86d91744c7cb' })).rejects.toThrow(ClinicNotFoundError);
    expect(writer.update).not.toHaveBeenCalled();
  });

  it('should keep the current clinic without resolving it again', async () => {
    await useCase.execute(existing.id, { clinic_id: existing.clinicId });
    expect(clinics.requireExisting).not.toHaveBeenCalled();
  });

  it('should reject a missing user before checking dependencies or writing', async () => {
    reader.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing', { name: 'Ana' })).rejects.toThrow(UserNotFoundError);
    expect(writer.update).not.toHaveBeenCalled();
    expect(emails.findByEmail).not.toHaveBeenCalled();
    expect(clinics.requireExisting).not.toHaveBeenCalled();
  });

  it.each(['read', 'email', 'clinic', 'write'])('should propagate %s failures', async operation => {
    const error = new Error('External operation failed');
    if (operation === 'read') reader.findById.mockRejectedValue(error);
    if (operation === 'email') emails.findByEmail.mockRejectedValue(error);
    if (operation === 'clinic') clinics.requireExisting.mockRejectedValue(error);
    if (operation === 'write') writer.update.mockRejectedValue(error);
    await expect(useCase.execute(existing.id, {
      email: 'new@example.com', clinic_id: '1ed1cd29-ef1d-4814-bad9-86d91744c7cb'
    })).rejects.toThrow(error);
    if (operation !== 'write') expect(writer.update).not.toHaveBeenCalled();
  });
});
