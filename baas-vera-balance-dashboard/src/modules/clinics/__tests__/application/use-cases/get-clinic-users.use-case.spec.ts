import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), {
  pk: 'clinic-id', gsi1sk: 'CLINIC#clinic-id', name: 'Clínica', logo: null, address: 'Centro',
  phone_number: '555', therapy_types: ['therapy-id'], status: 'Activo',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
})
import { GetClinicUsersUseCase } from '../../../application/use-cases/get-clinic-users.use-case'
import type { GetUsersByClinicUseCase } from '../../../../users/application/use-cases/get-users-by-clinic.use-case'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'
import { ClinicNotFoundError } from '../../../domain/errors/clinic.error'
describe('GetClinicUsersUseCase', () => {
  const repository = { findById: jest.fn() }
  const users = { execute: jest.fn() }
  const useCase = new GetClinicUsersUseCase(repository as unknown as IClinicRepository, users as unknown as GetUsersByClinicUseCase)
  beforeEach(() => { jest.resetAllMocks(); repository.findById.mockResolvedValue(clinic()) })
  it('returns every linked user without filtering roles', async () => {
    const linked = ['admin', 'clinic', 'therapist'].map(role => ({ id: `user-${role}`, clinic: 'clinic-id', name: role, role }))
    users.execute.mockResolvedValue(linked)
    expect(await useCase.execute('clinic-id')).toEqual(linked)
    expect(users.execute).toHaveBeenCalledWith("clinic-id")
  })
  it('rejects a nonexistent clinic before querying users', async () => {
    repository.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute('clinic-id')).rejects.toBeInstanceOf(ClinicNotFoundError)
    expect(users.execute).not.toHaveBeenCalled()
  })
  it('returns an empty list for a clinic without users', async () => { users.execute.mockResolvedValue([]); expect(await useCase.execute('clinic-id')).toEqual([]) })
})
