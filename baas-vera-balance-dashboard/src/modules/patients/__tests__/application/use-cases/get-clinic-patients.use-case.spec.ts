import { patient, patientInput } from '../../fixtures/patient.fixture'
import type { IPatientRepository } from '../../../domain/repositories/patient.repository'
import type { ClinicExistsUseCase } from '../../../../clinics/application/use-cases/clinic-exists.use-case'
import { ValidatePatientDomainService } from '../../../domain/services/validate-patient.domain-service'
import { GetClinicPatientsUseCase } from '../../../application/use-cases/get-clinic-patients.use-case'
import { PatientClinicNotFoundError } from '../../../domain/errors/patient.error'

describe('GetClinicPatientsUseCase', () => {
  const repository = { findByClinic: jest.fn() }
  const clinics = { execute: jest.fn() }
  const useCase = new GetClinicPatientsUseCase(repository as unknown as IPatientRepository, clinics as unknown as ClinicExistsUseCase)
  beforeEach(() => { jest.resetAllMocks(); clinics.execute.mockResolvedValue(true) })
  it('returns all patients associated with the requested clinic using only public fields', async () => {
    repository.findByClinic.mockResolvedValue([patient(), { ...patient(), pk: 'second-id' }])
    const result = await useCase.execute('clinic-id')
    expect(result).toHaveLength(2)
    expect(result[1]!.id).toBe('second-id')
    expect(result[0]).not.toHaveProperty('pk')
    expect(repository.findByClinic).toHaveBeenCalledWith('clinic-id')
  })
  it('returns an empty list for an existing clinic without patients', async () => { repository.findByClinic.mockResolvedValue([]); expect(await useCase.execute('clinic-id')).toEqual([]) })
  it('rejects missing clinics without reading patients', async () => { clinics.execute.mockResolvedValue(false); await expect(useCase.execute('missing')).rejects.toBeInstanceOf(PatientClinicNotFoundError); expect(repository.findByClinic).not.toHaveBeenCalled() })
  it('propagates database failures', async () => { repository.findByClinic.mockRejectedValue(new Error('network')); await expect(useCase.execute('clinic-id')).rejects.toThrow('network') })
})
