import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), {
  pk: 'clinic-id', gsi1sk: 'CLINIC#clinic-id', name: 'Clínica', logo: null, address: 'Centro',
  phone_number: '555', therapy_types: ['therapy-id'], status: 'Activo',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
})
import { UpdateClinicUseCase } from '../../../application/use-cases/update-clinic.use-case'
import { UpdateClinicDomainService } from '../../../domain/services/update-clinic.domain-service'
import { ValidateCreateClinicDomainService } from '../../../domain/services/validate-create-clinic.domain-service'
import { ClinicNotFoundError, EmptyClinicUpdateError, InvalidClinicUpdateFieldsError, InvalidClinicTherapyTypesError } from '../../../domain/errors/clinic.error'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'
import type { ResolveClinicTherapyTypesUseCase } from '../../../application/use-cases/resolve-clinic-therapy-types.use-case'

describe('UpdateClinicUseCase', () => {
  const repository = { findById: jest.fn(), update: jest.fn(async (entity, changes, updated_at) => ({ ...entity, ...changes, updated_at })) }
  const therapies = { execute: jest.fn() }
  const useCase = new UpdateClinicUseCase(new UpdateClinicDomainService(new ValidateCreateClinicDomainService()), repository as unknown as IClinicRepository, therapies as unknown as ResolveClinicTherapyTypesUseCase)
  beforeEach(() => { jest.clearAllMocks(); repository.findById.mockResolvedValue(clinic()); therapies.execute.mockResolvedValue([{ id: 'therapy-id', name: 'Individual', icon: null }]) })
  afterEach(() => jest.restoreAllMocks())
  it('changes only supplied fields, allows clearing logo and keeps created_at', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1794483000000)
    const result = await useCase.execute('clinic-id', { name: ' Nueva ', logo: null, status: 'Inactivo' })
    expect(repository.update).toHaveBeenCalledWith(clinic(), { name: 'Nueva', logo: null, status: 'Inactivo' }, new Date(1794483000000).toISOString())
    expect(result).toMatchObject({ name: 'Nueva', logo: null, status: 'Inactivo', created_at: clinic().created_at, address: 'Centro' })
  })
  it('allows removing all selected therapy types', async () => {
    therapies.execute.mockResolvedValueOnce([])
    expect((await useCase.execute('clinic-id', { therapy_types: [] })).therapy_types).toEqual([])
    expect(therapies.execute).toHaveBeenCalledWith([])
  })
  it('rejects an empty patch', async () => {
    await expect(useCase.execute('clinic-id', {})).rejects.toBeInstanceOf(EmptyClinicUpdateError)
    expect(repository.update).not.toHaveBeenCalled()
  })
  it.each(['pk', 'id', 'created_at', 'updated_at', 'gsi1pk'])('rejects immutable or unknown field %s', async field => {
    await expect(useCase.execute('clinic-id', { [field]: 'changed' })).rejects.toBeInstanceOf(InvalidClinicUpdateFieldsError)
    expect(repository.update).not.toHaveBeenCalled()
  })
  it('rejects a missing clinic', async () => {
    repository.findById.mockResolvedValueOnce(null)
    await expect(useCase.execute('missing', { name: 'Nueva' })).rejects.toBeInstanceOf(ClinicNotFoundError)
  })
  it('rejects unknown therapies without updating', async () => {
    therapies.execute.mockRejectedValueOnce(new InvalidClinicTherapyTypesError())
    await expect(useCase.execute('clinic-id', { therapy_types: ['missing'] })).rejects.toBeInstanceOf(InvalidClinicTherapyTypesError)
    expect(repository.update).not.toHaveBeenCalled()
  })
})
