import { patient, patientInput } from '../../fixtures/patient.fixture'
import type { IPatientRepository } from '../../../domain/repositories/patient.repository'
import type { ClinicExistsUseCase } from '../../../../clinics/application/use-cases/clinic-exists.use-case'
import { ValidatePatientDomainService } from '../../../domain/services/validate-patient.domain-service'
import { CreatePatientUseCase } from '../../../application/use-cases/create-patient.use-case'
import { CreatePatientDomainService } from '../../../domain/services/create-patient.domain-service'
import { InvalidPatientFieldError, PatientClinicNotFoundError } from '../../../domain/errors/patient.error'

describe('CreatePatientUseCase', () => {
  const repository = { create: jest.fn(async entity => entity) }
  const clinics = { execute: jest.fn() }
  const useCase = new CreatePatientUseCase(repository as unknown as IPatientRepository, clinics as unknown as ClinicExistsUseCase, new CreatePatientDomainService(new ValidatePatientDomainService()))
  beforeEach(() => { jest.clearAllMocks(); clinics.execute.mockResolvedValue(true) })
  afterEach(() => jest.restoreAllMocks())
  it('generates the documented keys, null defaults and the same ISO timestamps without exposing persistence fields', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1794483000000)
    const result = await useCase.execute({ ...patientInput, name: ' Paciente ' })
    const entity = repository.create.mock.calls[0][0]
    expect(entity).toMatchObject({ sk: 'PATIENT', gsi1pk: 'PATIENT', gsi1sk: `PATIENT#${result.id}`, gsi2pk: 'CLINIC#clinic-id', gsi2sk: `PATIENT#${result.id}` })
    expect(result).toMatchObject({ name: 'Paciente', birthday: '2000-01-31', guardian: null, phone_number: null, partner_data: null, created_at: new Date(1794483000000).toISOString(), updated_at: new Date(1794483000000).toISOString() })
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(result).not.toHaveProperty('pk')
    expect(result).not.toHaveProperty('gsi2pk')
  })
  it('rejects a missing clinic before persistence', async () => {
    clinics.execute.mockResolvedValue(false)
    await expect(useCase.execute(patientInput)).rejects.toBeInstanceOf(PatientClinicNotFoundError)
    expect(repository.create).not.toHaveBeenCalled()
  })
  it.each(['clinic', 'name', 'birthday', 'gender', 'educational_level', 'occupation', 'marital_status', 'religion', 'address'])('rejects missing %s without writing', async field => {
    await expect(useCase.execute({ ...patientInput, [field]: undefined })).rejects.toBeInstanceOf(InvalidPatientFieldError)
    expect(repository.create).not.toHaveBeenCalled()
  })
  it('stores optional nested details without creating other patients or processes', async () => {
    const guardian = { name: 'Tutor', phone_number: '555', relationship: 'Madre' }
    const partner_data = { name: 'Pareja', relationship_time: '2 años', occupation: 'Docente' }
    expect(await useCase.execute({ ...patientInput, guardian, partner_data })).toMatchObject({ guardian, partner_data })
    expect(repository.create).toHaveBeenCalledTimes(1)
  })
  it('does not write when clinic verification fails', async () => {
    clinics.execute.mockRejectedValueOnce(new Error('database unavailable'))
    await expect(useCase.execute(patientInput)).rejects.toThrow('database unavailable')
    expect(repository.create).not.toHaveBeenCalled()
  })
})
