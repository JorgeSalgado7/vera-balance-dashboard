import { patient, patientInput } from '../../fixtures/patient.fixture'
import type { IPatientRepository } from '../../../domain/repositories/patient.repository'
import type { ClinicExistsUseCase } from '../../../../clinics/application/use-cases/clinic-exists.use-case'
import { ValidatePatientDomainService } from '../../../domain/services/validate-patient.domain-service'
import { GetPatientByIdUseCase } from '../../../application/use-cases/get-patient-by-id.use-case'
import { PatientNotFoundError } from '../../../domain/errors/patient.error'

describe('GetPatientByIdUseCase', () => {
  const repository = { findById: jest.fn() }
  const useCase = new GetPatientByIdUseCase(repository as unknown as IPatientRepository)
  beforeEach(() => jest.resetAllMocks())
  it('returns only the complete documented public fields', async () => {
    repository.findById.mockResolvedValue(patient())
    const result = await useCase.execute('patient-id')
    expect(result).toEqual({ id: 'patient-id', ...patientInput, guardian: null, phone_number: null, partner_data: null, created_at: patient().created_at, updated_at: patient().updated_at })
    expect(repository.findById).toHaveBeenCalledWith('patient-id')
  })
  it('rejects a nonexistent patient', async () => { repository.findById.mockResolvedValue(null); await expect(useCase.execute('missing')).rejects.toBeInstanceOf(PatientNotFoundError) })
  it('propagates read errors', async () => { repository.findById.mockRejectedValue(new Error('network')); await expect(useCase.execute('patient-id')).rejects.toThrow('network') })
})
