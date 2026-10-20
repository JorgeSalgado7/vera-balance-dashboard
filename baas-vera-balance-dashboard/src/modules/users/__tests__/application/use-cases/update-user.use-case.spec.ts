import { UpdateUserUseCase } from '../../../application/use-cases/update-user.use-case';
import { LastActiveAdministratorError, UserAccessDeniedError, UserEmailAlreadyExistsError, UserNotFoundError } from '../../../domain/errors/user.error';
import { actor, targetId, makeUser, setupUseCases } from '../../fixtures/user-use-cases.fixture';

describe('UpdateUserUseCase', () => {
  let fixture: Awaited<ReturnType<typeof setupUseCases>>;
  beforeEach(async () => { fixture = await setupUseCases(); });
  afterEach(async () => { await fixture.module.close(); });

  it('performs partial updates while preserving clinic, password, status and creation time', async () => {
    const current = makeUser();
    await fixture.module.get(UpdateUserUseCase).execute(actor, targetId, { name: 'Updated' });
    const [snapshot, next] = fixture.update.update.mock.calls[0];
    expect(snapshot).toEqual(current);
    expect(next).toMatchObject({
      name: 'Updated', email: current.email, professionalLicense: current.professionalLicense,
      passwordHash: current.passwordHash, clinicId: current.clinicId, status: current.status,
      role: current.role, createdAt: current.createdAt
    });
    expect(next.updatedAt).not.toBe(current.updatedAt);
    expect(fixture.passwords.hash).not.toHaveBeenCalled();
  });

  it('accepts an identical normalized email without changing timestamps or querying duplicates', async () => {
    const result = await fixture.module.get(UpdateUserUseCase).execute(actor, targetId, { email: ' USER@EXAMPLE.COM ' });
    expect(result.updated_at).toBe(makeUser().updatedAt);
    expect(fixture.emails.findByEmail).not.toHaveBeenCalled();
    expect(fixture.update.update).not.toHaveBeenCalled();
  });

  it.each([
    { name: '' }, { name: null }, { email: 'invalid' }, { email: null },
    { professional_license: '' }, { professional_license: null }, { role: 'admin' }, { role: null }
  ])('rejects invalid supplied values %j before any write', async changes => {
    await expect(fixture.module.get(UpdateUserUseCase).execute(actor, targetId, changes as never))
      .rejects.toBeInstanceOf(Error);
    expect(fixture.update.update).not.toHaveBeenCalled();
  });

  it('rejects a new email already assigned to another user', async () => {
    fixture.emails.findByEmail.mockResolvedValue(makeUser({ id: 'other' }));
    await expect(fixture.module.get(UpdateUserUseCase).execute(actor, targetId, { email: 'other@example.com' }))
      .rejects.toThrow(UserEmailAlreadyExistsError);
    expect(fixture.update.update).not.toHaveBeenCalled();
  });

  it('allows therapists to update their own permitted fields but rejects all role requests', async () => {
    const therapist = { ...actor, id: targetId, role: 'therapist' as const };
    await fixture.module.get(UpdateUserUseCase).execute(therapist, targetId, { professional_license: 'updated' });
    await expect(fixture.module.get(UpdateUserUseCase).execute(therapist, targetId, { role: 'therapist' }))
      .rejects.toThrow(UserAccessDeniedError);
    await expect(fixture.module.get(UpdateUserUseCase).execute(therapist, actor.id, { name: 'Other' }))
      .rejects.toThrow(UserAccessDeniedError);
  });

  it.each([null, makeUser({ clinicId: 'different' })])('rejects missing and foreign-clinic users', async user => {
    fixture.users.findById.mockResolvedValue(user);
    await expect(fixture.module.get(UpdateUserUseCase).execute(actor, targetId, { name: 'Updated' }))
      .rejects.toThrow(UserNotFoundError);
    expect(fixture.update.update).not.toHaveBeenCalled();
  });

  it('rejects demotion of the last active administrator', async () => {
    fixture.users.findById.mockResolvedValue(makeUser({ ...actor }));
    fixture.list.findByClinicId.mockResolvedValue([makeUser({ ...actor })]);
    await expect(fixture.module.get(UpdateUserUseCase).execute(actor, actor.id, { role: 'therapist' }))
      .rejects.toThrow(LastActiveAdministratorError);
    expect(fixture.update.update).not.toHaveBeenCalled();
  });

  it('passes an active same-clinic administrator witness to the atomic role change', async () => {
    const witness = makeUser({ role: 'clinic' });
    fixture.users.findById.mockResolvedValue(makeUser({ ...actor }));
    fixture.list.findByClinicId.mockResolvedValue([makeUser({ ...actor }), witness]);
    await fixture.module.get(UpdateUserUseCase).execute(actor, actor.id, { role: 'therapist' });
    expect(fixture.update.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: actor.id }), expect.objectContaining({ role: 'therapist' }), actor, witness
    );
  });
});
