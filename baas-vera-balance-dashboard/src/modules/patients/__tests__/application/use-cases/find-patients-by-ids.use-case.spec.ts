import { FindPatientsByIdsUseCase } from '../../../application/use-cases/find-patients-by-ids.use-case'
import { PatientEntity } from '../../../domain/entities/patient.entity'

describe('FindPatientsByIdsUseCase', () => {
  const repository = { findByIds: jest.fn() }
  beforeEach(() => jest.resetAllMocks())
  it('exposes public IDs and hides keys and credentials', async () => {
    repository.findByIds.mockResolvedValue([Object.assign(new PatientEntity(), { pk: 'id', name: 'Nombre', password: 'private', password_recovery_code_hash: 'private' })])
    const [item] = await new FindPatientsByIdsUseCase(repository).execute(['id'])
    expect(item).toMatchObject({ id: 'id', name: 'Nombre' })
    expect(item).not.toHaveProperty('pk'); expect(item).not.toHaveProperty('password'); expect(item).not.toHaveProperty('password_recovery_code_hash')
    expect(repository.findByIds).toHaveBeenCalledWith(['id'])
  })
})
