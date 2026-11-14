import { dependencies, processEntity, input } from '../../fixtures/process.fixture'
import { GetPatientTherapeuticProcessesUseCase } from '../../../application/use-cases/get-patient-therapeutic-processes.use-case'
import { TherapeuticProcessNotFoundError, TherapeuticProcessReferenceNotFoundError } from '../../../domain/errors/therapeutic-process.error'
import type { ClinicExistsUseCase } from '../../../../clinics/application/use-cases/clinic-exists.use-case'
import type { FindPatientsByIdsUseCase } from '../../../../patients/application/use-cases/find-patients-by-ids.use-case'

describe('GetPatientTherapeuticProcessesUseCase', () => {
  it('returns public relation objects without credentials or persistence keys', async () => {
    const deps = dependencies(); const useCase = new GetPatientTherapeuticProcessesUseCase(deps.repository, deps.resolver, deps.patients as unknown as FindPatientsByIdsUseCase)
    const response = await useCase.execute('requested-id')
    const result = response[0]!
    expect(result.therapy_type).toEqual({ id: 'therapy-id', name: 'Individual', icon: null })
    expect(result.therapist).toEqual({ id: 'therapist-id', name: 'Terapeuta', professional_license: '123' })
    expect(result.patients).toEqual([{ id: 'patient-id', name: 'Paciente' }])
    expect(result).not.toHaveProperty('pk')
    expect(deps.repository.findByPatient).toHaveBeenCalledWith('requested-id')
  })
  it('returns an empty list for an existing parent without processes', async () => { const deps = dependencies(); deps.repository.findByPatient.mockResolvedValue([]); expect(await new GetPatientTherapeuticProcessesUseCase(deps.repository, deps.resolver, deps.patients as unknown as FindPatientsByIdsUseCase).execute('requested-id')).toEqual([]) })
  it('rejects a nonexistent parent without reading processes', async () => { const deps = dependencies(); deps.patients.execute.mockResolvedValue([]); await expect(new GetPatientTherapeuticProcessesUseCase(deps.repository, deps.resolver, deps.patients as unknown as FindPatientsByIdsUseCase).execute('missing')).rejects.toBeInstanceOf(TherapeuticProcessReferenceNotFoundError); expect(deps.repository.findByPatient).not.toHaveBeenCalled() })
})
