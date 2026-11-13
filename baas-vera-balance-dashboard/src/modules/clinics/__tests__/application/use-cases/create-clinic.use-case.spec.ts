import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), {
  pk: 'clinic-id', gsi1sk: 'CLINIC#clinic-id', name: 'Clínica', logo: null, address: 'Centro',
  phone_number: '555', therapy_types: ['therapy-id'], status: 'Activo',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
})
import { CreateClinicUseCase } from '../../../application/use-cases/create-clinic.use-case'
import { CreateClinicDomainService } from '../../../domain/services/create-clinic.domain-service'
import { ValidateCreateClinicDomainService } from '../../../domain/services/validate-create-clinic.domain-service'
import { InvalidClinicFieldError, InvalidClinicTherapyTypesError } from '../../../domain/errors/clinic.error'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'
import type { ResolveClinicTherapyTypesUseCase } from '../../../application/use-cases/resolve-clinic-therapy-types.use-case'

describe('CreateClinicUseCase', () => {
  const repository = { create: jest.fn(async entity => entity) }
  const therapies = { execute: jest.fn() }
  const useCase = new CreateClinicUseCase(new CreateClinicDomainService(new ValidateCreateClinicDomainService()), repository as unknown as IClinicRepository, therapies as unknown as ResolveClinicTherapyTypesUseCase)
  const input = { name: ' Clínica ', address: ' Centro ', phone_number: ' 555 ', therapy_types: ['therapy-id'], status: 'Activo' as const }
  beforeEach(() => { jest.clearAllMocks(); therapies.execute.mockResolvedValue([{ id: 'therapy-id', name: 'Individual', icon: null }]) })
  afterEach(() => jest.restoreAllMocks())
  it('creates the documented keys, stores only therapy IDs and returns public details with the same ISO creation/update date', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1794483000000)
    const result = await useCase.execute(input)
    const saved = repository.create.mock.calls[0][0]
    expect(saved).toMatchObject({ sk: 'CLINIC', gsi1pk: 'CLINIC', gsi1sk: `CLINIC#${result.id}`, therapy_types: ['therapy-id'], logo: null })
    expect(result).toMatchObject({ name: 'Clínica', address: 'Centro', phone_number: '555', therapy_types: [{ id: 'therapy-id', name: 'Individual', icon: null }], created_at: new Date(1794483000000).toISOString(), updated_at: new Date(1794483000000).toISOString() })
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(result).not.toHaveProperty('pk')
  })
  it.each(['name', 'address', 'phone_number', 'therapy_types', 'status'])('rejects missing %s before persistence', async field => {
    await expect(useCase.execute({ ...input, [field]: undefined })).rejects.toBeInstanceOf(InvalidClinicFieldError)
    expect(repository.create).not.toHaveBeenCalled()
  })
  it('does not persist an unknown therapy reference', async () => {
    therapies.execute.mockRejectedValueOnce(new InvalidClinicTherapyTypesError())
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(InvalidClinicTherapyTypesError)
    expect(repository.create).not.toHaveBeenCalled()
  })
  it('propagates persistence failures', async () => {
    repository.create.mockRejectedValueOnce(new Error('database unavailable'))
    await expect(useCase.execute(input)).rejects.toThrow('database unavailable')
  })
})
