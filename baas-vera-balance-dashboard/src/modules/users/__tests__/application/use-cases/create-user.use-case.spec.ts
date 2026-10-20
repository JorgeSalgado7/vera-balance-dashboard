import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { UserAccessDeniedError, UserEmailAlreadyExistsError } from '../../../domain/errors/user.error';
import { actor, clinicId, createInput, makeUser, setupUseCases } from '../../fixtures/user-use-cases.fixture';

describe('CreateUserUseCase', () => {
  let fixture: Awaited<ReturnType<typeof setupUseCases>>;
  beforeEach(async () => { fixture = await setupUseCases(); });
  afterEach(async () => { await fixture.module.close(); });

  it('normalizes email, generates UUID/audit dates, hashes credentials, and returns only public data', async () => {
    const response = await fixture.module.get(CreateUserUseCase).execute(actor, { ...createInput, email: ' NEW@EXAMPLE.COM ' });
    expect(response.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.status).toBe('active');
    expect(response.clinic).toEqual({ id: clinicId });
    expect(response.created_at).toBe(response.updated_at);
    expect(fixture.emails.findByEmail).toHaveBeenCalledWith('new@example.com');
    const saved = fixture.create.create.mock.calls[0][0];
    expect(saved.passwordHash).toBe('secure-new-hash');
    expect(saved).not.toHaveProperty('password_confirmation');
    expect(saved).not.toHaveProperty('password');
    expect(Object.keys(response).sort()).toEqual([
      'clinic', 'created_at', 'email', 'id', 'name', 'professional_license', 'role', 'status', 'updated_at'
    ]);
    expect(JSON.stringify(response)).not.toContain('secure-new-hash');
  });

  it.each([
    { ...actor, role: 'therapist' as const },
    { ...actor, status: 'inactive' as const }
  ])('rejects an unauthorized administrator before hashing or writing', async identity => {
    await expect(fixture.module.get(CreateUserUseCase).execute(identity, createInput)).rejects.toThrow(UserAccessDeniedError);
    expect(fixture.passwords.hash).not.toHaveBeenCalled();
    expect(fixture.create.create).not.toHaveBeenCalled();
  });

  it('rejects an explicit different clinic and never uses client input to assign ownership', async () => {
    await expect(fixture.module.get(CreateUserUseCase).execute(actor, { ...createInput, clinic_id: 'another-clinic' }))
      .rejects.toThrow(UserAccessDeniedError);
    expect(fixture.create.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate email before hashing', async () => {
    fixture.emails.findByEmail.mockResolvedValue(makeUser());
    await expect(fixture.module.get(CreateUserUseCase).execute(actor, createInput)).rejects.toThrow(UserEmailAlreadyExistsError);
    expect(fixture.passwords.hash).not.toHaveBeenCalled();
    expect(fixture.create.create).not.toHaveBeenCalled();
  });

  it.each([
    { name: ' ' }, { email: 'invalid-email' }, { professional_license: '' },
    { role: 'admin' }, { password: 'short', password_confirmation: 'short' },
    { password_confirmation: 'different' }, { password: null }
  ])('validates invalid fields %j before hashing or any creation', async changes => {
    await expect(fixture.module.get(CreateUserUseCase).execute(actor, { ...createInput, ...changes } as typeof createInput))
      .rejects.toBeInstanceOf(Error);
    expect(fixture.passwords.hash).not.toHaveBeenCalled();
    expect(fixture.create.create).not.toHaveBeenCalled();
  });

  it('does not persist if hashing fails', async () => {
    fixture.passwords.hash.mockRejectedValue(new Error('Hashing unavailable'));
    await expect(fixture.module.get(CreateUserUseCase).execute(actor, createInput)).rejects.toThrow('Hashing unavailable');
    expect(fixture.create.create).not.toHaveBeenCalled();
  });
});
