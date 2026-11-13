import { ClinicEntity } from '../../../domain/entities/clinic.entity'
const clinic = () => Object.assign(new ClinicEntity(), {
  pk: 'clinic-id', gsi1sk: 'CLINIC#clinic-id', name: 'Clínica', logo: null, address: 'Centro',
  phone_number: '555', therapy_types: ['therapy-id'], status: 'Activo',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z',
})
import { GetClinicsUseCase } from '../../../application/use-cases/get-clinics.use-case'
import { ClinicNotFoundError } from '../../../domain/errors/clinic.error'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'
import type { ResolveClinicTherapyTypesUseCase } from '../../../application/use-cases/resolve-clinic-therapy-types.use-case'
describe('GetClinicsUseCase', () => {
  const repository = { findAll: jest.fn() }
  const therapies = { execute: jest.fn() }
  const useCase = new GetClinicsUseCase(repository as unknown as IClinicRepository, therapies as unknown as ResolveClinicTherapyTypesUseCase)
  beforeEach(() => { jest.clearAllMocks(); repository.findAll.mockResolvedValue([clinic(), clinic()]); therapies.execute.mockResolvedValue([{ id: 'therapy-id', name: 'Individual', icon: null }]) })
  it('returns public clinic fields and complete therapy details', async () => {
    const response = await useCase.execute()
    const result = response[0]
    expect(result).toMatchObject({ id: 'clinic-id', therapy_types: [{ id: 'therapy-id', name: 'Individual', icon: null }] })
    expect(result).not.toHaveProperty('pk')
    expect(therapies.execute).toHaveBeenCalledWith(['therapy-id'])
  })
  it('returns an empty list', async () => {
    repository.findAll.mockResolvedValueOnce([])
    expect(await useCase.execute()).toEqual([])
  })
  it('propagates database failures', async () => {
    repository.findAll.mockRejectedValueOnce(new Error('database unavailable'))
    await expect(useCase.execute()).rejects.toThrow('database unavailable')
  })
})
