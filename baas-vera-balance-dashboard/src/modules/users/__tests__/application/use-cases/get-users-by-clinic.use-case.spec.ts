import { GetUsersByClinicUseCase } from '../../../application/use-cases/get-users-by-clinic.use-case'
import { UserEntity } from '../../../domain/entities/user.entity'

describe('GetUsersByClinicUseCase', () => {
  const repository = { findByClinic: jest.fn() }
  const useCase = new GetUsersByClinicUseCase(repository)
  beforeEach(() => jest.resetAllMocks())
  it('queries the requested clinic and excludes persistence keys, password and recovery fields', async () => {
    repository.findByClinic.mockResolvedValue([Object.assign(new UserEntity(), { pk: 'user-id', name: 'Terapeuta', email: 'user@example.com', role: 'therapist', clinic: 'clinic-id', password: 'private', password_recovery_code_hash: 'private', created_at: '2026-11-12T10:30:00.000Z', updated_at: '2026-11-12T10:30:00.000Z' })])
    const [user] = await useCase.execute('clinic-id')
    expect(repository.findByClinic).toHaveBeenCalledWith('clinic-id')
    expect(user).toMatchObject({ id: 'user-id', clinic: 'clinic-id', email: 'user@example.com' })
    expect(Object.keys(user)).toEqual(['id', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at'])
  })
  it('returns an empty list without users', async () => { repository.findByClinic.mockResolvedValue([]); expect(await useCase.execute('clinic-id')).toEqual([]) })
  it('propagates database errors', async () => { repository.findByClinic.mockRejectedValue(new Error('network')); await expect(useCase.execute('clinic-id')).rejects.toThrow('network') })
})
