import { dependencies, processEntity, input } from '../../fixtures/process.fixture'
import { GetTherapeuticProcessByIdUseCase } from '../../../application/use-cases/get-therapeutic-process-by-id.use-case'
import { TherapeuticProcessNotFoundError, TherapeuticProcessReferenceNotFoundError } from '../../../domain/errors/therapeutic-process.error'
import type { ClinicExistsUseCase } from '../../../../clinics/application/use-cases/clinic-exists.use-case'
import type { FindPatientsByIdsUseCase } from '../../../../patients/application/use-cases/find-patients-by-ids.use-case'

describe('GetTherapeuticProcessByIdUseCase', () => {
  it('returns public relation objects without credentials or persistence keys', async () => {
    const deps = dependencies(); const useCase = new GetTherapeuticProcessByIdUseCase(deps.repository, deps.resolver)
    const response = await useCase.execute('requested-id')
    const result = response
    expect(result.therapy_type).toEqual({ id: 'therapy-id', name: 'Individual', icon: null })
    expect(result.therapist).toEqual({ id: 'therapist-id', name: 'Terapeuta', professional_license: '123' })
    expect(result.patients).toEqual([{ id: 'patient-id', name: 'Paciente' }])
    expect(result).not.toHaveProperty('pk')
    expect(deps.repository.findById).toHaveBeenCalledWith('requested-id')
  })
  it('rejects a nonexistent process', async () => { const deps = dependencies(); deps.repository.findById.mockResolvedValue(null); await expect(new GetTherapeuticProcessByIdUseCase(deps.repository, deps.resolver).execute('missing')).rejects.toBeInstanceOf(TherapeuticProcessNotFoundError) })
})
