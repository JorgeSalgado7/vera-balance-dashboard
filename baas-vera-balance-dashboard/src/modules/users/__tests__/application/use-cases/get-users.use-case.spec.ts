import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case';
import { UserAccessDeniedError } from '../../../domain/errors/user.error';
import { actor, clinicId, setupUseCases } from '../../fixtures/user-use-cases.fixture';

describe('GetUsersUseCase', () => {
  let fixture: Awaited<ReturnType<typeof setupUseCases>>;
  beforeEach(async () => { fixture = await setupUseCases(); });
  afterEach(async () => { await fixture.module.close(); });

  it('queries only the authenticated clinic and returns public users without any writes', async () => {
    const response = await fixture.module.get(GetUsersUseCase).execute(actor);
    expect(fixture.list.findByClinicId).toHaveBeenCalledWith(clinicId);
    expect(response).toHaveLength(2);
    expect(JSON.stringify(response)).not.toContain('stored-password-hash');
    expect(fixture.update.update).not.toHaveBeenCalled();
    expect(fixture.change.change).not.toHaveBeenCalled();
    expect(fixture.create.create).not.toHaveBeenCalled();
  });

  it('returns an empty array when no authorized users exist', async () => {
    fixture.list.findByClinicId.mockResolvedValue([]);
    await expect(fixture.module.get(GetUsersUseCase).execute(actor)).resolves.toEqual([]);
  });

  it.each([{ ...actor, role: 'therapist' as const }, { ...actor, status: 'inactive' as const }])(
    'rejects unauthorized readers', async identity => {
      await expect(fixture.module.get(GetUsersUseCase).execute(identity)).rejects.toThrow(UserAccessDeniedError);
      expect(fixture.list.findByClinicId).not.toHaveBeenCalled();
    }
  );
});
