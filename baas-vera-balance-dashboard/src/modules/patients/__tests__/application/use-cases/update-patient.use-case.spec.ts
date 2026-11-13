import { patient, patientInput } from '../../fixtures/patient.fixture'
import type { IPatientRepository } from '../../../domain/repositories/patient.repository'
import type { ClinicExistsUseCase } from '../../../../clinics/application/use-cases/clinic-exists.use-case'
import { ValidatePatientDomainService } from '../../../domain/services/validate-patient.domain-service'
import { UpdatePatientUseCase } from '../../../application/use-cases/update-patient.use-case'
import { UpdatePatientDomainService } from '../../../domain/services/update-patient.domain-service'
import { PatientNotFoundError, EmptyPatientUpdateError, InvalidPatientUpdateFieldsError, InvalidPatientFieldError } from '../../../domain/errors/patient.error'

describe('UpdatePatientUseCase', () => {
  const repository = { findById: jest.fn(), update: jest.fn(async (entity, changes, updated_at) => ({ ...entity, ...changes, updated_at })) }
  const useCase = new UpdatePatientUseCase(repository as unknown as IPatientRepository, new UpdatePatientDomainService(new ValidatePatientDomainService()))
  beforeEach(() => { jest.clearAllMocks(); repository.findById.mockResolvedValue(patient()) })
  afterEach(() => jest.restoreAllMocks())
  it('updates supplied fields and updated_at while preserving clinic and created_at', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1794483000000)
    const result = await useCase.execute('patient-id', { name: ' Nueva ', guardian: null, partner_data: null, phone_number: null })
    expect(repository.update).toHaveBeenCalledWith(patient(), { name: 'Nueva', guardian: null, partner_data: null, phone_number: null }, new Date(1794483000000).toISOString())
    expect(result).toMatchObject({ name: 'Nueva', clinic: 'clinic-id', created_at: patient().created_at, birthday: patient().birthday })
    expect(result).not.toHaveProperty('pk')
  })
  it.each(['clinic', 'id', 'pk', 'sk', 'gsi1pk', 'gsi2pk', 'created_at', 'updated_at', 'status'])('rejects immutable or unknown field %s', async field => {
    await expect(useCase.execute('patient-id', { [field]: 'changed' })).rejects.toBeInstanceOf(InvalidPatientUpdateFieldsError)
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('rejects an empty patch', async () => { await expect(useCase.execute('patient-id', {})).rejects.toBeInstanceOf(EmptyPatientUpdateError); expect(repository.update).not.toHaveBeenCalled() })
  it('rejects a nonexistent patient', async () => { repository.findById.mockResolvedValue(null); await expect(useCase.execute('missing', { name: 'Nueva' })).rejects.toBeInstanceOf(PatientNotFoundError) })
  it.each([{ birthday: '2025-02-29' }, { guardian: { name: 'Tutor' } }, { partner_data: [] }, { name: null }])('rejects invalid changes %j without writing', async changes => {
    await expect(useCase.execute('patient-id', changes as never)).rejects.toBeInstanceOf(InvalidPatientFieldError)
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('propagates failed writes', async () => { repository.update.mockRejectedValueOnce(new Error('database unavailable')); await expect(useCase.execute('patient-id', { name: 'Nueva' })).rejects.toThrow('database unavailable') })
})
