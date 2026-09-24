import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../../../application/dtos/create-user.dto';
import { CreateUserDomainService } from '../../../domain/services/create-user.domain-service';
import { ValidateUserDataDomainService } from '../../../domain/services/validate-user-data.domain-service';
import { ValidateUserRoleDomainService } from '../../../domain/services/validate-user-role.domain-service';
import {
  MissingUserNameError,
  MissingUserEmailError,
  InvalidUserEmailError,
  MissingUserPasswordError,
  MissingUserProfessionalLicenseError,
  MissingUserClinicError,
  InvalidUserClinicError,
  InvalidUserRoleError,
  UserEmailAlreadyExistsError
} from '../../../domain/errors/user.error';
import { ClinicNotFoundError } from '../../../../clinics/domain/errors/clinic.error';

const validDto: CreateUserDto = {
  name: 'Mónica Vera',
  email: 'monica@example.com',
  password: 'secret password',
  professional_license: '12345678',
  clinic_id: '7cb3a81a-e137-4ef4-aafd-6e387c8c7390',
  role: 'therapist'
};

describe('CreateUserUseCase', () => {
  let module: TestingModule;
  let useCase: CreateUserUseCase;
  const repository = { create: jest.fn() };
  const findRepository = { findByEmail: jest.fn() };
  const hasher = { hash: jest.fn() };
  const clinics = { requireExisting: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    repository.create.mockImplementation(async entity => entity);
    findRepository.findByEmail.mockResolvedValue(null);
    hasher.hash.mockResolvedValue('hashed-password');
    module = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        CreateUserDomainService,
        ValidateUserDataDomainService,
        ValidateUserRoleDomainService,
        { provide: 'ICreateUserRepository', useValue: repository },
        { provide: 'IFindUserByEmailRepository', useValue: findRepository },
        { provide: 'PasswordHasherPort', useValue: hasher },
        { provide: 'ClinicReaderPort', useValue: clinics }
      ]
    }).compile();
    useCase = module.get(CreateUserUseCase);
  });

  afterEach(async () => {
    await module.close();
  });

  it.each(['clinic', 'therapist'] as const)('should create an active %s with a unique UUID and public fields', async role => {
    const before = Date.now();
    const result = await useCase.execute({ ...validDto, role });
    const second = await useCase.execute({ ...validDto, email: 'another@example.com', role });

    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(result.id).not.toBe(second.id);
    expect(result).toEqual({
      id: expect.any(String), name: validDto.name, email: validDto.email,
      professional_license: validDto.professional_license,
      clinic: { id: validDto.clinic_id }, role, status: 'active',
      created_at: expect.any(String), updated_at: result.created_at
    });
    expect(Date.parse(result.created_at)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(result.created_at)).toBeLessThanOrEqual(Date.now());
    expect(clinics.requireExisting).toHaveBeenCalledWith(validDto.clinic_id);
    expect(findRepository.findByEmail).toHaveBeenCalledWith(validDto.email);
    expect(hasher.hash).toHaveBeenCalledWith(validDto.password);
    const saved = repository.create.mock.calls[0][0];
    expect(saved.passwordHash).toBe('hashed-password');
    expect(saved.clinicId).toBe(validDto.clinic_id);
    expect(JSON.stringify(saved)).not.toContain(validDto.password);
    expect(JSON.stringify(result)).not.toContain('hashed-password');
    expect(saved).not.toHaveProperty('pk');
    expect(saved).not.toHaveProperty('sk');
    expect(findRepository.findByEmail.mock.invocationCallOrder[0]).toBeLessThan(hasher.hash.mock.invocationCallOrder[0]);
    expect(hasher.hash.mock.invocationCallOrder[0]).toBeLessThan(repository.create.mock.invocationCallOrder[0]);
  });

  it.each([
    ['name', MissingUserNameError],
    ['email', MissingUserEmailError],
    ['password', MissingUserPasswordError],
    ['professional_license', MissingUserProfessionalLicenseError],
    ['clinic_id', MissingUserClinicError]
  ] as const)('should reject missing or empty %s before any repository operation', async (field, error) => {
    for (const value of ['', '  ', undefined, null, 123, {}]) {
      await expect(useCase.execute({ ...validDto, [field]: value })).rejects.toThrow(error);
    }
    expect(findRepository.findByEmail).not.toHaveBeenCalled();
    expect(clinics.requireExisting).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
    expect(hasher.hash).not.toHaveBeenCalled();
  });

  it.each([
    [{ email: 'invalid' }, InvalidUserEmailError],
    [{ clinic_id: 'invalid' }, InvalidUserClinicError],
    [{ role: 'admin' }, InvalidUserRoleError],
    [{ role: null }, InvalidUserRoleError],
    [{ role: undefined }, InvalidUserRoleError]
  ])('should reject invalid data before any repository operation', async (changes, error) => {
    await expect(useCase.execute({ ...validDto, ...changes } as CreateUserDto)).rejects.toThrow(error as typeof Error);
    expect(findRepository.findByEmail).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should reject a duplicate email before hashing or writing', async () => {
    findRepository.findByEmail.mockResolvedValue({ id: 'existing', status: 'inactive' });
    await expect(useCase.execute(validDto)).rejects.toThrow(UserEmailAlreadyExistsError);
    expect(hasher.hash).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should not persist a user for a missing clinic', async () => {
    clinics.requireExisting.mockRejectedValue(new ClinicNotFoundError());
    await expect(useCase.execute(validDto)).rejects.toThrow(ClinicNotFoundError);
    expect(repository.create).not.toHaveBeenCalled();
    expect(hasher.hash).not.toHaveBeenCalled();
  });

  it.each(['read', 'hash', 'write'])('should propagate %s failures', async operation => {
    const failure = new Error('External operation failed');
    if (operation === 'read') findRepository.findByEmail.mockRejectedValue(failure);
    if (operation === 'hash') hasher.hash.mockRejectedValue(failure);
    if (operation === 'write') repository.create.mockRejectedValue(failure);
    await expect(useCase.execute(validDto)).rejects.toThrow(failure);
    if (operation !== 'write') expect(repository.create).not.toHaveBeenCalled();
  });
});
