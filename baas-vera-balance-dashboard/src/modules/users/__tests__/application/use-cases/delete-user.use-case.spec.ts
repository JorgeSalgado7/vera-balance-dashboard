import { DeleteUserUseCase } from '../../../application/use-cases/delete-user.use-case';
import { ClinicUserCannotBeDeletedError, UserAccessDeniedError, UserNotFoundError } from '../../../domain/errors/user.error';
import { actor, targetId, makeUser, setupUseCases } from '../../fixtures/user-use-cases.fixture';

describe('DeleteUserUseCase', () => {
  let fixture: Awaited<ReturnType<typeof setupUseCases>>;
  beforeEach(async () => { fixture = await setupUseCases(); });
  afterEach(async () => { await fixture.module.close(); });

  it.each(['active', 'inactive'] as const)('physically deletes a %s therapist without consulting processes', async status => {
    const user = makeUser({ status });
    fixture.users.findById.mockResolvedValue(user);
    await expect(fixture.module.get(DeleteUserUseCase).execute(actor, targetId)).resolves.toBeUndefined();
    expect(fixture.remove.delete).toHaveBeenCalledWith(user, actor);
    expect(fixture.list.findByClinicId).not.toHaveBeenCalled();
    expect(fixture.change.change).not.toHaveBeenCalled();
  });

  it.each(['active', 'inactive'] as const)('rejects deletion of a %s clinic user even with another administrator', async status => {
    fixture.users.findById.mockResolvedValue(makeUser({ role: 'clinic', status }));
    await expect(fixture.module.get(DeleteUserUseCase).execute(actor, targetId)).rejects.toThrow(ClinicUserCannotBeDeletedError);
    expect(fixture.remove.delete).not.toHaveBeenCalled();
    expect(fixture.change.change).not.toHaveBeenCalled();
  });

  it('rejects therapist requests and administrator self deletion', async () => {
    await expect(fixture.module.get(DeleteUserUseCase).execute({ ...actor, role: 'therapist' }, targetId))
      .rejects.toThrow(UserAccessDeniedError);
    fixture.users.findById.mockResolvedValue(makeUser({ ...actor }));
    await expect(fixture.module.get(DeleteUserUseCase).execute(actor, actor.id)).rejects.toThrow(ClinicUserCannotBeDeletedError);
    expect(fixture.remove.delete).not.toHaveBeenCalled();
  });

  it('rejects inactive administrators', async () => {
    await expect(fixture.module.get(DeleteUserUseCase).execute({ ...actor, status: 'inactive' }, targetId))
      .rejects.toThrow(UserAccessDeniedError);
    expect(fixture.remove.delete).not.toHaveBeenCalled();
  });

  it.each([null, makeUser({ clinicId: 'different' })])('conceals missing and foreign-clinic targets', async user => {
    fixture.users.findById.mockResolvedValue(user);
    await expect(fixture.module.get(DeleteUserUseCase).execute(actor, targetId)).rejects.toThrow(UserNotFoundError);
    expect(fixture.remove.delete).not.toHaveBeenCalled();
  });
});
