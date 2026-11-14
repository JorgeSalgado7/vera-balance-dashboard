import { dependencies, processEntity, input } from '../../fixtures/process.fixture'
import { CreateTherapeuticProcessUseCase } from '../../../application/use-cases/create-therapeutic-process.use-case'
import { CreateTherapeuticProcessDomainService } from '../../../domain/services/create-therapeutic-process.domain-service'
import { ValidateTherapeuticProcessDomainService } from '../../../domain/services/validate-therapeutic-process.domain-service'
import { TherapeuticProcessReferenceNotFoundError, InvalidTherapeuticProcessFieldError, InvalidTherapyPatientCountError } from '../../../domain/errors/therapeutic-process.error'

describe('CreateTherapeuticProcessUseCase', () => {
  const setup = () => { const deps = dependencies(); return { ...deps, useCase: new CreateTherapeuticProcessUseCase(deps.repository, deps.validator, new CreateTherapeuticProcessDomainService(new ValidateTherapeuticProcessDomainService())) } }
  afterEach(() => jest.restoreAllMocks())
  it('validates relationships, persists IDs and returns only public related fields with identical ISO timestamps', async () => {
    const { useCase, repository } = setup(); jest.spyOn(Date, 'now').mockReturnValue(1794483000000)
    const result = await useCase.execute(input)
    expect(repository.create.mock.calls[0][0]).toMatchObject({ sk: 'THERAPEUTIC_PROCESS', gsi2pk: 'CLINIC#clinic-id', gsi3pk: 'THERAPIST#therapist-id', therapy_type: 'therapy-id', therapist: 'therapist-id', patients: ['patient-id'] })
    expect(result).toMatchObject({ therapy_type: { id: 'therapy-id', name: 'Individual', icon: null }, therapist: { id: 'therapist-id', name: 'Terapeuta', professional_license: '123' }, patients: [{ id: 'patient-id', name: 'Paciente' }], is_first_time: false, created_at: new Date(1794483000000).toISOString(), updated_at: new Date(1794483000000).toISOString() })
    expect(Object.keys(result.therapist)).toEqual(['id', 'name', 'professional_license'])
    expect(result).not.toHaveProperty('pk')
  })
  it.each(['clinic', 'therapy_type', 'therapist', 'patients', 'is_first_time', 'consultation_reason', 'goals', 'status'])('rejects missing %s before writing', async field => {
    const { useCase, repository } = setup(); await expect(useCase.execute({ ...input, [field]: undefined })).rejects.toBeInstanceOf(InvalidTherapeuticProcessFieldError); expect(repository.create).not.toHaveBeenCalled()
  })
  it.each(['clinic', 'therapy_type', 'therapist', 'patients'])('rejects missing related %s', async field => {
    const deps = setup()
    if (field === 'clinic') deps.clinics.execute.mockResolvedValue(false)
    if (field === 'therapy_type') deps.therapyTypes.execute.mockResolvedValue([])
    if (field === 'therapist') deps.users.execute.mockResolvedValue([])
    if (field === 'patients') deps.patients.execute.mockResolvedValue([])
    await expect(deps.useCase.execute(input)).rejects.toBeInstanceOf(TherapeuticProcessReferenceNotFoundError)
    expect(deps.repository.create).not.toHaveBeenCalled()
  })
  it('applies cardinality from the stored type name, not from a client-supplied override', async () => {
    const deps = setup(); deps.therapyTypes.execute.mockResolvedValue([{ id: 'therapy-id', name: 'Pareja', icon: null, created_at: '', updated_at: '' }])
    await expect(deps.useCase.execute(input)).rejects.toBeInstanceOf(InvalidTherapyPatientCountError); expect(deps.repository.create).not.toHaveBeenCalled()
  })
  it('propagates storage failures', async () => { const deps = setup(); deps.repository.create.mockRejectedValue(new Error('network')); await expect(deps.useCase.execute(input)).rejects.toThrow('network') })
})
