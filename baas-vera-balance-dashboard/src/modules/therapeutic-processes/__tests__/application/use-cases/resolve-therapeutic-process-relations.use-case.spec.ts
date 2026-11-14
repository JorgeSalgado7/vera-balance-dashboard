import { dependencies, processEntity } from '../../fixtures/process.fixture'
import { TherapeuticProcessReferenceNotFoundError } from '../../../domain/errors/therapeutic-process.error'

describe('ResolveTherapeuticProcessRelationsUseCase', () => {
  it('deduplicates IDs across processes and delegates each batch to its owning module', async () => {
    const deps = dependencies()
    const result = await deps.resolver.execute([processEntity(), { ...processEntity(), pk: 'other', patients: ['patient-id', 'other-patient'] }])
    expect(deps.therapyTypes.execute).toHaveBeenCalledWith(['therapy-id'])
    expect(deps.users.execute).toHaveBeenCalledWith(['therapist-id'])
    expect(deps.patients.execute).toHaveBeenCalledWith(['patient-id', 'other-patient'])
    expect(result.patients).toHaveLength(2)
  })
  it.each(['therapy_type', 'therapist', 'patients'])('rejects an unresolved %s reference', async field => {
    const deps = dependencies()
    if (field === 'therapy_type') deps.therapyTypes.execute.mockResolvedValue([])
    if (field === 'therapist') deps.users.execute.mockResolvedValue([])
    if (field === 'patients') deps.patients.execute.mockResolvedValue([])
    await expect(deps.resolver.execute([processEntity()])).rejects.toMatchObject({ field })
  })
  it('supports empty process lists', async () => { const deps = dependencies(); expect(await deps.resolver.execute([])).toEqual({ therapyTypes: [], therapists: [], patients: [] }) })
  it('propagates a failed batch rather than returning partial relationships', async () => { const deps = dependencies(); deps.patients.execute.mockRejectedValue(new Error('batch incomplete')); await expect(deps.resolver.execute([processEntity()])).rejects.toThrow('batch incomplete') })
})
