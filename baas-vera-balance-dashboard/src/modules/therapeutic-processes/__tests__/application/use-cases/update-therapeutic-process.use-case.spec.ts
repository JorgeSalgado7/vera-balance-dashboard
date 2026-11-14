import { dependencies, processEntity, input } from '../../fixtures/process.fixture'
import { UpdateTherapeuticProcessUseCase } from '../../../application/use-cases/update-therapeutic-process.use-case'
import { UpdateTherapeuticProcessDomainService } from '../../../domain/services/update-therapeutic-process.domain-service'
import { ValidateTherapeuticProcessDomainService } from '../../../domain/services/validate-therapeutic-process.domain-service'
import { TherapeuticProcessNotFoundError, EmptyTherapeuticProcessUpdateError, InvalidTherapeuticProcessUpdateFieldsError, InvalidTherapyPatientCountError } from '../../../domain/errors/therapeutic-process.error'

describe('UpdateTherapeuticProcessUseCase', () => {
  const setup = () => { const deps = dependencies(); return { ...deps, useCase: new UpdateTherapeuticProcessUseCase(deps.repository, deps.validator, new UpdateTherapeuticProcessDomainService(new ValidateTherapeuticProcessDomainService())) } }
  it('updates supplied fields, preserving clinic, created_at and status', async () => {
    const deps = setup(); const result = await deps.useCase.execute('process-id', { goals: ' Nuevos ', is_first_time: true })
    expect(deps.repository.update).toHaveBeenCalledWith(processEntity(), { goals: 'Nuevos', is_first_time: true }, expect.any(String))
    expect(result).toMatchObject({ goals: 'Nuevos', is_first_time: true, clinic: 'clinic-id', status: 'Activo', created_at: processEntity().created_at })
  })
  it.each(['clinic', 'status', 'pk', 'id', 'created_at', 'updated_at', 'gsi3pk'])('rejects protected %s', async field => { const deps = setup(); await expect(deps.useCase.execute('process-id', { [field]: 'changed' })).rejects.toBeInstanceOf(InvalidTherapeuticProcessUpdateFieldsError); expect(deps.repository.update).not.toHaveBeenCalled() })
  it('rejects an empty update', async () => { const deps = setup(); await expect(deps.useCase.execute('process-id', {})).rejects.toBeInstanceOf(EmptyTherapeuticProcessUpdateError) })
  it('rejects a missing process', async () => { const deps = setup(); deps.repository.findById.mockResolvedValue(null); await expect(deps.useCase.execute('missing', { goals: 'New' })).rejects.toBeInstanceOf(TherapeuticProcessNotFoundError) })
  it('revalidates the new type with the resulting patient selection before writing', async () => { const deps = setup(); deps.therapyTypes.execute.mockResolvedValue([{ id: 'pair-id', name: 'Pareja', icon: null, created_at: '', updated_at: '' }]); await expect(deps.useCase.execute('process-id', { therapy_type: 'pair-id' })).rejects.toBeInstanceOf(InvalidTherapyPatientCountError); expect(deps.repository.update).not.toHaveBeenCalled() })
  it('passes new patients to the transactional repository operation', async () => { const deps = setup(); expect((await deps.useCase.execute('process-id', { patients: ['other-patient'] })).patients).toEqual([{ id: 'other-patient', name: 'Paciente' }]); expect(deps.repository.update).toHaveBeenCalledWith(processEntity(), { patients: ['other-patient'] }, expect.any(String)) })
})
