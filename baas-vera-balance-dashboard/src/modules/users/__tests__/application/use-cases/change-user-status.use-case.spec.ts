import { ChangeUserStatusUseCase } from '../../../application/use-cases/change-user-status.use-case';
import { InvalidUserStatusError, LastActiveAdministratorError, UserAccessDeniedError, UserNotFoundError } from '../../../domain/errors/user.error';
import { actor, targetId, makeUser, setupUseCases } from '../../fixtures/user-use-cases.fixture';

describe('ChangeUserStatusUseCase', () => {
  let fixture: Awaited<ReturnType<typeof setupUseCases>>;
  beforeEach(async () => { fixture = await setupUseCases(); });
  afterEach(async () => { await fixture.module.close(); });

  it.each(['active', 'inactive'])('changes only status and updated_at when switching to %s', async status => {
    const current = makeUser({ status: status === 'active' ? 'inactive' : 'active' });
    fixture.users.findById.mockResolvedValue(current);
    const result = await fixture.module.get(ChangeUserStatusUseCase).execute(actor, targetId, status);
    const next = fixture.change.change.mock.calls[0][1];
    expect({ ...next, status: current.status, updatedAt: current.updatedAt }).toEqual({ ...current });
    expect(result.status).toBe(status);
    expect(result).not.toHaveProperty('passwordHash');
    expect(fixture.passwords.hash).not.toHaveBeenCalled();
    expect(fixture.remove.delete).not.toHaveBeenCalled();
  });

  it('confirms the current status without persistence or timestamp changes', async () => {
    const result = await fixture.module.get(ChangeUserStatusUseCase).execute(actor, targetId, 'active');
    expect(result.updated_at).toBe(makeUser().updatedAt);
    expect(fixture.change.change).not.toHaveBeenCalled();
  });

  it.each(['', 'blocked', null])('rejects invalid status %j', async status => {
    await expect(fixture.module.get(ChangeUserStatusUseCase).execute(actor, targetId, status as string))
      .rejects.toThrow(InvalidUserStatusError);
    expect(fixture.change.change).not.toHaveBeenCalled();
  });

  it('rejects therapists including changes to their own status', async () => {
    await expect(fixture.module.get(ChangeUserStatusUseCase).execute({ ...actor, id: targetId, role: 'therapist' }, targetId, 'inactive'))
      .rejects.toThrow(UserAccessDeniedError);
    expect(fixture.users.findById).not.toHaveBeenCalled();
  });

  it.each([null, makeUser({ clinicId: 'different' })])('rejects missing and foreign users', async user => {
    fixture.users.findById.mockResolvedValue(user);
    await expect(fixture.module.get(ChangeUserStatusUseCase).execute(actor, targetId, 'inactive')).rejects.toThrow(UserNotFoundError);
  });

  it('rejects deactivation when there is no other active administrator', async () => {
    fixture.users.findById.mockResolvedValue(makeUser({ ...actor }));
    fixture.list.findByClinicId.mockResolvedValue([makeUser({ ...actor }), makeUser({ role: 'clinic', status: 'inactive' })]);
    await expect(fixture.module.get(ChangeUserStatusUseCase).execute(actor, actor.id, 'inactive'))
      .rejects.toThrow(LastActiveAdministratorError);
    expect(fixture.change.change).not.toHaveBeenCalled();
  });
});
