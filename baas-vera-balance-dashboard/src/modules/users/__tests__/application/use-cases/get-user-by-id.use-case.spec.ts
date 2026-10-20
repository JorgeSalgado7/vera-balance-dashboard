import { GetUserByIdUseCase } from '../../../application/use-cases/get-user-by-id.use-case';
import { UserAccessDeniedError, UserNotFoundError } from '../../../domain/errors/user.error';
import { actor, targetId, makeUser, setupUseCases } from '../../fixtures/user-use-cases.fixture';

describe('GetUserByIdUseCase', () => {
  let fixture: Awaited<ReturnType<typeof setupUseCases>>;
  beforeEach(async () => { fixture = await setupUseCases(); });
  afterEach(async () => { await fixture.module.close(); });

  it('allows an administrator to read same-clinic users without exposing credentials', async () => {
    const result = await fixture.module.get(GetUserByIdUseCase).execute(actor, targetId);
    expect(result.id).toBe(targetId);
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('pk');
  });

  it('allows a therapist to read only their own profile', async () => {
    const therapist = { ...actor, id: targetId, role: 'therapist' as const };
    await expect(fixture.module.get(GetUserByIdUseCase).execute(therapist, targetId)).resolves.toHaveProperty('id', targetId);
    await expect(fixture.module.get(GetUserByIdUseCase).execute(therapist, actor.id)).rejects.toThrow(UserAccessDeniedError);
  });

  it.each([null, makeUser({ clinicId: 'different-clinic' })])('conceals missing and foreign-clinic users alike', async target => {
    fixture.users.findById.mockResolvedValue(target);
    await expect(fixture.module.get(GetUserByIdUseCase).execute(actor, targetId)).rejects.toThrow(UserNotFoundError);
  });
});
